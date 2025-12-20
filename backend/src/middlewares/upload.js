const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { BadRequestError } = require("../utils/ApiError");
const { UPLOAD_LIMITS, ALLOWED_FORMATS } = require("../constants/index");


const safeBaseName = (originalname = "") => {
    const name = originalname.split(".").slice(0, -1).join(".") || originalname;
    return String(name)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "")
        .slice(0, 60);
};

// ==========================
// A) STORAGE: PRODUCT MEDIA
// route: /api/products/admin/:id/media
// ==========================
const getProductMediaParams = async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    const productId = req.params.id;

    if (!productId) {
        // Nếu lỡ dùng sai route thì báo lỗi rõ ràng
        throw new BadRequestError("Missing product id in URL for product media upload");
    }

    const folder = `ecommerce_project/products/${productId}/${isVideo ? "videos" : "images"}`;
    const public_id = `${Date.now()}-${safeBaseName(file.originalname)}`;

    return {
        folder,
        resource_type: isVideo ? "video" : "image",
        allowed_formats: isVideo ? ALLOWED_FORMATS.VIDEOS : ALLOWED_FORMATS.IMAGES,
        public_id,
        overwrite: false,
    };
};

const productMediaStorage = new CloudinaryStorage({
    cloudinary,
    params: getProductMediaParams,
});

// ==========================
// B) STORAGE: AVATAR
// route: /api/users/me/avatar (ví dụ)
// ==========================
const getAvatarParams = async (req, file) => {
    // Avatar chỉ cho image
    const public_id = `${Date.now()}-${safeBaseName(file.originalname)}`;

    return {
        folder: `ecommerce_project/avatars`,
        resource_type: "image",
        allowed_formats: ALLOWED_FORMATS.IMAGES,
        public_id,
        overwrite: true, // avatar có thể muốn ghi đè (tuỳ bạn)
    };
};

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: getAvatarParams,
});

// ==========================
// FILTERS
// ==========================
const productMediaFileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    if (isImage || isVideo) cb(null, true);
    else cb(new BadRequestError("Định dạng file không hỗ trợ!"), false);
};

const avatarFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new BadRequestError("Avatar phải là ảnh!"), false);
};

// ==========================
// EXPORT MIDDLEWARES
// ==========================
const uploadProductFiles = multer({
    storage: productMediaStorage,
    limits: { fileSize: UPLOAD_LIMITS.FILE_SIZE.VIDEO },
    fileFilter: productMediaFileFilter,
}).fields([
    { name: "images", maxCount: UPLOAD_LIMITS.MAX_COUNT.PRODUCT_IMAGES },
    { name: "videos", maxCount: UPLOAD_LIMITS.MAX_COUNT.PRODUCT_VIDEOS },
]);

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: UPLOAD_LIMITS.FILE_SIZE.AVATAR },
    fileFilter: avatarFileFilter,
}).single("avatar");

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: "Lỗi Upload File",
            detail: err.message,
            code: err.code,
        });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

module.exports = {
    uploadProductFiles,
    uploadAvatar,
    handleUploadError,
};
