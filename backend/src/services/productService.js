const db = require("../models");
const { Op, Sequelize } = require("sequelize");
const { NotFoundError } = require("../utils/ApiError");
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

        // 0) Normalize
        view = String(view).toLowerCase();
        if (!["card", "full"].includes(view)) view = "card";

        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        // 1) Parse category filters
        let categoryIdArray = [];
        if (category_ids) {
            if (Array.isArray(category_ids)) {
                categoryIdArray = category_ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
            } else {
                categoryIdArray = String(category_ids).split(",").map((id) => Number(id.trim())).filter((id) => !Number.isNaN(id));
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

        // 2) Product where
        const whereCondition = {
            is_active: true,
            deleted_at: null,
        };
        if (gender) whereCondition.gender = gender;
        if (categoryIdArray.length > 0) whereCondition.category_id = { [Op.in]: categoryIdArray };
        if (search) whereCondition.name = { [Op.like]: `%${search}%` };

        // 3) Variant where
        const variantWhere = { is_active: true, deleted_at: null };
        if (min_price) variantWhere.price = { ...variantWhere.price || {}, [Op.gte]: Number(min_price) };
        if (max_price) variantWhere.price = { ...variantWhere.price || {}, [Op.lte]: Number(max_price) };

        const hasVariantFilter = min_price || max_price || hasColorOrSize;

        // 4) Variant Includes
        const variantIncludesForFiltering = [];
        if (hasColors) {
            variantIncludesForFiltering.push({
                model: db.ProductOptionValue,
                as: "color_values",
                through: { attributes: [] },
                required: true,
                where: { value: { [Op.in]: colorArray } },
                include: [{ model: db.ProductOption, as: "option", attributes: [], required: true, where: { name: { [Op.in]: COLOR_OPTION_NAMES } } }]
            });
        }
        if (hasSizes) {
            variantIncludesForFiltering.push({
                model: db.ProductOptionValue,
                as: "size_values",
                through: { attributes: [] },
                required: true,
                where: { value: { [Op.in]: sizeArray } },
                include: [{ model: db.ProductOption, as: "option", attributes: [], required: true, where: { name: { [Op.in]: SIZE_OPTION_NAMES } } }]
            });
        }

        const variantIncludeForFullView = [
            {
                model: db.ProductOptionValue,
                as: "option_values",
                through: { attributes: [] },
                required: false,
                include: [{ model: db.ProductOption, as: "option", attributes: ["name"] }],
            },
        ];

        const finalVariantInclude = view === "full"
            ? [...variantIncludeForFullView, ...variantIncludesForFiltering]
            : [...variantIncludesForFiltering];

        const variantIncludeConfig = {
            model: db.ProductVariant,
            as: "variants",
            where: hasVariantFilter ? variantWhere : { is_active: true, deleted_at: null },
            required: !!hasVariantFilter,
            attributes: view === "card" ? ["price", "stock"] : ["id", "price", "stock", "sku"],
            include: finalVariantInclude,
        };

        // 7) Sort
        const needPriceSort = sort === "price_asc" || sort === "price_desc";
        let order = [["created_at", "DESC"]];
        if (sort === "oldest") order = [["created_at", "ASC"]];
        if (needPriceSort) {
            const dir = sort === "price_asc" ? "ASC" : "DESC";
            const minPriceSubQuery = `(SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = Product.id AND v.deleted_at IS NULL AND v.is_active = 1)`;
            order = [[Sequelize.literal(minPriceSubQuery), dir]];
        }

        // 8) Build query
        const productAttributesCard = ["id", "category_id", "name", "slug", "gender", "short_description", "is_active", "created_at", "updated_at"];

        const query = {
            where: whereCondition,
            limit,
            offset,
            order,
            distinct: true,
            attributes: view === "card" ? productAttributesCard : undefined,
            include: [
                {
                    model: db.Category,
                    as: "category",
                    attributes: ["id", "name", "slug"],
                    where: { deleted_at: null },
                    required: false,
                },
                {
                    model: db.ProductImage,
                    as: "images",
                    where: { is_primary: true, deleted_at: null },
                    required: false,
                    attributes: ["image_url"],
                },
                variantIncludeConfig,
            ],
        };

        const { count, rows } = await db.Product.findAndCountAll(query);
        const total = count;

        if (view === "full") {
            return {
                products: rows,
                pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
            };
        }

        const products = rows.map((p) => {
            const variants = p.variants || [];
            let price_from = null;
            for (const v of variants) {
                const num = Number(v.price);
                if (!Number.isNaN(num)) {
                    if (price_from === null || num < price_from) price_from = num;
                }
            }
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
            pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
        };
    }

    // ============================================================
    // 2. CLIENT - LẤY CHI TIẾT SẢN PHẨM THEO SLUG
    // ============================================================
    async getProductBySlug(slug) {
        const product = await db.Product.findOne({
            where: { slug, is_active: true, deleted_at: null },
            include: [
                {
                    model: db.Category,
                    as: "category",
                    attributes: ["id", "name", "slug"],
                    where: { deleted_at: null },
                    required: false,
                },
                // ✅ 1. LẤY ẢNH + OPTION_VALUE_ID
                {
                    model: db.ProductImage,
                    as: "images",
                    where: { deleted_at: null },
                    required: false,
                    // Lấy thêm cột product_option_value_id để FE biết ảnh này của màu nào
                    attributes: ["id", "image_url", "is_primary", "sort_order", "product_option_value_id"],
                    separate: true,
                    order: [
                        ["is_primary", "DESC"],
                        ["sort_order", "ASC"],
                        ["id", "ASC"],
                    ],
                },
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
                {
                    model: db.ProductVideo,
                    as: "videos",
                    where: { deleted_at: null },
                    required: false,
                    attributes: ["id", "video_url"],
                },
                {
                    model: db.ProductVariant,
                    as: "variants",
                    where: { is_active: true, deleted_at: null },
                    required: false,
                    attributes: ["id", "price", "stock", "sku"],
                    include: [
                        // KHÔNG CẦN INCLUDE ẢNH TRONG VARIANT NỮA
                        {
                            model: db.ProductOptionValue,
                            as: "option_values",
                            through: { attributes: [] },
                            attributes: ["id", "value", "meta", "product_option_id"],
                            include: [{ model: db.ProductOption, as: "option", attributes: ["id", "name"] }],
                        },
                    ],
                },
            ],
        });

        if (!product) throw new NotFoundError("Product not found");

        return product;
    }
}

module.exports = new ProductService();