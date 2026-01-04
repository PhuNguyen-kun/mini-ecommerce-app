const db = require("../models");
const { NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");

/**
 * User Category Service - READ-ONLY
 * Admin CRUD operations được xử lý tại services/admin/categoryService.js
 */
class CategoryService {
  /**
   * Lấy danh sách categories với phân trang (public)
   */
  async getAll(query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);

    const { count, rows } = await db.Category.findAndCountAll({
      where: { is_active: true }, // Chỉ lấy categories active cho user
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "slug"],
          where: { is_active: true },
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    const pagination = getPaginationMeta(count, page, per_page);

    return { categories: rows, pagination };
  }

  /**
   * Lấy chi tiết category theo slug (public)
   */
  async getBySlug(slug) {
    const category = await db.Category.findOne({
      where: { slug, is_active: true }, // Chỉ lấy category active
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "slug"],
          where: { is_active: true },
          required: false,
        },
      ],
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }
}

module.exports = new CategoryService();
