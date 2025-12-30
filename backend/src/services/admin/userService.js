const db = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, BadRequestError } = require("../../utils/ApiError");

class UserService {
  async getAllUsers({ page = 1, limit = 10, search, role, is_active, startDate, endDate }) {
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (role) {
      whereClause.role = role;
    }

    if (is_active !== undefined && is_active !== null) {
      whereClause.is_active = is_active === true || is_active === "true";
    }

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = endDateTime;
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.User.findAndCountAll({
      where: whereClause,
      attributes: {
        exclude: ["password_hash", "deleted_at"],
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async getUserStats() {
    const now = new Date();
    const startOfMonth = new Date(now);
    startOfMonth.setMonth(now.getMonth() - 1);

    const totalUsers = await db.User.count();
    const activeUsers = await db.User.count({ where: { is_active: true } });
    const inactiveUsers = await db.User.count({ where: { is_active: false } });
    const newUsersThisMonth = await db.User.count({
      where: {
        created_at: { [Op.gte]: startOfMonth },
      },
    });

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      newThisMonth: newUsersThisMonth,
    };
  }

  async getUserById(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: {
        exclude: ["password_hash", "deleted_at"],
      },
      include: [
        {
          model: db.Order,
          as: "orders",
          attributes: ["id", "order_code", "status", "total_amount", "created_at"],
          limit: 10,
          order: [["created_at", "DESC"]],
        },
        {
          model: db.UserAddress,
          as: "addresses",
          attributes: [
            "id",
            "receiver_name",
            "phone",
            "address_line",
            "ward_id",
            "district_id",
            "province_id",
            "is_default",
          ],
          include: [
            {
              model: db.Province,
              as: "province",
              attributes: ["id", "name"],
            },
            {
              model: db.District,
              as: "district",
              attributes: ["id", "name"],
            },
            {
              model: db.Ward,
              as: "ward",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateUser(userId, updateData, currentUserId) {
    const user = await db.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (
      updateData.is_active !== undefined &&
      updateData.is_active === false &&
      currentUserId &&
      currentUserId === userId
    ) {
      throw new BadRequestError("Cannot deactivate your own account");
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await db.User.findOne({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new BadRequestError("Email already exists");
      }
    }

    const allowedFields = ["full_name", "email", "phone", "is_active"];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);

    return user.toJSON();
  }
}

module.exports = new UserService();
