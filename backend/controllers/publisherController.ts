import type { Request, Response } from "express";
import Publisher from "../models/Publisher.js";
import Ebook from "../models/Ebook.js";
import { revalidateFrontend } from "../utils/revalidate.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";
import type { TypedRequest } from "../types/request.js";

interface PublisherBody {
  name: string;
}

// Get all publishers
export const getAllPublishers = async (_req: Request, res: Response) => {
  try {
    const publishers = await Publisher.find().select("-__v").sort({ name: 1 });
    res.json(publishers);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Create publisher
export const createPublisher = async (req: TypedRequest<PublisherBody>, res: Response) => {
  try {
    const { name } = req.body;

    const existingPublisher = await Publisher.findOne({ name });
    if (existingPublisher) {
      return validationErrorResponse(res, "Nhãn hiệu này đã tồn tại");
    }

    const publisher = new Publisher({ name });
    await publisher.save();

    setImmediate(() => void revalidateFrontend("publishers"));

    res.json(publisher);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Update publisher
export const updatePublisher = async (req: TypedRequest<PublisherBody>, res: Response) => {
  try {
    const { name } = req.body;

    // Reject if the new name is already taken by another publisher
    const existingPublisher = await Publisher.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingPublisher) {
      return validationErrorResponse(res, "Nhãn hiệu này đã tồn tại");
    }

    const publisher = await Publisher.findByIdAndUpdate(req.params.id, { name }, { new: true });

    if (!publisher) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    setImmediate(() => void revalidateFrontend("publishers"));

    res.json(publisher);
  } catch (err) {
    if (handleObjectIdError(err, res, "nhãn hiệu")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Delete publisher
export const deletePublisher = async (req: Request, res: Response) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return notFoundResponse(res, "nhãn hiệu");
    }

    // Block deletion if any ebook still references it (avoid orphans)
    const inUse = await Ebook.exists({ publisher: req.params.id });
    if (inUse) {
      return validationErrorResponse(res, "Không thể xóa: nhãn hiệu vẫn đang được dùng bởi ebook");
    }

    await Publisher.findByIdAndDelete(req.params.id);

    setImmediate(() => void revalidateFrontend("publishers"));

    res.json({ msg: "Nhãn hiệu đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "nhãn hiệu")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
