const { responseError } = require("../utils/apiResponse");
const { IsApiError } = require("../utils/ApiError");
const { deleteMultipleFiles } = require("../utils/cloudinaryHelper");


// gom public_id từ multer-storage-cloudinary
const collectUploadedPublicIds = (req) => {
  const images = [];
  const videos = [];

  // uploadProductFiles dùng .fields => req.files = { images:[], videos:[] }
  if (req.files && typeof req.files === "object") {
    if (Array.isArray(req.files.images)) {
      images.push(...req.files.images.map((f) => f.filename).filter(Boolean));
    }
    if (Array.isArray(req.files.videos)) {
      videos.push(...req.files.videos.map((f) => f.filename).filter(Boolean));
    }
  }

  // uploadAvatar dùng .single => req.file
  if (req.file?.filename) {
    images.push(req.file.filename);
  }

  return { images, videos };
};

const errorHandler = async (err, req, res, next) => {
  console.error("Error:", err);

  // ====== CLEANUP CLOUDINARY NẾU REQUEST FAIL SAU KHI UPLOAD ======
  try {
    const { images, videos } = collectUploadedPublicIds(req);

    if (images.length > 0) await deleteMultipleFiles(images, "image");
    if (videos.length > 0) await deleteMultipleFiles(videos, "video");
  } catch (cleanupErr) {
    console.error("[Cloudinary Cleanup] failed:", cleanupErr.message);
  }
  // ===============================================================

  if (IsApiError(err)) {
    return responseError(res, err.message, err.statusCode);
  }

  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => e.message);
    return responseError(res, "Validation error", 400, errors);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return responseError(res, "Duplicate entry", 409);
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return responseError(res, "Foreign key constraint error", 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  return responseError(res, message, statusCode);
};

module.exports = errorHandler;
