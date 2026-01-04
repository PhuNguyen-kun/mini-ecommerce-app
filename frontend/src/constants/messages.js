// Validation error messages
export const VALIDATION_MESSAGES = {
  // Login
  EMAIL_REQUIRED: "Email là bắt buộc",
  EMAIL_INVALID: "Email không hợp lệ",
  PASSWORD_REQUIRED: "Mật khẩu là bắt buộc",

  // Signup
  FULL_NAME_REQUIRED: "Họ và tên là bắt buộc",
  FULL_NAME_MIN_LENGTH: "Họ và tên phải có ít nhất 2 ký tự",
  FULL_NAME_MAX_LENGTH: "Họ và tên không được vượt quá 255 ký tự",
  CONFIRM_PASSWORD_REQUIRED: "Vui lòng xác nhận mật khẩu",
  CONFIRM_PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp",
  PASSWORD_MIN_LENGTH: "Mật khẩu phải có ít nhất 6 ký tự",
  PHONE_REQUIRED: "Số điện thoại là bắt buộc",
  PHONE_INVALID: "Số điện thoại phải có 10-11 chữ số",

  // API errors
  LOGIN_FAILED: "Đăng nhập thất bại. Vui lòng thử lại.",
  REGISTER_FAILED: "Đăng ký thất bại. Vui lòng thử lại.",
  EMAIL_ALREADY_EXISTS:
    "Email này đã được sử dụng. Vui lòng sử dụng email khác.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  ACCOUNT_INACTIVE: "Tài khoản đã bị vô hiệu hóa.",
  NETWORK_ERROR: "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  REGISTER_SUCCESS: "Đăng ký thành công!",
  LOGOUT_SUCCESS: "Đăng xuất thành công!",
};
