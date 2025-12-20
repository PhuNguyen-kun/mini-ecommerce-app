const db = require("../models");
const { Op, Sequelize } = require("sequelize");
const { NotFoundError, BadRequestError } = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const { deleteFile, deleteMultipleFiles } = require("../utils/cloudinaryHelper");
const { COLOR_OPTION_NAMES, SIZE_OPTION_NAMES } = require("../constants");

class ProductService {
    // ============================================================
    // 1. CLIENT - LẤY DANH SÁCH SẢN PHẨM (CÓ LỌC + PHÂN TRANG)
    // ============================================================
    async getProducts(params = {}) {
        let {
            page = 1,
            limit = 10,
            search,
            category_id,
            category_ids,
            gender,
            sort,
            min_price,
            max_price,
            colors,
            sizes,
            view = "card", // "card" | "full"
        } = params;

        // -------------------------
        // 0) Normalize
        // -------------------------
        view = String(view).toLowerCase();
        if (!["card", "full"].includes(view)) view = "card";

        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        // -------------------------
        // 1) Parse category filters
        // -------------------------
        let categoryIdArray = [];
        if (category_ids) {
            if (Array.isArray(category_ids)) {
                categoryIdArray = category_ids
                    .map((id) => Number(id))
                    .filter((id) => !Number.isNaN(id));
            } else {
                categoryIdArray = String(category_ids)
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter((id) => !Number.isNaN(id));
            }
        } else if (category_id) {
            const parsed = Number(category_id);
            if (!Number.isNaN(parsed)) categoryIdArray = [parsed];
        }

        const parseArray = (input) => {
            if (!input) return [];
            if (Array.isArray(input)) return input.map((i) => String(i).trim()).filter(Boolean);
            return String(input).split(",").map((i) => i.trim()).filter(Boolean);
        };

        const colorArray = parseArray(colors);
        const sizeArray = parseArray(sizes);
        const hasColors = colorArray.length > 0;
        const hasSizes = sizeArray.length > 0;
        const hasColorOrSize = hasColors || hasSizes;
        // -------------------------
        // 2) Product where
        // -------------------------
        const whereCondition = {
            is_active: true,
            deleted_at: null,
        };
        if (gender) whereCondition.gender = gender;
        if (categoryIdArray.length > 0) whereCondition.category_id = { [Op.in]: categoryIdArray };
        if (search) whereCondition.name = { [Op.like]: `%${search}%` };

        // -------------------------
        // 3) Variant where (lọc theo price)
        // -------------------------
        const variantWhere = { is_active: true, deleted_at: null };

        if (min_price !== undefined && min_price !== null && min_price !== "") {
            variantWhere.price = { ...(variantWhere.price || {}), [Op.gte]: Number(min_price) };
        }
        if (max_price !== undefined && max_price !== null && max_price !== "") {
            variantWhere.price = { ...(variantWhere.price || {}), [Op.lte]: Number(max_price) };
        }

        const hasVariantFilter =
            (min_price !== undefined && min_price !== null && min_price !== "") ||
            (max_price !== undefined && max_price !== null && max_price !== "") ||
            hasColorOrSize;

        // -------------------------
        // 4) ✅ AND filter màu/size cho variant
        //    - nếu có colors => required include color_values
        //    - nếu có sizes  => required include size_values
        //    => có cả 2 => AND
        // -------------------------
        const variantIncludesForFiltering = [];

        if (hasColors) {
            variantIncludesForFiltering.push({
                model: db.ProductOptionValue,
                as: "color_values", // ✅ alias ở ProductVariant model
                through: { attributes: [] },
                required: true,
                where: { value: { [Op.in]: colorArray } },
                include: [
                    {
                        model: db.ProductOption,
                        as: "option",
                        attributes: [], // chỉ dùng để filter, không cần trả về
                        required: true,
                        where: { name: { [Op.in]: COLOR_OPTION_NAMES } },
                    },
                ],
            });
        }

        if (hasSizes) {
            variantIncludesForFiltering.push({
                model: db.ProductOptionValue,
                as: "size_values", // ✅ alias ở ProductVariant model
                through: { attributes: [] },
                required: true,
                where: { value: { [Op.in]: sizeArray } },
                include: [
                    {
                        model: db.ProductOption,
                        as: "option",
                        attributes: [],
                        required: true,
                        where: { name: { [Op.in]: SIZE_OPTION_NAMES } },
                    },
                ],
            });
        }

        // -------------------------
        // 5) Include option_values để trả về khi view=full
        // -------------------------
        const variantIncludeForFullView = [
            {
                model: db.ProductOptionValue,
                as: "option_values",
                through: { attributes: [] },
                required: false,
                include: [{ model: db.ProductOption, as: "option", attributes: ["name"] }],
            },
        ];

        // view=full => trả dữ liệu + lọc (nếu có)
        // view=card => chỉ include để lọc (nếu có) cho nhẹ payload
        const finalVariantInclude =
            view === "full"
                ? [...variantIncludeForFullView, ...variantIncludesForFiltering]
                : [...variantIncludesForFiltering];

        // -------------------------
        // 6) Variant include config
        // -------------------------
        const variantIncludeConfig = {
            model: db.ProductVariant,
            as: "variants",
            where: hasVariantFilter ? variantWhere : { is_active: true, deleted_at: null },
            required: hasVariantFilter,
            // card chỉ cần price/stock để tính price_from + has_stock
            attributes: view === "card" ? ["price", "stock"] : ["id", "price", "stock", "sku"],
            include: finalVariantInclude,
        };

        // -------------------------
        // 7) ✅ Sort theo price_from (MIN variant.price)
        //    Fix lỗi MySQL/Sequelize subQuery: dùng correlated subquery thay vì MIN(variants.price)
        // -------------------------
        const needPriceSort = sort === "price_asc" || sort === "price_desc";

        let order = [["created_at", "DESC"]];
        if (sort === "oldest") order = [["created_at", "ASC"]];

        if (needPriceSort) {
            const dir = sort === "price_asc" ? "ASC" : "DESC";

            // price_from = MIN(price) của tất cả variants active của product
            // Không phụ thuộc alias include => không bị lỗi "Unknown column variants.price"
            const minPriceSubQuery = `
      (
        SELECT MIN(v.price)
        FROM product_variants v
        WHERE v.product_id = Product.id
          AND v.deleted_at IS NULL
          AND v.is_active = 1
      )
    `;

            order = [[Sequelize.literal(minPriceSubQuery), dir]];
        }

        // -------------------------
        // 8) Build query
        // -------------------------
        // Card mode lấy gọn field product để nhẹ response
        const productAttributesCard = [
            "id",
            "category_id",
            "name",
            "slug",
            "gender",
            "short_description",
            "is_active",
            "created_at",
            "updated_at",
        ];

        const query = {
            where: whereCondition,
            limit,
            offset,
            order,
            distinct: true,
            attributes: view === "card" ? productAttributesCard : undefined,
            include: [
                { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
                {
                    model: db.ProductImage,
                    as: "images",
                    where: { is_primary: true },
                    required: false,
                    attributes: ["image_url"], // card chỉ cần url
                },
                variantIncludeConfig,
            ],
        };

        const { count, rows } = await db.Product.findAndCountAll(query);

        // count ở đây là number bình thường (vì không group)
        const total = count;

        // -------------------------
        // 9) FULL mode: trả thẳng rows
        // -------------------------
        if (view === "full") {
            return {
                products: rows,
                pagination: {
                    total,
                    page,
                    limit,
                    total_pages: Math.ceil(total / limit),
                },
            };
        }

        // -------------------------
        // 10) CARD mode: map ra payload gọn
        // -------------------------
        const products = rows.map((p) => {
            const variants = p.variants || [];

            // price_from = giá thấp nhất của variants (để UI hiển thị "từ ...")
            let price_from = null;
            for (const v of variants) {
                const num = Number(v.price);
                if (!Number.isNaN(num)) {
                    if (price_from === null || num < price_from) price_from = num;
                }
            }

            // has_stock = còn ít nhất 1 variant stock > 0
            const has_stock = variants.some((v) => Number(v.stock) > 0);

            return {
                id: p.id,
                category_id: p.category_id,
                name: p.name,
                slug: p.slug,
                gender: p.gender,
                short_description: p.short_description,
                is_active: p.is_active,
                created_at: p.created_at,
                updated_at: p.updated_at,
                category: p.category,
                primary_image: p.images?.[0]?.image_url || null,
                price_from,
                has_stock,
            };
        });

        return {
            products,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }


    // ============================================================
    // 2. CLIENT - LẤY CHI TIẾT SẢN PHẨM THEO SLUG
    // ============================================================
    async getProductBySlug(slug) {
        const product = await db.Product.findOne({
            where: { slug, is_active: true, deleted_at: null },
            include: [
                // (1) Category: đủ để breadcrumb / link
                { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },

                // (2) Product images: trả đủ thông tin để UI gallery + phân biệt primary + sort
                {
                    model: db.ProductImage,
                    as: "images",
                    attributes: ["id", "image_url", "is_primary", "sort_order", "product_variant_id"],
                    separate: true,
                    order: [
                        ["is_primary", "DESC"],
                        ["sort_order", "ASC"],
                        ["id", "ASC"],
                    ],
                },

                // (3) Options + values: dữ liệu để UI render chọn màu/size...
                {
                    model: db.ProductOption,
                    as: "options",
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: db.ProductOptionValue,
                            as: "values",
                            attributes: ["id", "value", "meta"],
                        },
                    ],
                },

                // (4) Videos: đủ để render
                { model: db.ProductVideo, as: "videos", attributes: ["id", "video_url"] },

                // (5) Variants: dữ liệu để FE tính price range, stock, chọn variant theo option_values
                {
                    model: db.ProductVariant,
                    as: "variants",
                    where: { is_active: true, deleted_at: null },
                    required: false,
                    attributes: ["id", "price", "stock", "sku"],
                    include: [
                        // ✅ Nhận xét #3: bỏ where deleted_at nếu ProductImage paranoid
                        // (Nếu model ProductImage paranoid: true thì Sequelize auto lọc deleted_at IS NULL)
                        {
                            model: db.ProductImage,
                            as: "images",
                            required: false,
                            attributes: ["id", "image_url", "is_primary", "sort_order", "product_variant_id"],
                        },

                        // Option values của từng variant (để FE biết variant này là Đỏ/M hay Xanh/L...)
                        {
                            model: db.ProductOptionValue,
                            as: "option_values",
                            through: { attributes: [] },
                            attributes: ["id", "value", "meta", "product_option_id"], // thêm product_option_id để FE map nhanh
                            include: [
                                { model: db.ProductOption, as: "option", attributes: ["id", "name"] },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!product) throw new NotFoundError("Product not found");
        return product;
    }
    // ============================================================
    // 3. ADMIN - TẠO SẢN PHẨM (JSON-ONLY)
    // NOTE: Không tạo images/videos ở đây nữa
    // ============================================================
    async createProduct(data) {
        return db.sequelize.transaction(async (t) => {
            // B0. Chuẩn hóa options
            data.options = (data.options || []).map((opt) => ({
                name: opt.name.trim(),
                values: opt.values.map((v) => v.trim()),
            }));

            // B1. Tạo product
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

            // B2. Options + Values
            const optionMap = {}; // "Color-Red" -> valueId

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

            // B3. Variants + join table
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
                    const optName = optNameRaw.trim();
                    const optVal = optValRaw.trim();

                    const valueId = optionMap[`${optName}-${optVal}`];
                    if (!valueId) {
                        throw new Error(`Option value not found for ${optName} - ${optVal}`);
                    }

                    await db.ProductVariantOption.create(
                        { product_variant_id: newVariant.id, product_option_value_id: valueId },
                        { transaction: t }
                    );
                }
            }

            // B4. Lấy lại product FULL (không có images/videos lúc này)
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
        });
    }

    // ============================================================
    // 4. ADMIN - UPLOAD MEDIA CHO PRODUCT (FORM-DATA)
    // data.images/videos đến từ middleware parseProductMediaFormData
    // ============================================================
    async addProductMedia(productId, data) {
        return db.sequelize.transaction(async (t) => {
            const product = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                transaction: t,
            });
            if (!product) throw new NotFoundError("Product not found");

            // 1) Images
            let createdImages = [];
            if (data.images && data.images.length > 0) {
                // Nếu đã có primary rồi thì các ảnh mới không set primary
                const existingPrimary = await db.ProductImage.findOne({
                    where: { product_id: productId, is_primary: true, deleted_at: null },
                    transaction: t,
                });

                createdImages = await db.ProductImage.bulkCreate(
                    data.images.map((img, idx) => ({
                        product_id: productId,
                        product_variant_id: null,
                        image_url: img.url,
                        public_id: img.public_id || null,
                        // set primary nếu chưa có primary nào
                        is_primary: existingPrimary ? false : idx === 0,
                        sort_order: idx,
                    })),
                    { transaction: t }
                );
            }

            // 2) Videos
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

            // 3) trả về product cập nhật (tuỳ bạn: trả images/videos thôi hoặc trả full)
            const fullProduct = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                include: [
                    { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
                    { model: db.ProductImage, as: "images", where: { deleted_at: null }, required: false },
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
    // 5. ADMIN - XÓA SẢN PHẨM (SOFT DELETE)
    // ============================================================
    async deleteProduct(productId) {
        // 1) Lấy public_ids trước (để chắc chắn còn record mà đọc)
        const [images, videos] = await Promise.all([
            db.ProductImage.findAll({
                where: { product_id: productId, deleted_at: null },
                attributes: ["public_id"],
            }),
            db.ProductVideo.findAll({
                where: { product_id: productId, deleted_at: null },
                attributes: ["public_id"],
            }),
        ]);

        const imagePublicIds = images.map(x => x.public_id).filter(Boolean);
        const videoPublicIds = videos.map(x => x.public_id).filter(Boolean);

        // 2) Transaction: dọn DB trước
        await db.sequelize.transaction(async (t) => {
            const product = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                transaction: t,
            });
            if (!product) throw new NotFoundError("Product not found");

            await db.ProductImage.destroy({
                where: { product_id: productId },
                force: true,
                transaction: t,
            });

            await db.ProductVideo.destroy({
                where: { product_id: productId },
                force: true,
                transaction: t,
            });

            await product.destroy({ transaction: t }); // soft delete product
        });

        // 3) Sau commit: xóa Cloudinary
        // (Nếu fail thì DB vẫn sạch, chỉ còn “rác cloud”, dễ dọn sau)
        if (imagePublicIds.length) await deleteMultipleFiles(imagePublicIds, "image");
        if (videoPublicIds.length) await deleteMultipleFiles(videoPublicIds, "video");

        return true;
    }


    // ============================================================
    // 6. ADMIN - XÓA ẢNH LẺ (Xóa Cloudinary + DB hard delete)
    // ============================================================
    async deleteProductImage(imageId) {
        const image = await db.ProductImage.findByPk(imageId);
        if (!image) throw new NotFoundError("Image not found");

        if (image.public_id) await deleteFile(image.public_id, "image");
        await image.destroy({ force: true }); // hard delete
        return true;
    }

    // ============================================================
    // 7. ADMIN - XÓA VIDEO LẺ (Xóa Cloudinary + DB hard delete)
    // ============================================================
    async deleteProductVideo(videoId) {
        const video = await db.ProductVideo.findByPk(videoId);
        if (!video) throw new NotFoundError("Video not found");

        if (video.public_id) await deleteFile(video.public_id, "video");
        await video.destroy({ force: true });
        return true;
    }

    // ============================================================
    // 8. ADMIN - GÁN ẢNH CHO VARIANT (single hoặc batch)
    // ============================================================
    async setVariantImage(payload = {}) {
        const hasBatch = Array.isArray(payload.pairs) && payload.pairs.length > 0;

        // normalize input -> thành mảng pairs thống nhất
        const pairs = hasBatch
            ? payload.pairs
            : [{ variantId: payload.variantId, imageId: payload.imageId }];

        // clean + validate kiểu dữ liệu cơ bản
        const cleanPairs = pairs
            .map((p) => ({
                variant_id: Number(p.variantId ?? p.variant_id),
                image_id: Number(p.imageId ?? p.image_id),
            }))
            .filter((p) => Number.isFinite(p.variant_id) && p.variant_id > 0 && Number.isFinite(p.image_id) && p.image_id > 0);

        if (cleanPairs.length === 0) {
            throw new BadRequestError(
                hasBatch
                    ? "pairs must be a non-empty array of {variantId, imageId}"
                    : "variantId and imageId are required"
            );
        }

        return db.sequelize.transaction(async (t) => {
            // 1) Load variants + images 1 lần
            const variantIds = [...new Set(cleanPairs.map((p) => p.variant_id))];
            const imageIds = [...new Set(cleanPairs.map((p) => p.image_id))];

            const [variants, images] = await Promise.all([
                db.ProductVariant.findAll({
                    where: { id: { [Op.in]: variantIds }, deleted_at: null },
                    attributes: ["id", "product_id"],
                    transaction: t,
                }),
                db.ProductImage.findAll({
                    where: { id: { [Op.in]: imageIds }, deleted_at: null },
                    attributes: ["id", "product_id", "product_variant_id"],
                    transaction: t,
                }),
            ]);

            const variantMap = new Map(variants.map((v) => [v.id, v]));
            const imageMap = new Map(images.map((i) => [i.id, i]));

            // 2) Validate tồn tại + cùng product
            for (const p of cleanPairs) {
                const variant = variantMap.get(p.variant_id);
                if (!variant) throw new NotFoundError(`Variant not found: ${p.variant_id}`);

                const image = imageMap.get(p.image_id);
                if (!image) throw new NotFoundError(`Image not found: ${p.image_id}`);

                if (String(image.product_id) !== String(variant.product_id)) {
                    throw new BadRequestError(
                        `Image ${p.image_id} and Variant ${p.variant_id} belong to different products`
                    );
                }
            }

            // 3) Update: gán ảnh -> variant
            // chạy Promise.all cho nhanh (cùng transaction)
            await Promise.all(
                cleanPairs.map((p) =>
                    db.ProductImage.update(
                        { product_variant_id: p.variant_id },
                        { where: { id: p.image_id }, transaction: t }
                    )
                )
            );

            return {
                message: hasBatch ? "Gán ảnh thành công (batch)" : "Gán ảnh thành công",
                updated: cleanPairs, // [{variant_id, image_id}, ...]
            };
        });
    }

    // ============================================================
    // 9. ADMIN - UPDATE SẢN PHẨM (JSON-ONLY)
    // NOTE: Không add images/videos ở đây nữa (có API riêng)
    // ============================================================
    async updateProduct(productId, data) {
        return db.sequelize.transaction(async (t) => {
            const product = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                transaction: t,
            });
            if (!product) throw new NotFoundError("Product not found");

            // Update product fields
            const updateData = {};
            if (data.name) {
                updateData.name = data.name;
                updateData.slug = slugify(data.name) + "-" + Date.now();
            }
            if (data.description !== undefined) updateData.description = data.description;
            if (data.short_description !== undefined) updateData.short_description = data.short_description;
            if (data.category_id !== undefined) updateData.category_id = data.category_id;
            if (data.gender) updateData.gender = data.gender;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;

            if (Object.keys(updateData).length > 0) {
                await product.update(updateData, { transaction: t });
            }

            // Update variants (price/stock/sku/is_active)
            if (data.variants && data.variants.length > 0) {
                const updatePromises = data.variants.map((v) => {
                    const variantUpdateData = {};

                    if (v.price !== undefined) variantUpdateData.price = v.price;
                    if (v.stock !== undefined) variantUpdateData.stock = v.stock;
                    if (v.sku !== undefined) variantUpdateData.sku = v.sku;
                    if (v.is_active !== undefined) variantUpdateData.is_active = v.is_active;

                    if (Object.keys(variantUpdateData).length === 0) return Promise.resolve();

                    return db.ProductVariant.update(variantUpdateData, {
                        where: { id: v.id, product_id: product.id, deleted_at: null },
                        transaction: t,
                    });
                });

                await Promise.all(updatePromises);
            }

            // Return full product
            const fullProduct = await db.Product.findOne({
                where: { id: product.id },
                include: [
                    { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
                    { model: db.ProductImage, as: "images", where: { deleted_at: null }, required: false },
                    { model: db.ProductVideo, as: "videos", attributes: ["id", "video_url"], required: false },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                        where: { deleted_at: null },
                        required: false,
                        include: [
                            { model: db.ProductOptionValue, as: "option_values", through: { attributes: [] } },
                            { model: db.ProductImage, as: "images", where: { deleted_at: null }, required: false },
                        ],
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

module.exports = new ProductService();
