import Hako from "../models/Hako.js";
import { clearCache } from "../middleware/cache.js";
import { revalidateFrontend } from "../utils/revalidate.js";
import { serverErrorResponse, notFoundResponse, validationErrorResponse, handleObjectIdError } from "../utils/errorHandler.js";

const HAKO_CACHE_LIST = "cache:/api/hakos";
const HAKO_CACHE_LIST_GLOB = "cache:/api/hakos?*";

const invalidateHakoCache = async (id) => {
  await clearCache(HAKO_CACHE_LIST);
  await clearCache(HAKO_CACHE_LIST_GLOB);
  if (id) {
    await clearCache(`cache:/api/hakos/${id}`);
  }
  // Revalidate trang /resources trên frontend (background, không block response)
  setImmediate(() => revalidateFrontend("hakos"));
};

// Lấy tất cả hako (với pagination + search)
export const getAllHakos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.q) {
      const q = String(req.query.q).trim();
      if (q) {
        filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      }
    }
    if (req.query.uploader) {
      filter.uploader = String(req.query.uploader);
    }
    if (req.query.translator) {
      filter.translator = String(req.query.translator);
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

// Lấy hako theo ID (_id của Mongo)
export const getHakoById = async (req, res) => {
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

// Lấy hako theo hakoId (id gốc từ data.json)
export const getHakoByHakoId = async (req, res) => {
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

// Tạo hako mới
export const createHako = async (req, res) => {
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
    if (err.code === 11000) {
      return validationErrorResponse(res, "hakoId đã tồn tại");
    }
    return serverErrorResponse(res, err);
  }
};

// Cập nhật hako
export const updateHako = async (req, res) => {
  try {
    const { hakoId, name, uploader, translator, lastUpdated, epub, pdf } = req.body;

    const update = { updatedAt: Date.now() };
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

    await invalidateHakoCache(req.params.id);
    res.json(hako);
  } catch (err) {
    if (err.code === 11000) {
      return validationErrorResponse(res, "hakoId đã tồn tại");
    }
    if (handleObjectIdError(err, res, "hako")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};

// Xóa hako
export const deleteHako = async (req, res) => {
  try {
    const hako = await Hako.findByIdAndDelete(req.params.id);
    if (!hako) {
      return notFoundResponse(res, "hako");
    }

    await invalidateHakoCache(req.params.id);
    res.json({ msg: "Hako đã được xóa" });
  } catch (err) {
    if (handleObjectIdError(err, res, "hako")) {
      return;
    }
    return serverErrorResponse(res, err);
  }
};
