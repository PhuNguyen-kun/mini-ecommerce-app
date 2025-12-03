const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const slugify = require("../utils/slugify");

class CategoryService {
  async getAll(query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);

    const { count, rows } = await db.Category.findAndCountAll({
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "slug", "is_active"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    const pagination = getPaginationMeta(count, page, per_page);

    return { categories: rows, pagination };
  }

  async getBySlug(slug) {
    const category = await db.Category.findOne({
      where: { slug },
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "slug", "is_active"],
        },
      ],
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }

  async create(categoryData) {
    const slug = slugify(categoryData.name);

    const existingSlug = await db.Category.findOne({
      where: { slug },
    });

    if (existingSlug) {
      throw new BadRequestError("Category with similar name already exists");
    }

    if (categoryData.parent_id) {
      const parentCategory = await db.Category.findByPk(categoryData.parent_id);
      if (!parentCategory) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const category = await db.Category.create({
      ...categoryData,
      slug,
    });

    return category;
  }

  async update(slug, categoryData) {
    const category = await db.Category.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (categoryData.name && categoryData.name !== category.name) {
      const newSlug = slugify(categoryData.name);

      const existingSlug = await db.Category.findOne({
        where: { slug: newSlug },
      });

      if (existingSlug && existingSlug.id !== category.id) {
        throw new BadRequestError("Category with similar name already exists");
      }

      categoryData.slug = newSlug;
    }

    if (categoryData.parent_id) {
      if (categoryData.parent_id === category.id) {
        throw new BadRequestError("Category cannot be its own parent");
      }

      const parentCategory = await db.Category.findByPk(categoryData.parent_id);
      if (!parentCategory) {
        throw new NotFoundError("Parent category not found");
      }
    }

    await category.update(categoryData);

    return category;
  }

  async delete(slug) {
    const category = await db.Category.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const hasChildren = await db.Category.count({
      where: { parent_id: category.id },
    });

    if (hasChildren > 0) {
      throw new BadRequestError("Cannot delete category with subcategories");
    }

    const hasProducts = await db.Product.count({
      where: { category_id: category.id },
    });

    if (hasProducts > 0) {
      throw new BadRequestError("Cannot delete category with products");
    }

    await category.destroy();

    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();
