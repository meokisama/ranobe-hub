import type { Request, Response } from "express";
import Hako from "../models/Hako.js";
import { clearCache } from "../middleware/cache.js";
import { revalidateFrontend } from "../utils/revalidate.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";

const HAKO_CACHE_LIST = "cache:/api/hakos";
const HAKO_CACHE_LIST_GLOB = "cache:/api/hakos?*";

const invalidateHakoCache = async (id?: string): Promise<void> => {
  await clearCache(HAKO_CACHE_LIST);
  await clearCache(HAKO_CACHE_LIST_GLOB);
  if (id) {
    await clearCache(`cache:/api/hakos/${id}`);
  }
  // Revalidate the frontend /resources page (background, non-blocking)
  setImmediate(() => revalidateFrontend("hakos"));
};

// Get all hakos (paginated + search)
export const getAllHakos = async (req: Request, res: Response) => {
  try {
    // page/limit already sanitized by validatePagination (.toInt())
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Only accept string queries (prevents ?q[x]=y from becoming an object → "[object Object]")
    const filter: Record<string, unknown> = {};
    if (typeof req.query.q === "string") {
      const q = req.query.q.trim();
      if (q) {
        filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      }
    }
    if (typeof req.query.uploader === "string") {
      filter.uploader = req.query.uploader;
    }
    if (typeof req.query.translator === "string") {
      filter.translator = req.query.translator;
    }

    const [hakos, total] = await Promise.all([
      Hako.find(filter).select("-__v").skip(skip).limit(limit).sort({ lastUpdated: -1, createdAt: -1 }),
      Hako.countDocuments(filter),
    ]);

    res.json({
      hakos,
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

// Get hako by Mongo _id
export const getHakoById = async (req: Request, res: Response) => {
  try {
    const hako = await Hako.findById(req.params.id);
    if (!hako) {
      return notFoundResponse(res, "hako");
    }
    res.json(hako);
  } catch (err) {
    if (handleObjectIdError(err, res, "hako")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Get hako by hakoId (original id from data.json)
export const getHakoByHakoId = async (req: Request, res: Response) => {
  try {
    const hako = await Hako.findOne({ hakoId: req.params.hakoId });
    if (!hako) {
      return notFoundResponse(res, "hako");
    }
    res.json(hako);
  } catch (err) {
    return serverErrorResponse(res, err);
  }
};

// Create hako
export const createHako = async (req: Request, res: Response) => {
  try {
    const { hakoId, name, uploader, translator, lastUpdated, epub, pdf } = req.body;

    if (hakoId) {
      const existing = await Hako.findOne({ hakoId });
      if (existing) {
        return validationErrorResponse(res, "hakoId đã tồn tại");
      }
    }

    const newHako = new Hako({
      hakoId: hakoId || undefined,
      name,
      uploader: uploader || "",
      translator: translator || "",
      lastUpdated: lastUpdated || undefined,
      epub: epub || null,
      pdf: pdf || null,
    });

    const hako = await newHako.save();
    await invalidateHakoCache();

    res.json(hako);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return validationErrorResponse(res, "hakoId đã tồn tại");
    }
    return serverErrorResponse(res, err);
  }
};

// Update hako
export const updateHako = async (req: Request, res: Response) => {
  try {
    const { hakoId, name, uploader, translator, lastUpdated, epub, pdf } = req.body;

    const update: Record<string, unknown> = {};
    if (hakoId !== undefined) update.hakoId = hakoId || null;
    if (name !== undefined) update.name = name;
    if (uploader !== undefined) update.uploader = uploader;
    if (translator !== undefined) update.translator = translator;
    if (lastUpdated !== undefined) update.lastUpdated = lastUpdated || null;
    if (epub !== undefined) update.epub = epub || null;
    if (pdf !== undefined) update.pdf = pdf || null;

    const hako = await Hako.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!hako) {
      return notFoundResponse(res, "hako");
    }

    await invalidateHakoCache(String(req.params.id));
    res.json(hako);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return validationErrorResponse(res, "hakoId đã tồn tại");
    }
    if (handleObjectIdError(err, res, "hako")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Delete hako
export const deleteHako = async (req: Request, res: Response) => {
  try {
    const hako = await Hako.findByIdAndDelete(req.params.id);
    if (!hako) {
      return notFoundResponse(res, "hako");
    }

    await invalidateHakoCache(String(req.params.id));
    res.json({ msg: "Hako đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "hako")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
