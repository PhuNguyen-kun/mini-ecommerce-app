const db = require("../models");
const JwtHelper = require("../utils/jwtHelper");
const { USER_ROLES } = require("../constants");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../utils/ApiError");

class AuthService {
  async register(userData) {
    const existingUser = await db.User.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    const user = await db.User.create({
      full_name: userData.full_name,
      email: userData.email,
      password_hash: userData.password,
      phone: userData.phone || null,
      role: USER_ROLES.CUSTOMER,
    });

    const token = JwtHelper.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async login(email, password, isAdminLogin = false) {
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.is_active) {
      throw new UnauthorizedError("Account is inactive");
    }

    // Nếu login từ trang user mà là admin thì reject
    if (!isAdminLogin && user.role === USER_ROLES.ADMIN) {
      throw new UnauthorizedError("Admin không thể đăng nhập ở trang này");
    }

    // Nếu login từ trang admin mà là user thì reject
    if (isAdminLogin && user.role === USER_ROLES.CUSTOMER) {
      throw new UnauthorizedError("Bạn không có quyền truy cập trang admin");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = JwtHelper.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async getProfile(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}

module.exports = new AuthService();
