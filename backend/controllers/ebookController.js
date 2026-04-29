import Ebook from "../models/Ebook.js";
import Publisher from "../models/Publisher.js";
import { clearCache } from "../middleware/cache.js";
import { sendNotification } from "./subscriberController.js";
import { deleteOldFile, deleteFileIfExists } from "../utils/fileManager.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";

// Lấy tất cả ebook (với pagination)
export const getAllEbooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
export const getEbookById = async (req, res) => {
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
export const createEbook = async (req, res) => {
  // Multer đã ghi file lên disk trước khi handler chạy → cleanup nếu phía dưới fail
  const filesToCleanupOnError = [];
  if (req.files?.cover?.[0]) filesToCleanupOnError.push(req.files.cover[0].path);
  if (req.files?.ebook?.[0]) filesToCleanupOnError.push(req.files.ebook[0].path);

  try {
    const { name, author, illustrator, releaseDate, publisher } = req.body;

    // Kiểm tra file upload
    if (!req.files || !req.files.cover || !req.files.ebook) {
      return validationErrorResponse(res, "Cần upload cả cover và file ebook");
    }

    // Tìm publisher theo ID
    const publisherObj = await Publisher.findById(publisher);
    if (!publisherObj) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    const coverFile = req.files.cover[0];
    const ebookFile = req.files.ebook[0];

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

    // Xóa cache cụ thể
    await clearCache("cache:/api/ebooks");
    await clearCache("cache:/api/ebooks?*");

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
export const updateEbook = async (req, res) => {
  // File MỚI vừa upload — cleanup nếu downstream fail
  const newFilesToCleanupOnError = [];
  if (req.files?.cover?.[0]) newFilesToCleanupOnError.push(req.files.cover[0].path);
  if (req.files?.ebook?.[0]) newFilesToCleanupOnError.push(req.files.ebook[0].path);

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

    const ebookFields = {
      name,
      author,
      illustrator,
      releaseDate,
      publisher: publisherObj._id,
      updatedAt: Date.now(),
    };

    // Đánh dấu các file cũ cần xóa (chỉ xóa SAU khi update DB thành công)
    const oldFilesToDelete = [];

    // Kiểm tra nếu có file cover mới
    if (req.files && req.files.cover) {
      const coverFile = req.files.cover[0];
      ebookFields.coverImage = coverFile.filename;
      if (existingEbook.coverImage !== "default-cover.jpg") {
        oldFilesToDelete.push({ filename: existingEbook.coverImage, type: "covers", def: "default-cover.jpg" });
      }
    }

    // Kiểm tra nếu có file ebook mới
    if (req.files && req.files.ebook) {
      const ebookFile = req.files.ebook[0];
      ebookFields.filePath = ebookFile.filename;
      oldFilesToDelete.push({ filename: existingEbook.filePath, type: "ebooks", def: null });
    }

    const updatedEbook = await Ebook.findByIdAndUpdate(req.params.id, { $set: ebookFields }, { new: true }).populate("publisher", "name");

    // Update DB thành công → giữ file mới, xóa file cũ
    newFilesToCleanupOnError.length = 0;
    await Promise.all(oldFilesToDelete.map((f) => deleteOldFile(f.filename, f.type, f.def)));

    // Xóa cache cụ thể
    await clearCache("cache:/api/ebooks");
    await clearCache("cache:/api/ebooks?*");
    await clearCache(`cache:/api/ebooks/${req.params.id}`);

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
export const deleteEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) {
      return notFoundResponse(res, "ebook");
    }

    // Xóa các file đi kèm (async)
    const deletePromises = [];

    if (ebook.coverImage !== "default-cover.jpg") {
      deletePromises.push(deleteOldFile(ebook.coverImage, "covers", "default-cover.jpg"));
    }

    deletePromises.push(deleteOldFile(ebook.filePath, "ebooks"));

    // Xóa tất cả files song song
    await Promise.all(deletePromises);

    await Ebook.findByIdAndDelete(req.params.id);

    // Xóa cache cụ thể
    await clearCache("cache:/api/ebooks");
    await clearCache("cache:/api/ebooks?*");
    await clearCache(`cache:/api/ebooks/${req.params.id}`);

    res.json({ msg: "Ebook đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "ebook")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
