import type { Request, Response } from "express";
import Konorano from "../models/Konorano.js";
import { clearCache } from "../middleware/cache.js";
import { sendNotification } from "./subscriberController.js";
import { revalidateFrontend } from "../utils/revalidate.js";
import { deleteOldFile, deleteFileIfExists } from "../utils/fileManager.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";
import type { UploadedFiles, OldFileRef } from "../types/upload.js";
import type { TypedRequest } from "../types/request.js";

interface KonoranoBody {
  name: string;
  author?: string;
  releaseDate: Date;
  viURL: string;
}

const KONORANO_CACHE_LIST = "cache:/api/konoranos";
const KONORANO_CACHE_LIST_GLOB = "cache:/api/konoranos?*";

const invalidateKonoranoCache = async (id?: string): Promise<void> => {
  await Promise.all([
    clearCache(KONORANO_CACHE_LIST),
    clearCache(KONORANO_CACHE_LIST_GLOB),
    ...(id ? [clearCache(`cache:/api/konoranos/${id}`)] : []),
  ]);
  // Revalidate frontend (background, non-blocking)
  setImmediate(() => void revalidateFrontend("konoranos"));
};

// Get all konoranos (paginated)
export const getAllKonoranos = async (req: Request, res: Response) => {
  try {
    // page/limit already sanitized by validatePagination (.toInt())
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

// Get konorano by ID
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

// Create konorano
export const createKonorano = async (req: TypedRequest<KonoranoBody>, res: Response) => {
  const files = req.files as UploadedFiles;
  // Multer writes files to disk before the handler runs — clean up if anything below fails
  const filesToCleanupOnError: string[] = [];
  if (files?.cover?.[0]) filesToCleanupOnError.push(files.cover[0].path);
  if (files?.konorano?.[0]) filesToCleanupOnError.push(files.konorano[0].path);

  try {
    const { name, author, releaseDate, viURL } = req.body;

    if (!files || !files.cover || !files.konorano) {
      return validationErrorResponse(res, "Cần upload cả cover và file konorano");
    }

    const coverFile = files.cover[0];
    const konoranoFile = files.konorano[0];

    const newKonorano = new Konorano({
      name,
      author: author || "宝島社", // use provided value or default
      coverImage: coverFile.filename,
      filePath: konoranoFile.filename,
      releaseDate,
      viURL,
    });

    const konorano = await newKonorano.save();

    // Save succeeded — keep the files
    filesToCleanupOnError.length = 0;

    await invalidateKonoranoCache();

    // Notify subscribers (background, non-blocking)
    setImmediate(() => void sendNotification(name));

    res.json(konorano);
  } catch (err) {
    return serverErrorResponse(res, err);
  } finally {
    if (filesToCleanupOnError.length > 0) {
      await Promise.all(filesToCleanupOnError.map(deleteFileIfExists)).catch(() => {});
    }
  }
};

// Update konorano
export const updateKonorano = async (req: TypedRequest<KonoranoBody>, res: Response) => {
  const files = req.files as UploadedFiles;
  // Newly uploaded files — clean up if downstream fails
  const newFilesToCleanupOnError: string[] = [];
  if (files?.cover?.[0]) newFilesToCleanupOnError.push(files.cover[0].path);
  if (files?.konorano?.[0]) newFilesToCleanupOnError.push(files.konorano[0].path);

  try {
    const { name, author, releaseDate, viURL } = req.body;

    const existingKonorano = await Konorano.findById(req.params.id);
    if (!existingKonorano) {
      return notFoundResponse(res, "konorano");
    }

    const konoranoFields: Record<string, unknown> = {
      name,
      releaseDate,
      viURL,
    };

    // Only update author if a value was provided
    if (author) {
      konoranoFields.author = author;
    }

    // Mark old files for deletion (only delete AFTER the DB update succeeds)
    const oldFilesToDelete: OldFileRef[] = [];

    if (files && files.cover) {
      const coverFile = files.cover[0];
      konoranoFields.coverImage = coverFile.filename;
      if (existingKonorano.coverImage !== "default-cover.jpg") {
        oldFilesToDelete.push({ filename: existingKonorano.coverImage, type: "covers", def: "default-cover.jpg" });
      }
    }

    if (files && files.konorano) {
      const konoranoFile = files.konorano[0];
      konoranoFields.filePath = konoranoFile.filename;
      oldFilesToDelete.push({ filename: existingKonorano.filePath, type: "ebooks", def: null });
    }

    const updatedKonorano = await Konorano.findByIdAndUpdate(req.params.id, { $set: konoranoFields }, { new: true });

    // DB update succeeded — keep new files, delete old ones
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

// Delete konorano
export const deleteKonorano = async (req: Request, res: Response) => {
  try {
    const konorano = await Konorano.findById(req.params.id);
    if (!konorano) {
      return notFoundResponse(res, "konorano");
    }

    // Delete associated files
    const deletePromises: Promise<boolean>[] = [];

    if (konorano.coverImage !== "default-cover.jpg") {
      deletePromises.push(deleteOldFile(konorano.coverImage, "covers", "default-cover.jpg"));
    }

    deletePromises.push(deleteOldFile(konorano.filePath, "ebooks"));

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
