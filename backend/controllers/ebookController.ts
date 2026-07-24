import type { Request, Response } from "express";
import Ebook from "../models/Ebook.js";
import Publisher from "../models/Publisher.js";
import { clearCache } from "../middleware/cache.js";
import { sendNotification } from "./subscriberController.js";
import { revalidateFrontend } from "../utils/revalidate.js";
import { deleteOldFile, deleteFileIfExists } from "../utils/fileManager.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";
import type { UploadedFiles, OldFileRef } from "../types/upload.js";

const EBOOK_CACHE_LIST = "cache:/api/ebooks";
const EBOOK_CACHE_LIST_GLOB = "cache:/api/ebooks?*";

const invalidateEbookCache = async (id?: string): Promise<void> => {
  await clearCache(EBOOK_CACHE_LIST);
  await clearCache(EBOOK_CACHE_LIST_GLOB);
  if (id) {
    await clearCache(`cache:/api/ebooks/${id}`);
  }
  // Revalidate frontend (background, không block response)
  setImmediate(() => revalidateFrontend("ebooks"));
};

// Lấy tất cả ebook (với pagination)
export const getAllEbooks = async (req: Request, res: Response) => {
  try {
    // page/limit đã được validatePagination sanitize (.toInt())
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [ebooks, total] = await Promise.all([
      Ebook.find().select("-__v").populate("publisher", "name").skip(skip).limit(limit).sort({ createdAt: -1 }),
      Ebook.countDocuments(),
    ]);

    res.json({
      ebooks,
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

// Lấy ebook theo ID
export const getEbookById = async (req: Request, res: Response) => {
  try {
    const ebook = await Ebook.findById(req.params.id).populate("publisher", "name");
    if (!ebook) {
      return notFoundResponse(res, "ebook");
    }
    res.json(ebook);
  } catch (err) {
    if (handleObjectIdError(err, res, "ebook")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Tạo ebook mới
export const createEbook = async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles;
  // Multer đã ghi file lên disk trước khi handler chạy → cleanup nếu phía dưới fail
  const filesToCleanupOnError: string[] = [];
  if (files?.cover?.[0]) filesToCleanupOnError.push(files.cover[0].path);
  if (files?.ebook?.[0]) filesToCleanupOnError.push(files.ebook[0].path);

  try {
    const { name, author, illustrator, releaseDate, publisher } = req.body;

    // Kiểm tra file upload
    if (!files || !files.cover || !files.ebook) {
      return validationErrorResponse(res, "Cần upload cả cover và file ebook");
    }

    // Tìm publisher theo ID
    const publisherObj = await Publisher.findById(publisher);
    if (!publisherObj) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    const coverFile = files.cover[0];
    const ebookFile = files.ebook[0];

    const newEbook = new Ebook({
      name,
      author,
      illustrator: illustrator || "Unknown",
      coverImage: coverFile.filename,
      filePath: ebookFile.filename,
      releaseDate,
      publisher: publisherObj._id,
    });

    const ebook = await newEbook.save();

    // Save thành công → giữ file lại
    filesToCleanupOnError.length = 0;

    // Populate publisher data before returning
    const populatedEbook = await Ebook.findById(ebook._id).populate("publisher", "name");

    await invalidateEbookCache();

    // Gửi thông báo cho subscribers (background, không block response)
    setImmediate(() => sendNotification(name));

    res.json(populatedEbook);
  } catch (err) {
    return serverErrorResponse(res, err);
  } finally {
    if (filesToCleanupOnError.length > 0) {
      await Promise.all(filesToCleanupOnError.map(deleteFileIfExists)).catch(() => {});
    }
  }
};

// Cập nhật ebook
export const updateEbook = async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles;
  // File MỚI vừa upload — cleanup nếu downstream fail
  const newFilesToCleanupOnError: string[] = [];
  if (files?.cover?.[0]) newFilesToCleanupOnError.push(files.cover[0].path);
  if (files?.ebook?.[0]) newFilesToCleanupOnError.push(files.ebook[0].path);

  try {
    const { name, author, illustrator, releaseDate, publisher } = req.body;

    // Kiểm tra ebook tồn tại
    const existingEbook = await Ebook.findById(req.params.id);
    if (!existingEbook) {
      return notFoundResponse(res, "ebook");
    }

    // Tìm publisher theo ID
    const publisherObj = await Publisher.findById(publisher);
    if (!publisherObj) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    const ebookFields: Record<string, unknown> = {
      name,
      author,
      illustrator,
      releaseDate,
      publisher: publisherObj._id,
    };

    // Đánh dấu các file cũ cần xóa (chỉ xóa SAU khi update DB thành công)
    const oldFilesToDelete: OldFileRef[] = [];

    // Kiểm tra nếu có file cover mới
    if (files && files.cover) {
      const coverFile = files.cover[0];
      ebookFields.coverImage = coverFile.filename;
      if (existingEbook.coverImage !== "default-cover.jpg") {
        oldFilesToDelete.push({ filename: existingEbook.coverImage, type: "covers", def: "default-cover.jpg" });
      }
    }

    // Kiểm tra nếu có file ebook mới
    if (files && files.ebook) {
      const ebookFile = files.ebook[0];
      ebookFields.filePath = ebookFile.filename;
      oldFilesToDelete.push({ filename: existingEbook.filePath, type: "ebooks", def: null });
    }

    const updatedEbook = await Ebook.findByIdAndUpdate(req.params.id, { $set: ebookFields }, { new: true }).populate("publisher", "name");

    // Update DB thành công → giữ file mới, xóa file cũ
    newFilesToCleanupOnError.length = 0;
    await Promise.all(oldFilesToDelete.map((f) => deleteOldFile(f.filename, f.type, f.def)));

    await invalidateEbookCache(String(req.params.id));

    res.json(updatedEbook);
  } catch (err) {
    if (handleObjectIdError(err, res, "ebook")) {
      return;
    }
    return serverErrorResponse(res, err);
  } finally {
    if (newFilesToCleanupOnError.length > 0) {
      await Promise.all(newFilesToCleanupOnError.map(deleteFileIfExists)).catch(() => {});
    }
  }
};

// Xóa ebook
export const deleteEbook = async (req: Request, res: Response) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) {
      return notFoundResponse(res, "ebook");
    }

    // Xóa các file đi kèm (async)
    const deletePromises: Promise<boolean>[] = [];

    if (ebook.coverImage !== "default-cover.jpg") {
      deletePromises.push(deleteOldFile(ebook.coverImage, "covers", "default-cover.jpg"));
    }

    deletePromises.push(deleteOldFile(ebook.filePath, "ebooks"));

    // Xóa tất cả files song song
    await Promise.all(deletePromises);

    await Ebook.findByIdAndDelete(req.params.id);

    await invalidateEbookCache(String(req.params.id));

    res.json({ msg: "Ebook đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "ebook")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
