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

  async login(email, password) {
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.is_active) {
      throw new UnauthorizedError("Account is inactive");
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
