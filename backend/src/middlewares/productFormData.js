/**
 * Middleware parse multipart/form-data cho upload media
 * - map req.files -> req.body.images/videos
 * - set primary ảnh đầu tiên (nếu muốn)
 */
const parseProductMediaFormData = (req, res, next) => {
    try {
        if (req.files) {
            const uploadedImages =
                req.files["images"]?.map((f, idx) => ({
                    url: f.path,
                    public_id: f.filename,
                })) || [];

            const uploadedVideos =
                req.files["videos"]?.map((f) => ({
                    url: f.path,
                    public_id: f.filename,
                })) || [];

            req.body.images = uploadedImages;
            req.body.videos = uploadedVideos;
        }

        next();
    } catch (error) {
        return res.status(400).json({
            message: "Dữ liệu form-data không hợp lệ",
            detail: error.message,
        });
    }
};

module.exports = { parseProductMediaFormData };
