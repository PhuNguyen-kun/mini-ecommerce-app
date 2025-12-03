const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateGetAllCategories = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    per_page: Joi.number().integer().min(1).max(100).optional().messages({
      "number.base": "Per page must be a number",
      "number.integer": "Per page must be an integer",
      "number.min": "Per page must be at least 1",
      "number.max": "Per page must not exceed 100",
    }),
  });

  const { error } = schema.validate(req.query, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateCreateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must not exceed 255 characters",
      "any.required": "Category name is required",
    }),
    description: Joi.string().allow(null, "").optional(),
    parent_id: Joi.number().integer().positive().allow(null).optional(),
    is_active: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).optional().messages({
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must not exceed 255 characters",
    }),
    description: Joi.string().allow(null, "").optional(),
    parent_id: Joi.number().integer().positive().allow(null).optional(),
    is_active: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

module.exports = {
  validateGetAllCategories,
  validateCreateCategory,
  validateUpdateCategory,
};
