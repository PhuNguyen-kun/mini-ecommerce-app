const JwtHelper = require("../utils/jwtHelper");
const { responseError } = require("../utils/apiResponse");
const db = require("../models");
const { USER_ROLES } = require("../constants");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return responseError(res, "Access token is required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = JwtHelper.verifyToken(token);

    const user = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user || !user.is_active) {
      return responseError(res, "User not found or inactive", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === "TOKEN_EXPIRED") {
      return responseError(res, "Token has expired", 401);
    }
    return responseError(res, "Invalid token", 401);
  }
};

// 2. Middleware chỉ cho phép Admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return responseError(res, "Unauthorized", 401);
  }

  // Check role dựa trên constant
  if (req.user.role !== USER_ROLES.ADMIN) {
    return responseError(res, "Forbidden: Admin access required", 403);
  }

  next();
};

module.exports = { authMiddleware, requireAdmin };