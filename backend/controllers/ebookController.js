const Ebook = require("../models/Ebook");
const Publisher = require("../models/Publisher");
const { clearCache } = require("../middleware/cache");
const { sendNotification } = require("./subscriberController");
const { deleteOldFile } = require("../utils/fileManager");
const {
  serverErrorResponse,
  notFoundResponse,
  validationErrorResponse,
  handleObjectIdError,
} = require("../utils/errorHandler");

// Lấy tất cả ebook (với pagination)
exports.getAllEbooks = async (req, res) => {
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
exports.getEbookById = async (req, res) => {
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
exports.createEbook = async (req, res) => {
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

    // Populate publisher data before returning
    const populatedEbook = await Ebook.findById(ebook._id).populate("publisher", "name");

    // Xóa cache cụ thể
    await clearCache("cache:/api/ebooks");
    await clearCache("cache:/api/ebooks?*");

    // Gửi thông báo cho subscribers
    await sendNotification(name);

    res.json(populatedEbook);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Cập nhật ebook
exports.updateEbook = async (req, res) => {
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

    // Kiểm tra nếu có file cover mới
    if (req.files && req.files.cover) {
      const coverFile = req.files.cover[0];
      ebookFields.coverImage = coverFile.filename;

      // Xóa file cover cũ (async)
      if (existingEbook.coverImage !== "default-cover.jpg") {
        await deleteOldFile(existingEbook.coverImage, "covers", "default-cover.jpg");
      }
    }

    // Kiểm tra nếu có file ebook mới
    if (req.files && req.files.ebook) {
      const ebookFile = req.files.ebook[0];
      ebookFields.filePath = ebookFile.filename;

      // Xóa file ebook cũ (async)
      await deleteOldFile(existingEbook.filePath, "ebooks");
    }

    const updatedEbook = await Ebook.findByIdAndUpdate(req.params.id, { $set: ebookFields }, { new: true }).populate(
      "publisher",
      "name"
    );

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
  }
};

// Xóa ebook
exports.deleteEbook = async (req, res) => {
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
