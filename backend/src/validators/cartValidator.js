const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateAddToCart = (req, res, next) => {
  const schema = Joi.object({
    product_variant_id: Joi.number().integer().positive().required().messages({
      "number.base": "Product variant ID must be a number",
      "number.integer": "Product variant ID must be an integer",
      "any.required": "Product variant ID is required",
    }),
    quantity: Joi.number().integer().positive().min(1).optional().messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 1",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateUpdateCartItem = (req, res, next) => {
  const schema = Joi.object({
    quantity: Joi.number().integer().positive().min(1).required().messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 1",
      "any.required": "Quantity is required",
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
  validateAddToCart,
  validateUpdateCartItem,
};
