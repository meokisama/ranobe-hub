import Konorano from "../models/Konorano.js";
import { clearCache } from "../middleware/cache.js";
import { sendNotification } from "./subscriberController.js";
import { deleteOldFile } from "../utils/fileManager.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";

// Lấy tất cả konorano (với pagination)
export const getAllKonoranos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
export const getKonoranoById = async (req, res) => {
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
export const createKonorano = async (req, res) => {
  try {
    const { name, author, releaseDate, viURL } = req.body;

    // Kiểm tra file upload
    if (!req.files || !req.files.cover || !req.files.konorano) {
      return validationErrorResponse(res, "Cần upload cả cover và file konorano");
    }

    const coverFile = req.files.cover[0];
    const konoranoFile = req.files.konorano[0];

    const newKonorano = new Konorano({
      name,
      author: author || "宝島社", // Sử dụng giá trị nhập hoặc mặc định
      coverImage: coverFile.filename,
      filePath: konoranoFile.filename,
      releaseDate,
      viURL,
    });

    const konorano = await newKonorano.save();

    // Xóa cache cụ thể
    await clearCache("cache:/api/konoranos");
    await clearCache("cache:/api/konoranos?*");

    // Gửi thông báo cho subscribers
    await sendNotification(name);

    res.json(konorano);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Cập nhật konorano
export const updateKonorano = async (req, res) => {
  try {
    const { name, author, releaseDate, viURL } = req.body;

    // Kiểm tra konorano tồn tại
    const existingKonorano = await Konorano.findById(req.params.id);
    if (!existingKonorano) {
      return notFoundResponse(res, "konorano");
    }

    const konoranoFields = {
      name,
      releaseDate,
      viURL,
      updatedAt: Date.now(),
    };

    // Chỉ cập nhật author nếu có giá trị được cung cấp
    if (author) {
      konoranoFields.author = author;
    }

    // Kiểm tra nếu có file cover mới
    if (req.files && req.files.cover) {
      const coverFile = req.files.cover[0];
      konoranoFields.coverImage = coverFile.filename;

      // Xóa file cover cũ (async)
      if (existingKonorano.coverImage !== "default-cover.jpg") {
        await deleteOldFile(existingKonorano.coverImage, "covers", "default-cover.jpg");
      }
    }

    // Kiểm tra nếu có file konorano mới
    if (req.files && req.files.konorano) {
      const konoranoFile = req.files.konorano[0];
      konoranoFields.filePath = konoranoFile.filename;

      // Xóa file konorano cũ (async)
      await deleteOldFile(existingKonorano.filePath, "ebooks");
    }

    const updatedKonorano = await Konorano.findByIdAndUpdate(req.params.id, { $set: konoranoFields }, { new: true });

    // Xóa cache cụ thể
    await clearCache("cache:/api/konoranos");
    await clearCache("cache:/api/konoranos?*");
    await clearCache(`cache:/api/konoranos/${req.params.id}`);

    res.json(updatedKonorano);
  } catch (err) {
    if (handleObjectIdError(err, res, "konorano")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Xóa konorano
export const deleteKonorano = async (req, res) => {
  try {
    const konorano = await Konorano.findById(req.params.id);
    if (!konorano) {
      return notFoundResponse(res, "konorano");
    }

    // Xóa các file đi kèm (async)
    const deletePromises = [];

    if (konorano.coverImage !== "default-cover.jpg") {
      deletePromises.push(deleteOldFile(konorano.coverImage, "covers", "default-cover.jpg"));
    }

    deletePromises.push(deleteOldFile(konorano.filePath, "ebooks"));

    // Xóa tất cả files song song
    await Promise.all(deletePromises);

    await Konorano.findByIdAndDelete(req.params.id);

    // Xóa cache cụ thể
    await clearCache("cache:/api/konoranos");
    await clearCache("cache:/api/konoranos?*");
    await clearCache(`cache:/api/konoranos/${req.params.id}`);

    res.json({ msg: "Konorano đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "konorano")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
