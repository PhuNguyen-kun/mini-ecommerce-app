const db = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, BadRequestError } = require("../../utils/ApiError");
const slugify = require("../../utils/slugify");
const { deleteFile, deleteMultipleFiles } = require("../../utils/cloudinaryHelper");

class ProductAdminService {
    // ============================================================
    // 3. ADMIN - TẠO SẢN PHẨM (JSON-ONLY)
    // ============================================================
    async createProduct(data) {
        return db.sequelize.transaction(async (t) => {
            try {
                data.options = (data.options || []).map((opt) => ({
                    name: opt.name.trim(),
                    values: (opt.values || []).map((v) => v.trim()),
                }));

                const slug = slugify(data.name, { lower: true, strict: true }) + "-" + Date.now();

                const product = await db.Product.create(
                    {
                        name: data.name,
                        slug,
                        category_id: data.category_id,
                        gender: data.gender,
                        description: data.description,
                        short_description: data.short_description,
                        is_active: true,
                    },
                    { transaction: t }
                );

                const optionMap = {};

                for (const opt of data.options) {
                    const newOption = await db.ProductOption.create(
                        { product_id: product.id, name: opt.name },
                        { transaction: t }
                    );

                    for (const val of opt.values) {
                        const newValue = await db.ProductOptionValue.create(
                            { product_option_id: newOption.id, value: val },
                            { transaction: t }
                        );
                        optionMap[`${opt.name}-${val}`] = newValue.id;
                    }
                }

                for (const variantData of data.variants || []) {


                    const newVariant = await db.ProductVariant.create(
                        {
                            product_id: product.id,
                            sku: variantData.sku,
                            price: variantData.price,
                            stock: variantData.stock,
                            is_active: true,
                        },
                        { transaction: t }
                    );

                    for (const [optNameRaw, optValRaw] of Object.entries(variantData.options || {})) {
                        const optName = String(optNameRaw).trim();
                        const optVal = String(optValRaw).trim();
                        const valueId = optionMap[`${optName}-${optVal}`];
                        if (!valueId) throw new BadRequestError(`Option value not found for ${optName} - ${optVal}`);

                        await db.ProductVariantOption.create(
                            { product_variant_id: newVariant.id, product_option_value_id: valueId },
                            { transaction: t }
                        );
                    }
                }

                const fullProduct = await db.Product.findOne({
                    where: { id: product.id },
                    include: [
                        { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
                        { model: db.ProductOption, as: "options", include: [{ model: db.ProductOptionValue, as: "values" }] },
                        {
                            model: db.ProductVariant,
                            as: "variants",
                            where: { deleted_at: null },
                            required: false,
                            include: [{ model: db.ProductOptionValue, as: "option_values", through: { attributes: [] } }],
                        },
                    ],
                    transaction: t,
                });

                return fullProduct;
            } catch (error) {
                console.error('Error in createProduct:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                if (error.errors) {
                    console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
                }
                throw error;
            }
        });
    }

    // ============================================================
    // 4. ADMIN - UPLOAD MEDIA CHO PRODUCT (FORM-DATA)
    // ============================================================
    async addProductMedia(productId, data) {
        return db.sequelize.transaction(async (t) => {
            const product = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                transaction: t,
            });
            if (!product) throw new NotFoundError("Product not found");

            let createdImages = [];
            if (data.images && data.images.length > 0) {
                const existingPrimary = await db.ProductImage.findOne({
                    where: { product_id: productId, is_primary: true, deleted_at: null },
                    transaction: t,
                });

                createdImages = await db.ProductImage.bulkCreate(
                    data.images.map((img, idx) => ({
                        product_id: productId,
                        product_option_value_id: null, // Mặc định chưa gán màu
                        image_url: img.url,
                        public_id: img.public_id || null,
                        is_primary: existingPrimary ? false : idx === 0,
                        sort_order: idx,
                    })),
                    { transaction: t }
                );
            }

            let createdVideos = [];
            if (data.videos && data.videos.length > 0) {
                createdVideos = await db.ProductVideo.bulkCreate(
                    data.videos.map((vid) => ({
                        product_id: productId,
                        video_url: vid.url,
                        public_id: vid.public_id || null,
                    })),
                    { transaction: t }
                );
            }

            const fullProduct = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                include: [
                    { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
                    {
                        model: db.ProductImage,
                        as: "images",
                        where: { deleted_at: null },
                        required: false,
                        // Trả về cả ID option value để FE biết ảnh nào đã gán
                        attributes: ["id", "image_url", "is_primary", "product_option_value_id"]
                    },
                    { model: db.ProductVideo, as: "videos", attributes: ["id", "video_url"], required: false },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                        where: { deleted_at: null },
                        required: false,
                        include: [{ model: db.ProductOptionValue, as: "option_values", through: { attributes: [] } }],
                    },
                ],
                transaction: t,
            });

            return {
                message: "Media uploaded successfully",
                images: createdImages,
                videos: createdVideos,
                product: fullProduct,
            };
        });
    }

    // ============================================================
    // 5. ADMIN - XÓA SẢN PHẨM
    // ============================================================
    async deleteProduct(productId) {


        // First check if product exists
        const productCheck = await db.Product.findOne({
            where: { id: productId, deleted_at: null }
        });

        if (!productCheck) {

            throw new NotFoundError("Product not found");
        }



        const [images, videos] = await Promise.all([
            db.ProductImage.findAll({ where: { product_id: productId, deleted_at: null }, attributes: ["public_id"] }),
            db.ProductVideo.findAll({ where: { product_id: productId, deleted_at: null }, attributes: ["public_id"] }),
        ]);



        const imagePublicIds = images.map((x) => x.public_id).filter(Boolean);
        const videoPublicIds = videos.map((x) => x.public_id).filter(Boolean);
        const uniqueImageIds = [...new Set(imagePublicIds)];
        const uniqueVideoIds = [...new Set(videoPublicIds)];

        // Perform soft delete in transaction
        const deletedAt = new Date();
        await db.sequelize.transaction(async (t) => {
            // Soft delete images
            const imageUpdateResult = await db.ProductImage.update(
                { deleted_at: deletedAt },
                { where: { product_id: productId, deleted_at: null }, transaction: t }
            );


            // Soft delete videos
            const videoUpdateResult = await db.ProductVideo.update(
                { deleted_at: deletedAt },
                { where: { product_id: productId, deleted_at: null }, transaction: t }
            );


            // Soft delete product
            const productUpdateResult = await db.Product.update(
                { deleted_at: deletedAt },
                { where: { id: productId, deleted_at: null }, transaction: t }
            );

            if (productUpdateResult[0] === 0) {
                throw new Error('Failed to update product - no rows affected');
            }


        });

        // Verify deletion (use paranoid: false to include soft-deleted records)
        const verifyProduct = await db.Product.findByPk(productId, { paranoid: false });

        // Delete files from cloudinary
        if (uniqueImageIds.length) {
            await deleteMultipleFiles(uniqueImageIds, "image");
        }
        if (uniqueVideoIds.length) {

            await deleteMultipleFiles(uniqueVideoIds, "video");
        }


        return true;
    }

    // ============================================================
    // 6. ADMIN - XÓA ẢNH LẺ
    // ============================================================
    async deleteProductImage(imageId) {
        const image = await db.ProductImage.findByPk(imageId);
        if (!image) throw new NotFoundError("Image not found");

        if (image.public_id) {
            // Check an toàn: xem có ảnh nào khác dùng chung public_id không (đề phòng clone cũ)
            const count = await db.ProductImage.count({
                where: {
                    public_id: image.public_id,
                    id: { [Op.ne]: imageId },
                    deleted_at: null
                }
            });
            if (count === 0) await deleteFile(image.public_id, "image");
        }

        await image.update({ deleted_at: new Date() });
        return true;
    }

    // ============================================================
    // 7. ADMIN - XÓA VIDEO LẺ
    // ============================================================
    async deleteProductVideo(videoId) {
        const video = await db.ProductVideo.findByPk(videoId);
        if (!video) throw new NotFoundError("Video not found");
        if (video.public_id) await deleteFile(video.public_id, "video");
        await video.update({ deleted_at: new Date() });
        return true;
    }

    // ============================================================
    // 8. ADMIN - GÁN ẢNH CHO OPTION VALUE (MÀU SẮC) - MỚI
    // ============================================================
    async setOptionImage(payload = {}) {
        const hasBatch = Array.isArray(payload.pairs) && payload.pairs.length > 0;

        const pairs = hasBatch
            ? payload.pairs
            : [{ optionValueId: payload.optionValueId, imageId: payload.imageId }];

        const cleanPairs = pairs
            .map((p) => ({
                option_value_id: Number(p.optionValueId ?? p.option_value_id),
                image_id: Number(p.imageId ?? p.image_id),
            }))
            .filter((p) => p.option_value_id > 0 && p.image_id > 0);

        if (cleanPairs.length === 0) throw new BadRequestError("Invalid data");

        return db.sequelize.transaction(async (t) => {
            const results = [];

            for (const p of cleanPairs) {
                const image = await db.ProductImage.findByPk(p.image_id, { transaction: t });
                if (!image) continue;

                // Cập nhật trực tiếp: Ảnh này thuộc về Màu này.
                await image.update({ product_option_value_id: p.option_value_id }, { transaction: t });

                results.push({
                    image_id: p.image_id,
                    option_value_id: p.option_value_id,
                    status: "assigned"
                });
            }

            return {
                message: "Assigned images to options successfully",
                data: results,
            };
        });
    }

    // ============================================================
    // 9. ADMIN - UPDATE SẢN PHẨM
    // ============================================================
    async updateProduct(productId, data) {
        return db.sequelize.transaction(async (t) => {
            const product = await db.Product.findOne({ where: { id: productId, deleted_at: null }, transaction: t });
            if (!product) throw new NotFoundError("Product not found");

            // 1. Update Basic Info
            const updateData = {};
            if (data.name) { updateData.name = data.name }
            if (data.description !== undefined) updateData.description = data.description;
            if (data.short_description !== undefined) updateData.short_description = data.short_description;
            if (data.category_id !== undefined) updateData.category_id = data.category_id;
            if (data.gender) updateData.gender = data.gender;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;

            if (Object.keys(updateData).length > 0) await product.update(updateData, { transaction: t });

            // 2. Handle Variants
            if (data.variants && data.variants.length > 0) {

                // Lấy tất cả Option Values hiện có
                const existingOptions = await db.ProductOption.findAll({
                    where: { product_id: product.id },
                    include: [{ model: db.ProductOptionValue, as: "values" }],
                    transaction: t
                });

                // Map 1: Tra cứu ID của Value ("Màu-Đỏ" => 10)
                const optionValueMap = {};
                // Map 2: Tra cứu ID của Option Name ("Màu sắc" => 1) -> Để biết đường tạo value mới
                const optionNameMap = {};

                existingOptions.forEach(opt => {
                    optionNameMap[opt.name] = opt.id; // Lưu ID của Option cha
                    opt.values.forEach(val => {
                        optionValueMap[`${opt.name}-${val.value}`] = val.id;
                    });
                });

                // Duyệt qua từng variant gửi lên
                for (const v of data.variants) {

                    // CASE A: UPDATE VARIANT CŨ
                    if (v.id && typeof v.id === 'number') {
                        const variantUpdateData = {};
                        if (v.price !== undefined) variantUpdateData.price = v.price;
                        if (v.stock !== undefined) variantUpdateData.stock = v.stock;
                        if (v.sku !== undefined) variantUpdateData.sku = v.sku;
                        if (v.is_active !== undefined) variantUpdateData.is_active = v.is_active;

                        if (Object.keys(variantUpdateData).length > 0) {
                            await db.ProductVariant.update(variantUpdateData, {
                                where: { id: v.id, product_id: product.id },
                                transaction: t,
                            });
                        }
                    }
                    // CASE B: CREATE NEW VARIANT
                    else {
                        if (!v.options || Object.keys(v.options).length === 0) continue;

                        // 1. Tạo Variant Record
                        const newVariant = await db.ProductVariant.create({
                            product_id: product.id,
                            sku: v.sku,
                            price: v.price,
                            stock: v.stock,
                            is_active: v.is_active !== false,
                        }, { transaction: t });

                        // 2. Link Variant với Option Values
                        for (const [optNameRaw, optValRaw] of Object.entries(v.options)) {
                            const optName = String(optNameRaw).trim();
                            const optVal = String(optValRaw).trim();
                            const lookupKey = `${optName}-${optVal}`;

                            // Tìm ID của value
                            let valueId = optionValueMap[lookupKey];

                            // LOGIC SỬA LỖI Ở ĐÂY: Nếu không thấy Value ID -> TẠO MỚI
                            if (!valueId) {
                                // Tìm Option cha (Ví dụ: tìm ID của "Màu sắc")
                                const optionId = optionNameMap[optName];

                                if (!optionId) {
                                    // Nếu tên Option cũng không tồn tại (Ví dụ user gửi "Chất liệu" mà DB chưa có)
                                    // Tùy logic: Có thể tạo luôn Option mới hoặc báo lỗi. 
                                    // Để an toàn, ở đây mình báo lỗi vì Option Name phải được định nghĩa trước.
                                    throw new BadRequestError(`Option name '${optName}' not found. Please add this option group first.`);
                                }

                                // Tạo Value mới (Ví dụ: tạo "Hồng" cho "Màu sắc")
                                const createdValue = await db.ProductOptionValue.create({
                                    product_option_id: optionId,
                                    value: optVal
                                }, { transaction: t });

                                // Cập nhật lại Map và biến valueId để dùng ngay
                                valueId = createdValue.id;
                                optionValueMap[lookupKey] = valueId;
                            }

                            // Tạo liên kết
                            await db.ProductVariantOption.create({
                                product_variant_id: newVariant.id,
                                product_option_value_id: valueId
                            }, { transaction: t });
                        }
                    }
                }
            }

            // Return full product
            const fullProduct = await db.Product.findOne({
                where: { id: product.id },
                include: [
                    { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
                    { model: db.ProductImage, as: "images", where: { deleted_at: null }, required: false, attributes: ["id", "image_url", "product_option_value_id"] },
                    { model: db.ProductVideo, as: "videos", attributes: ["id", "video_url"], required: false },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                        where: { deleted_at: null },
                        required: false,
                        include: [{ model: db.ProductOptionValue, as: "option_values", through: { attributes: [] } }],
                    },
                    {
                        model: db.ProductOption,
                        as: "options",
                        include: [{ model: db.ProductOptionValue, as: "values" }],
                    },
                ],
                transaction: t,
            });

            return fullProduct;
        });
    }
}
module.exports = new ProductAdminService();