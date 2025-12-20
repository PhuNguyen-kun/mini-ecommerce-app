// src/utils/cloudinaryHelper.js
const cloudinary = require("../config/cloudinary");

/**
 * Xóa 1 file trên Cloudinary
 */
const deleteFile = async (publicId, resourceType = "image") => {
    try {
        if (!publicId || !String(publicId).trim()) return false;

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        // result.result: 'ok' | 'not found' | ...
        return result?.result === "ok";
    } catch (error) {
        console.error("[Cloudinary] Delete error:", error.message);
        return false;
    }
};

/**
 * Xóa nhiều file cùng lúc (chuẩn: chỉ 'deleted' mới tính là thành công)
 */
const deleteMultipleFiles = async (publicIds, resourceType = "image") => {
    try {
        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            return { deleted: {}, failed: [] };
        }

        const validIds = publicIds
            .map((id) => (id ? String(id).trim() : ""))
            .filter(Boolean);

        if (validIds.length === 0) return { deleted: {}, failed: [] };

        const result = await cloudinary.api.delete_resources(validIds, {
            resource_type: resourceType,
        });

        const deletedMap = result?.deleted || {};

        // chỉ 'deleted' mới ok
        const failed = validIds.filter((id) => deletedMap[id] !== "deleted");

        return { deleted: deletedMap, failed };
    } catch (error) {
        console.error("[Cloudinary] Delete multiple error:", error.message);
        return { deleted: {}, failed: publicIds || [] };
    }
};
module.exports = {
    deleteFile,
    deleteMultipleFiles,
};
