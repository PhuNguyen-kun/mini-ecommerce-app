const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateToggleWishlist = (req, res, next) => {
    const schema = Joi.object({
        product_id: Joi.number().integer().positive().required().messages({
            "number.base": "Product ID must be a number",
            "number.integer": "Product ID must be an integer",
            "any.required": "Product ID is required",
        }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return responseError(res, "Validation failed", 400, errors);
    }

    next();
};

module.exports = {
    validateToggleWishlist,
};