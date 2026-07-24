import type { Request, Response } from "express";
import Konorano from "../models/Konorano.js";
import { clearCache } from "../middleware/cache.js";
import { sendNotification } from "./subscriberController.js";
import { revalidateFrontend } from "../utils/revalidate.js";
import { deleteOldFile, deleteFileIfExists } from "../utils/fileManager.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";
import type { UploadedFiles, OldFileRef } from "../types/upload.js";

const KONORANO_CACHE_LIST = "cache:/api/konoranos";
const KONORANO_CACHE_LIST_GLOB = "cache:/api/konoranos?*";

const invalidateKonoranoCache = async (id?: string): Promise<void> => {
  await clearCache(KONORANO_CACHE_LIST);
  await clearCache(KONORANO_CACHE_LIST_GLOB);
  if (id) {
    await clearCache(`cache:/api/konoranos/${id}`);
  }
  // Revalidate frontend (background, không block response)
  setImmediate(() => revalidateFrontend("konoranos"));
};

// Lấy tất cả konorano (với pagination)
export const getAllKonoranos = async (req: Request, res: Response) => {
  try {
    // page/limit đã được validatePagination sanitize (.toInt())
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [konoranos, total] = await Promise.all([
      Konorano.find().select("-__v").skip(skip).limit(limit).sort({ createdAt: -1 }),
      Konorano.countDocuments(),
    ]);

    res.json({
      konoranos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Lấy konorano theo ID
export const getKonoranoById = async (req: Request, res: Response) => {
  try {
    const konorano = await Konorano.findById(req.params.id);
    if (!konorano) {
      return notFoundResponse(res, "konorano");
    }
    res.json(konorano);
  } catch (err) {
    if (handleObjectIdError(err, res, "konorano")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Tạo konorano mới
export const createKonorano = async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles;
  // Multer đã ghi file lên disk trước khi handler chạy → cleanup nếu phía dưới fail
  const filesToCleanupOnError: string[] = [];
  if (files?.cover?.[0]) filesToCleanupOnError.push(files.cover[0].path);
  if (files?.konorano?.[0]) filesToCleanupOnError.push(files.konorano[0].path);

  try {
    const { name, author, releaseDate, viURL } = req.body;

    // Kiểm tra file upload
    if (!files || !files.cover || !files.konorano) {
      return validationErrorResponse(res, "Cần upload cả cover và file konorano");
    }

    const coverFile = files.cover[0];
    const konoranoFile = files.konorano[0];

    const newKonorano = new Konorano({
      name,
      author: author || "宝島社", // Sử dụng giá trị nhập hoặc mặc định
      coverImage: coverFile.filename,
      filePath: konoranoFile.filename,
      releaseDate,
      viURL,
    });

    const konorano = await newKonorano.save();

    // Save thành công → giữ file lại
    filesToCleanupOnError.length = 0;

    await invalidateKonoranoCache();

    // Gửi thông báo cho subscribers (background, không block response)
    setImmediate(() => sendNotification(name));

    res.json(konorano);
  } catch (err) {
    return serverErrorResponse(res, err);
  } finally {
    if (filesToCleanupOnError.length > 0) {
      await Promise.all(filesToCleanupOnError.map(deleteFileIfExists)).catch(() => {});
    }
  }
};

// Cập nhật konorano
export const updateKonorano = async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles;
  // File MỚI vừa upload — cleanup nếu downstream fail
  const newFilesToCleanupOnError: string[] = [];
  if (files?.cover?.[0]) newFilesToCleanupOnError.push(files.cover[0].path);
  if (files?.konorano?.[0]) newFilesToCleanupOnError.push(files.konorano[0].path);

  try {
    const { name, author, releaseDate, viURL } = req.body;

    // Kiểm tra konorano tồn tại
    const existingKonorano = await Konorano.findById(req.params.id);
    if (!existingKonorano) {
      return notFoundResponse(res, "konorano");
    }

    const konoranoFields: Record<string, unknown> = {
      name,
      releaseDate,
      viURL,
    };

    // Chỉ cập nhật author nếu có giá trị được cung cấp
    if (author) {
      konoranoFields.author = author;
    }

    // Đánh dấu các file cũ cần xóa (chỉ xóa SAU khi update DB thành công)
    const oldFilesToDelete: OldFileRef[] = [];

    // Kiểm tra nếu có file cover mới
    if (files && files.cover) {
      const coverFile = files.cover[0];
      konoranoFields.coverImage = coverFile.filename;
      if (existingKonorano.coverImage !== "default-cover.jpg") {
        oldFilesToDelete.push({ filename: existingKonorano.coverImage, type: "covers", def: "default-cover.jpg" });
      }
    }

    // Kiểm tra nếu có file konorano mới
    if (files && files.konorano) {
      const konoranoFile = files.konorano[0];
      konoranoFields.filePath = konoranoFile.filename;
      oldFilesToDelete.push({ filename: existingKonorano.filePath, type: "ebooks", def: null });
    }

    const updatedKonorano = await Konorano.findByIdAndUpdate(req.params.id, { $set: konoranoFields }, { new: true });

    // Update DB thành công → giữ file mới, xóa file cũ
    newFilesToCleanupOnError.length = 0;
    await Promise.all(oldFilesToDelete.map((f) => deleteOldFile(f.filename, f.type, f.def)));

    await invalidateKonoranoCache(String(req.params.id));

    res.json(updatedKonorano);
  } catch (err) {
    if (handleObjectIdError(err, res, "konorano")) {
      return;
    }
    return serverErrorResponse(res, err);
  } finally {
    if (newFilesToCleanupOnError.length > 0) {
      await Promise.all(newFilesToCleanupOnError.map(deleteFileIfExists)).catch(() => {});
    }
  }
};

// Xóa konorano
export const deleteKonorano = async (req: Request, res: Response) => {
  try {
    const konorano = await Konorano.findById(req.params.id);
    if (!konorano) {
      return notFoundResponse(res, "konorano");
    }

    // Xóa các file đi kèm (async)
    const deletePromises: Promise<boolean>[] = [];

    if (konorano.coverImage !== "default-cover.jpg") {
      deletePromises.push(deleteOldFile(konorano.coverImage, "covers", "default-cover.jpg"));
    }

    deletePromises.push(deleteOldFile(konorano.filePath, "ebooks"));

    // Xóa tất cả files song song
    await Promise.all(deletePromises);

    await Konorano.findByIdAndDelete(req.params.id);

    await invalidateKonoranoCache(String(req.params.id));

    res.json({ msg: "Konorano đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "konorano")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
