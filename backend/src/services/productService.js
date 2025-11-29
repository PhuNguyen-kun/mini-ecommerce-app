const db = require("../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../utils/ApiError");
const slugify = require("../utils/slugify");

class ProductService {
    // ============================================================
    // 1. LẤY DANH SÁCH SẢN PHẨM (CÓ LỌC + PHÂN TRANG)
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
        } = params;

        // Ép kiểu số
        page = Number(page) || 1;
        limit = Number(limit) || 10;

        const offset = (page - 1) * limit;

        // ===========================
        // A. Parse category_ids & colors/sizes
        // ===========================

        // 1) Category: cho phép dùng category_id hoặc category_ids
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
            if (!Number.isNaN(parsed)) {
                categoryIdArray = [parsed];
            }
        }

        // Helper parse "Đỏ,Xanh" hoặc ["Đỏ","Xanh"] -> ["Đỏ","Xanh"]
        const parseArray = (input) => {
            if (!input) return [];
            if (Array.isArray(input)) {
                return input.map((i) => String(i).trim()).filter((i) => i);
            }
            return String(input)
                .split(",")
                .map((i) => i.trim())
                .filter((i) => i);
        };

        const colorArray = parseArray(colors);
        const sizeArray = parseArray(sizes);

        // ===========================
        // B. Điều kiện where cho Product
        // ===========================
        const whereCondition = {
            is_active: true,
            deleted_at: null,
        };

        if (gender) whereCondition.gender = gender;

        if (categoryIdArray.length > 0) {
            whereCondition.category_id = { [Op.in]: categoryIdArray };
        }

        if (search) {
            whereCondition.name = {
                [Op.like]: `%${search}%`,
            };
        }

        // ===========================
        // C. Sort
        // ===========================
        let order = [["created_at", "DESC"]];
        if (sort === "oldest") order = [["created_at", "ASC"]];
        if (sort === "price_asc") order = [["name", "ASC"]];   // tạm
        if (sort === "price_desc") order = [["name", "DESC"]]; // tạm

        // ===========================
        // D. Điều kiện cho variants (giá + màu/size)
        // ===========================
        const variantWhere = {
            is_active: true,
            deleted_at: null,
        };

        // Lọc theo khoảng giá của variant
        if (min_price !== undefined && min_price !== null) {
            variantWhere.price = {
                ...(variantWhere.price || {}),
                [Op.gte]: min_price,
            };
        }

        if (max_price !== undefined && max_price !== null) {
            variantWhere.price = {
                ...(variantWhere.price || {}),
                [Op.lte]: max_price,
            };
        }

        // ====== Build filter cho option_values (màu/size) ======
        const variantInclude = [];
        const hasColorOrSize = colorArray.length > 0 || sizeArray.length > 0;

        if (hasColorOrSize) {
            const valueList = [...colorArray, ...sizeArray];

            variantInclude.push({
                model: db.ProductOptionValue,
                as: "option_values",
                through: { attributes: [] }, // bỏ bảng nối
                where: {
                    value: { [Op.in]: valueList },
                },
                required: true, // Inner join: variant phải match ít nhất 1 trong các value này
            });
        }

        const hasVariantFilter =
            (min_price !== undefined && min_price !== null) ||
            (max_price !== undefined && max_price !== null) ||
            hasColorOrSize;

        const variantIncludeConfig = {
            model: db.ProductVariant,
            as: "variants",
            where: hasVariantFilter
                ? variantWhere
                : { is_active: true, deleted_at: null },
            required: hasVariantFilter, // Nếu có filter thì bắt buộc phải có variant match
            attributes: ["price", "stock"],
            include: variantInclude,
        };

        // ===========================
        // E. Query
        // ===========================
        const { count, rows } = await db.Product.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order,
            distinct: true,
            include: [
                {
                    model: db.Category,
                    as: "category",
                    attributes: ["id", "name", "slug"],
                },
                {
                    model: db.ProductImage,
                    as: "images",
                    where: { is_primary: true },
                    required: false,
                    attributes: ["image_url"],
                },
                variantIncludeConfig,
            ],
        });

        return {
            products: rows,
            pagination: {
                total: count,
                page,
                limit,
                total_pages: Math.ceil(count / limit),
            },
        };
    }

    // ============================================================
    // 2. LẤY CHI TIẾT SẢN PHẨM THEO SLUG
    // ============================================================
    async getProductBySlug(slug) {
        const product = await db.Product.findOne({
            where: { slug, is_active: true, deleted_at: null },
            include: [
                {
                    model: db.Category,
                    as: "category",
                    attributes: ["id", "name", "slug"],
                },
                {
                    model: db.ProductImage,
                    as: "images",
                    attributes: [
                        "image_url",
                        "is_primary",
                        "sort_order",
                        "product_variant_id",
                    ],
                },
                {
                    model: db.ProductOption,
                    as: "options",
                    include: [
                        {
                            model: db.ProductOptionValue,
                            as: "values",
                        },
                    ],
                },
                {
                    model: db.ProductVideo,
                    as: "videos",
                    attributes: ["id", "video_url"],
                },
                {
                    model: db.ProductVariant,
                    as: "variants",
                    where: { is_active: true, deleted_at: null },
                    required: false,
                    include: [
                        {
                            model: db.ProductImage,
                            as: "images",
                            where: { deleted_at: null },
                            required: false
                        },
                        {
                            model: db.ProductOptionValue,
                            as: "option_values",
                            through: { attributes: [] }
                        }
                    ]
                }

            ],
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        return product;
    }

    // ============================================================
    // 3. TẠO SẢN PHẨM (ADMIN)
    // ============================================================
    async createProduct(data) {
        return db.sequelize.transaction(async (t) => {
            // --------------------------
            // B0. Chuẩn hóa dữ liệu
            // --------------------------
            data.options = (data.options || []).map((opt) => ({
                name: opt.name.trim(),
                values: opt.values.map((v) => v.trim()),
            }));

            // --------------------------
            // B1. Tạo product gốc
            // --------------------------
            const slug =
                slugify(data.name, { lower: true, strict: true }) +
                "-" +
                Date.now();

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

            // --------------------------
            // B2. Tạo Options + Option Values
            // --------------------------
            const optionMap = {}; // "Màu-Đỏ" -> valueId

            for (const opt of data.options) {
                const newOption = await db.ProductOption.create(
                    {
                        product_id: product.id,
                        name: opt.name,
                    },
                    { transaction: t }
                );

                for (const val of opt.values) {
                    const newValue = await db.ProductOptionValue.create(
                        {
                            product_option_id: newOption.id,
                            value: val,
                        },
                        { transaction: t }
                    );

                    optionMap[`${opt.name}-${val}`] = newValue.id;
                }
            }

            // --------------------------
            // B3. Tạo Variants + bảng nối
            // --------------------------
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

                for (const [optNameRaw, optValRaw] of Object.entries(
                    variantData.options || {}
                )) {
                    const optName = optNameRaw.trim();
                    const optVal = optValRaw.trim();

                    const valueId = optionMap[`${optName}-${optVal}`];
                    if (!valueId) {
                        throw new Error(
                            `Option value not found for ${optName} - ${optVal}`
                        );
                    }

                    await db.ProductVariantOption.create(
                        {
                            product_variant_id: newVariant.id,
                            product_option_value_id: valueId,
                        },
                        { transaction: t }
                    );
                }
            }

            // --------------------------
            // B4. Tạo Images
            // --------------------------
            if (data.images && data.images.length > 0) {
                let hasPrimary = data.images.some((img) => img.is_primary);

                const imagePayload = data.images.map((img, index) => ({
                    product_id: product.id,
                    image_url: img.url,
                    is_primary: hasPrimary ? !!img.is_primary : index === 0,
                }));

                await db.ProductImage.bulkCreate(imagePayload, {
                    transaction: t,
                });
            }

            // --------------------------
            // B4.5. Tạo Videos
            // --------------------------
            if (data.videos && data.videos.length > 0) {
                const videoPayload = data.videos.map((vid) => ({
                    product_id: product.id,
                    video_url: vid.url,
                }));
                await db.ProductVideo.bulkCreate(videoPayload, { transaction: t });
            }

            // --------------------------
            // B5. Lấy lại product FULL
            // --------------------------
            const fullProduct = await db.Product.findOne({
                where: { id: product.id },
                include: [
                    {
                        model: db.Category,
                        as: "category",
                        attributes: ["id", "name", "slug"],
                    },
                    {
                        model: db.ProductImage,
                        as: "images",
                        where: { deleted_at: null },
                        required: false,
                    },
                    {
                        model: db.ProductOption,
                        as: "options",
                        include: [
                            {
                                model: db.ProductOptionValue,
                                as: "values",
                            },
                        ],
                    },
                    {
                        model: db.ProductVideo,
                        as: "videos",
                        attributes: ["id", "video_url"],
                    },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                        where: { deleted_at: null },
                        required: false,
                        include: [
                            {
                                model: db.ProductOptionValue,
                                as: "option_values",
                                through: { attributes: [] },
                            },
                            {
                                model: db.ProductImage,
                                as: "images",
                                where: { deleted_at: null },
                                required: false,
                            },
                        ],
                    },
                ],
                transaction: t,
            });

            return fullProduct;
        });
    }

    // ============================================================
    // 4. XÓA SẢN PHẨM (SOFT DELETE)
    // ============================================================
    async deleteProduct(productId) {
        const product = await db.Product.findOne({
            where: { id: productId, deleted_at: null }
        });
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        await product.destroy();
        return true;
    }

    // ============================================================
    // 5. UPDATE SẢN PHẨM (Basic Info + Variant Price/Stock)
    // ============================================================
    async updateProduct(productId, data) {
        return db.sequelize.transaction(async (t) => {
            const product = await db.Product.findOne({
                where: { id: productId, deleted_at: null },
                transaction: t,
            });
            if (!product) throw new NotFoundError("Product not found");

            // B1: update product
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

            // B2: update variants
            if (data.variants && data.variants.length > 0) {
                const updatePromises = data.variants.map((v) => {
                    const variantUpdateData = {};

                    if (v.price !== undefined) variantUpdateData.price = v.price;
                    if (v.stock !== undefined) variantUpdateData.stock = v.stock;
                    if (v.sku !== undefined) variantUpdateData.sku = v.sku;
                    if (v.is_active !== undefined) variantUpdateData.is_active = v.is_active;

                    // nếu không có field nào để update thì bỏ qua
                    if (Object.keys(variantUpdateData).length === 0) {
                        return Promise.resolve();
                    }

                    return db.ProductVariant.update(
                        variantUpdateData,
                        {
                            where: {
                                id: v.id,
                                product_id: product.id,
                                deleted_at: null,
                            },
                            transaction: t,
                        }
                    );
                });

                await Promise.all(updatePromises);
            }

            // B3: LẤY LẠI PRODUCT FULL SAU UPDATE
            const fullProduct = await db.Product.findOne({
                where: { id: product.id },
                include: [
                    {
                        model: db.Category,
                        as: "category",
                        attributes: ["id", "name", "slug"],
                    },
                    {
                        model: db.ProductImage,
                        as: "images",
                        where: { deleted_at: null },
                        required: false,
                    },
                    {
                        model: db.ProductOption,
                        as: "options",
                        include: [
                            {
                                model: db.ProductOptionValue,
                                as: "values",
                            },
                        ],
                    },
                    {
                        model: db.ProductVideo,
                        as: "videos",
                        attributes: ["id", "video_url"],
                    },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                        where: { deleted_at: null },
                        required: false,
                        include: [
                            {
                                model: db.ProductOptionValue,
                                as: "option_values",
                                through: { attributes: [] },
                            },
                            {
                                model: db.ProductImage,
                                as: "images",
                                where: { deleted_at: null },
                                required: false,
                            },
                        ],
                    },
                ],
                transaction: t,
            });


            return fullProduct;
        });
    }

}
module.exports = new ProductService();
