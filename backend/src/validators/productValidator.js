const Joi = require("joi");

// CLIENT: filter list
const filterProductSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow("", null),

    category_id: Joi.number().integer().allow(null),

    category_ids: Joi.alternatives()
        .try(Joi.string(), Joi.array().items(Joi.number().integer()))
        .optional(),

    gender: Joi.string().valid("male", "female", "unisex").allow(null),

    sort: Joi.string()
        .valid("price_asc", "price_desc", "newest", "oldest")
        .default("newest"),

    min_price: Joi.number().integer().min(0).allow(null),
    max_price: Joi.number().integer().min(0).allow(null),

    colors: Joi.alternatives()
        .try(Joi.string(), Joi.array().items(Joi.string()))
        .optional(),

    sizes: Joi.alternatives()
        .try(Joi.string(), Joi.array().items(Joi.string()))
        .optional(),
});

// ADMIN: create product (JSON-only)
const createProductSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().allow("", null),
    short_description: Joi.string().max(500).allow("", null),
    category_id: Joi.number().integer().allow(null),
    gender: Joi.string().valid("male", "female", "unisex").required().default("unisex"),

    options: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                values: Joi.array().items(Joi.string().required()).min(1).required(),
            })
        )
        .min(1)
        .required(),

    variants: Joi.array()
        .items(
            Joi.object({
                sku: Joi.string().required(),
                price: Joi.number().integer().min(0).required(),
                stock: Joi.number().integer().min(0).default(0),
                options: Joi.object().unknown(true).min(1).required(),
            })
        )
        .min(1)
        .required(),
});

// ADMIN: upload media (form-data -> middleware map thành JSON)
const addMediaSchema = Joi.object({
    images: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                public_id: Joi.string().required(),
                is_primary: Joi.boolean().default(false),
            })
        )
        .optional(),

    videos: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                public_id: Joi.string().required(),
            })
        )
        .optional(),
})
    .custom((value, helpers) => {
        const hasImages = Array.isArray(value.images) && value.images.length > 0;
        const hasVideos = Array.isArray(value.videos) && value.videos.length > 0;
        if (!hasImages && !hasVideos) {
            return helpers.message("Phải upload ít nhất 1 ảnh hoặc 1 video");
        }
        return value;
    }, "Require at least one media")
    .options({ stripUnknown: true }); //bỏ field lạ nếu có

// ADMIN: update product (JSON-only)
const updateProductSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().allow("", null).optional(),
    short_description: Joi.string().max(500).allow("", null).optional(),
    category_id: Joi.number().integer().allow(null).optional(),
    gender: Joi.string().valid("male", "female", "unisex").optional(),
    is_active: Joi.boolean().optional(),

    variants: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().required(),
                sku: Joi.string().optional(),
                price: Joi.number().integer().min(0).optional(),
                stock: Joi.number().integer().min(0).optional(),
                is_active: Joi.boolean().optional(),
            })
        )
        .min(1) //nếu có variants thì phải có phần tử
        .optional(),
});

const validate = (schema) => (req, res, next) => {
    const data = req.method === "GET" ? req.query : req.body;
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details,
        });
    }

    if (req.method === "GET") req.query = value;
    else req.body = value;

    next();
};

module.exports = {
    validateFilterProduct: validate(filterProductSchema),
    validateCreateProduct: validate(createProductSchema),
    validateUpdateProduct: validate(updateProductSchema),
    validateAddMedia: validate(addMediaSchema),
};
