const Joi = require("joi");

// Validate bộ lọc khi lấy danh sách
const filterProductSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10),
    search: Joi.string().allow("", null),

    // 1 category cũ (vẫn hỗ trợ để không gãy FE cũ)
    category_id: Joi.number().integer().allow(null),

    // nhiều category, truyền "1,2,3" hoặc [1,2,3]
    category_ids: Joi.alternatives()
        .try(
            Joi.string(),                               // "1,2,3"
            Joi.array().items(Joi.number().integer())   // [1,2,3]
        )
        .optional(),

    gender: Joi.string().valid("male", "female", "unisex").allow(null),

    sort: Joi.string()
        .valid("price_asc", "price_desc", "newest", "oldest")
        .default("newest"),

    min_price: Joi.number().integer().min(0).allow(null),
    max_price: Joi.number().integer().min(0).allow(null),

    // nhiều màu  "Đỏ,Xanh" hoặc ["Đỏ","Xanh"]
    colors: Joi.alternatives()
        .try(
            Joi.string(),                  // "Đỏ,Xanh"
            Joi.array().items(Joi.string())
        )
        .optional(),

    // Validate sizes: "M,L" hoặc ["M","L"]
    sizes: Joi.alternatives()
        .try(
            Joi.string(),                  // "M,L"
            Joi.array().items(Joi.string())
        )
        .optional(),
});

// Validate dữ liệu khi tạo mới sản phẩm
const createProductSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().allow("", null),
    short_description: Joi.string().max(500).allow("", null),
    category_id: Joi.number().integer().allow(null),
    gender: Joi.string().valid("male", "female", "unisex").required().default("unisex"),

    // Mảng Options (VD: [{name: "Màu"}, {name: "Size"}])
    options: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                values: Joi.array().items(Joi.string().required()).required(),
            })
        )
        .min(1)
        .required(),

    // Mảng Variants
    variants: Joi.array()
        .items(
            Joi.object({
                sku: Joi.string().required(),
                price: Joi.number().integer().min(0).required(),
                stock: Joi.number().integer().min(0).default(0),
                // Mapping option: { "Color": "Red", "Size": "M" }
                options: Joi.object().unknown(true).required(),
            })
        )
        .min(1)
        .required(),

    // Ảnh sản phẩm
    images: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                is_primary: Joi.boolean().default(false),
            })
        )
        .optional(),

    // Video sản phẩm
    videos: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
            })
        )
        .optional(),
});

// Validate Update (Copy từ Create nhưng sửa thành optional)
const updateProductSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().allow('', null).optional(),
    short_description: Joi.string().max(500).allow('', null).optional(),
    category_id: Joi.number().integer().allow(null).optional(),
    gender: Joi.string().valid('male', 'female', 'unisex').optional(),
    is_active: Joi.boolean().optional(), // Cho phép ẩn/hiện sản phẩm

    // Update variants: Chỉ cho phép sửa giá/tồn kho của variant đã có
    variants: Joi.array().items(
        Joi.object({
            id: Joi.number().required(), // Phải có ID để biết sửa cái nào
            sku: Joi.string().optional(),
            price: Joi.number().integer().min(0).optional(),
            stock: Joi.number().integer().min(0).optional(),
            is_active: Joi.boolean().optional()
        })
    ).optional(),

    // Images/Videos: sẽ có API riêng để upload/xóa ảnh. 
});
const validate = (schema) => (req, res, next) => {
    const data = req.method === "GET" ? req.query : req.body;
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
    });

    if (error) {
        return res
            .status(400)
            .json({ success: false, message: "Validation error", details: error.details });
    }

    if (req.method === "GET") req.query = value;
    else req.body = value;

    next();
};

module.exports = {
    validateFilterProduct: validate(filterProductSchema),
    validateCreateProduct: validate(createProductSchema),
    validateUpdateProduct: validate(updateProductSchema),
};
