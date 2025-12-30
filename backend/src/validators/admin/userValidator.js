const Joi = require("joi");

const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(255).optional().messages({
    "string.empty": "Full name cannot be empty",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name must not exceed 255 characters",
  }),
  email: Joi.string().email().optional().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Invalid email format",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Phone number must be 10-11 digits",
    }),
  is_active: Joi.boolean().optional(),
});

const validateUpdateUser = (req, res, next) => {
  const { error } = updateUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.reduce((acc, err) => {
      acc[err.path[0]] = err.message;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateUpdateUser,
};

