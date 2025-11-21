const Joi = require("joi");

const signupSchema = Joi.object({
  full_name: Joi.string().min(2).max(255).required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name must not exceed 255 characters",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Phone number must be 10-11 digits",
    }),
});

const signinSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
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

    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(signupSchema),
  validateLogin: validate(signinSchema),
};
