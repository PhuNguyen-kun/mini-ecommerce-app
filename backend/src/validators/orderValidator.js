const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateCheckout = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().trim().min(2).max(255).required().messages({
      "string.empty": "Họ tên không được để trống",
      "string.min": "Họ tên phải có ít nhất 2 ký tự",
      "any.required": "Họ tên là bắt buộc",
    }),
    phone: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.empty": "Số điện thoại không được để trống",
        "string.pattern.base": "Số điện thoại không hợp lệ (phải có 10 chữ số)",
        "any.required": "Số điện thoại là bắt buộc",
      }),
    email: Joi.string().trim().email().required().messages({
      "string.empty": "Email không được để trống",
      "string.email": "Email không hợp lệ",
      "any.required": "Email là bắt buộc",
    }),
    address: Joi.string().trim().min(5).max(255).required().messages({
      "string.empty": "Địa chỉ không được để trống",
      "string.min": "Địa chỉ phải có ít nhất 5 ký tự",
      "any.required": "Địa chỉ là bắt buộc",
    }),
    province_id: Joi.number().integer().positive().required().messages({
      "number.base": "Tỉnh/Thành phố không hợp lệ",
      "any.required": "Vui lòng chọn tỉnh/thành phố",
    }),
    district_id: Joi.number().integer().positive().required().messages({
      "number.base": "Quận/Huyện không hợp lệ",
      "any.required": "Vui lòng chọn quận/huyện",
    }),
    ward_id: Joi.number().integer().positive().required().messages({
      "number.base": "Phường/Xã không hợp lệ",
      "any.required": "Vui lòng chọn phường/xã",
    }),
    note: Joi.string().trim().max(500).allow("", null).optional(),
    paymentMethod: Joi.string()
      .valid("cod", "vnpay")
      .required()
      .messages({
        "any.only": "Phương thức thanh toán không hợp lệ",
        "any.required": "Vui lòng chọn phương thức thanh toán",
      }),
    shipping_fee: Joi.number().min(0).optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

module.exports = {
  validateCheckout,
};

