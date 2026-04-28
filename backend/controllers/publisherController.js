import Publisher from "../models/Publisher.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";

// Lấy tất cả nhãn hiệu
export const getAllPublishers = async (req, res) => {
  try {
    const publishers = await Publisher.find().select("-__v").sort({ name: 1 });
    res.json(publishers);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Tạo nhãn hiệu mới
export const createPublisher = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra xem nhãn hiệu đã tồn tại chưa
    const existingPublisher = await Publisher.findOne({ name });
    if (existingPublisher) {
      return validationErrorResponse(res, "Nhãn hiệu này đã tồn tại");
    }

    const publisher = new Publisher({ name });
    await publisher.save();

    res.json(publisher);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Cập nhật nhãn hiệu
export const updatePublisher = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra xem tên mới đã tồn tại chưa
    const existingPublisher = await Publisher.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingPublisher) {
      return validationErrorResponse(res, "Nhãn hiệu này đã tồn tại");
    }

    const publisher = await Publisher.findByIdAndUpdate(
      req.params.id,
      {
        name,
        updatedAt: Date.now(),
      },
      { new: true },
    );

    if (!publisher) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    res.json(publisher);
  } catch (err) {
    if (handleObjectIdError(err, res, "nhãn hiệu")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Xóa nhãn hiệu
export const deletePublisher = async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    await Publisher.findByIdAndDelete(req.params.id);
    res.json({ msg: "Nhãn hiệu đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "nhãn hiệu")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
