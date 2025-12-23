/**
 * Middleware parse form-data của review media upload
 * Chuyển req.files -> req.body.images, req.body.videos
 * để validator và service có thể xử lý
 */
const parseReviewMediaFormData = (req, res, next) => {
    // Parse existing images from formData (for update)
    let existingImages = [];
    if (req.body.existingImages) {
        try {
            existingImages = JSON.parse(req.body.existingImages);
        } catch (error) {
            console.error('Error parsing existingImages:', error);
            existingImages = [];
        }
    }

    // Parse new uploaded images
    const newImages = req.files?.images?.map(file => ({
        url: file.path,
        public_id: file.filename,
    })) || [];

    // Merge existing + new images
    req.body.images = [...existingImages, ...newImages];

    // Parse videos
    if (req.files?.videos) {
        req.body.videos = req.files.videos.map(file => ({
            url: file.path,
            public_id: file.filename,
            thumbnail_url: file.path.replace(/\.[^.]+$/, '.jpg'), // Cloudinary auto thumbnail
        }));
    } else {
        req.body.videos = [];
    }

    // Handle removeVideo flag
    if (req.body.removeVideo === 'true') {
        req.body.videos = [];
        req.body.removeVideo = true;
    }

    next();
};

module.exports = {
    parseReviewMediaFormData,
};
