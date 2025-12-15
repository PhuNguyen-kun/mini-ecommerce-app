const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const addressSchema = Joi.object({
    receiver_name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),

    // Validate ID phải là số
    province_id: Joi.number().integer().required(),
    district_id: Joi.number().integer().required(),
    ward_id: Joi.number().integer().required(),

    address_line: Joi.string().required(), // Số nhà, đường...
    is_default: Joi.boolean().optional(),
});

const validateAddress = (req, res, next) => {
    const { error } = addressSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return responseError(res, "Validation failed", 400, errors);
    }
    next();
};

module.exports = { validateAddress };