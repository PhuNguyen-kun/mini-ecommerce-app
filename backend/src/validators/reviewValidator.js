const Joi = require("joi");
const { REVIEW_CONSTANTS, REVIEW_SORT, REVIEW_FILTER } = require("../constants/orderConstants");

// Validate create review
const createReviewSchema = Joi.object({
    productId: Joi.number().integer().positive().required().messages({
        "any.required": "Product ID is required",
        "number.base": "Product ID must be a number",
        "number.positive": "Product ID must be positive",
    }),
    
    rating: Joi.number()
        .integer()
        .min(REVIEW_CONSTANTS.MIN_RATING)
        .max(REVIEW_CONSTANTS.MAX_RATING)
        .required()
        .messages({
            "any.required": "Rating is required",
            "number.min": `Rating must be at least ${REVIEW_CONSTANTS.MIN_RATING}`,
            "number.max": `Rating must not exceed ${REVIEW_CONSTANTS.MAX_RATING}`,
        }),
    
    comment: Joi.string()
        .min(REVIEW_CONSTANTS.MIN_COMMENT_LENGTH)
        .max(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH)
        .required()
        .messages({
            "any.required": "Comment is required",
            "string.min": `Comment must be at least ${REVIEW_CONSTANTS.MIN_COMMENT_LENGTH} characters`,
            "string.max": `Comment must not exceed ${REVIEW_CONSTANTS.MAX_COMMENT_LENGTH} characters`,
        }),
    
    images: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                public_id: Joi.string().required(),
            })
        )
        .max(REVIEW_CONSTANTS.MAX_IMAGES)
        .optional()
        .messages({
            "array.max": `Maximum ${REVIEW_CONSTANTS.MAX_IMAGES} images allowed`,
        }),
    
    videos: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                public_id: Joi.string().required(),
            })
        )
        .max(REVIEW_CONSTANTS.MAX_VIDEOS)
        .optional()
        .messages({
            "array.max": `Maximum ${REVIEW_CONSTANTS.MAX_VIDEOS} video allowed`,
        }),
});

// Validate update review
const updateReviewSchema = Joi.object({
    reviewId: Joi.number().integer().positive().required(),
    rating: Joi.number()
        .integer()
        .min(REVIEW_CONSTANTS.MIN_RATING)
        .max(REVIEW_CONSTANTS.MAX_RATING)
        .optional()
        .messages({
            "number.min": `Rating must be at least ${REVIEW_CONSTANTS.MIN_RATING}`,
            "number.max": `Rating must not exceed ${REVIEW_CONSTANTS.MAX_RATING}`,
        }),
    
    comment: Joi.string()
        .min(REVIEW_CONSTANTS.MIN_COMMENT_LENGTH)
        .max(REVIEW_CONSTANTS.MAX_COMMENT_LENGTH)
        .optional()
        .messages({
            "string.min": `Comment must be at least ${REVIEW_CONSTANTS.MIN_COMMENT_LENGTH} characters`,
            "string.max": `Comment must not exceed ${REVIEW_CONSTANTS.MAX_COMMENT_LENGTH} characters`,
        }),
    
    images: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                public_id: Joi.string().required(),
            })
        )
        .max(REVIEW_CONSTANTS.MAX_IMAGES)
        .optional()
        .messages({
            "array.max": `Maximum ${REVIEW_CONSTANTS.MAX_IMAGES} images allowed`,
        }),
    
    videos: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                public_id: Joi.string().required(),
                thumbnail_url: Joi.string().uri().optional(),
            })
        )
        .max(REVIEW_CONSTANTS.MAX_VIDEOS || 1)
        .optional()
        .messages({
            "array.max": `Maximum ${REVIEW_CONSTANTS.MAX_VIDEOS || 1} video allowed`,
        }),
    
    removeVideo: Joi.boolean().optional(),
    existingImages: Joi.string().optional(), // JSON string from formData
});

// Validate get reviews query
const getReviewsSchema = Joi.object({
    productId: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    sort: Joi.string()
        .valid(...Object.values(REVIEW_SORT))
        .default(REVIEW_SORT.NEWEST),
    filter: Joi.string()
        .valid(...Object.values(REVIEW_FILTER))
        .default(REVIEW_FILTER.ALL),
    rating: Joi.number().integer().min(1).max(5).optional(),
});

// Review ID validation
const reviewIdSchema = Joi.object({
    reviewId: Joi.number().integer().positive().required(),
});

// Product ID validation  
const productIdSchema = Joi.object({
    productId: Joi.number().integer().positive().required(),
});

// Middleware to validate
const validate = (schema, source = "body") => {
    return (req, res, next) => {
        let dataToValidate = {};
        
        // Merge data from different sources based on validation needs
        if (source === "body") {
            dataToValidate = { ...req.body, ...req.params };
        } else if (source === "query") {
            dataToValidate = { ...req.query, ...req.params };
        } else if (source === "params") {
            dataToValidate = req.params;
        }

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors,
            });
        }

        // Assign validated values to appropriate request property
        if (source === "body") {
            req.body = value;
        } else if (source === "query") {
            req.query = value;
        } else if (source === "params") {
            req.params = value;
        }

        next();
    };
};

module.exports = {
    validateCreateReview: validate(createReviewSchema, "body"),
    validateUpdateReview: validate(updateReviewSchema, "body"),
    validateGetReviews: validate(getReviewsSchema, "query"),
    validateReviewId: validate(reviewIdSchema, "params"),
    validateProductId: validate(productIdSchema, "params"),
};
