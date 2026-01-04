const db = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, BadRequestError } = require("../../utils/ApiError");
const slugify = require("../../utils/slugify");

class CategoryAdminService {
    /**
     * Lấy danh sách tất cả categories với phân trang và tìm kiếm
     * @param {Object} query - Query parameters (page, limit, search, is_active, parent_id)
     * @returns {Object} - { categories, pagination }
     */
    async getAllCategories(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = query.search || "";
        const isActive = query.is_active;
        const parentId = query.parent_id;

        // Build where conditions
        const whereConditions = {};

        // Mặc định chỉ lấy root categories (parent_id = null)
        // Trừ khi có filter parent_id cụ thể
        if (parentId === undefined) {
            whereConditions.parent_id = null;
        } else if (parentId !== undefined) {
            whereConditions.parent_id = parentId === "null" ? null : parentId;
        }

        if (search) {
            // Khi search, bỏ filter parent_id để tìm tất cả
            delete whereConditions.parent_id;
            whereConditions[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { slug: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        if (isActive !== undefined) {
            whereConditions.is_active = isActive === "true" || isActive === true;
        }

        const { count, rows } = await db.Category.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                {
                    model: db.Category,
                    as: "parent",
                    attributes: ["id", "name", "slug"],
                },
                {
                    model: db.Category,
                    as: "children",
                    attributes: ["id", "name", "slug", "is_active", "created_at"],
                    where: { deleted_at: null },
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]],
            distinct: true,
        });

        return {
            categories: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    /**
     * Lấy thông tin chi tiết một category
     * @param {Number} categoryId - ID của category
     * @returns {Object} - Category object
     */
    async getCategoryById(categoryId) {
        const category = await db.Category.findByPk(categoryId, {
            include: [
                {
                    model: db.Category,
                    as: "parent",
                    attributes: ["id", "name", "slug"],
                },
                {
                    model: db.Category,
                    as: "children",
                    attributes: ["id", "name", "slug", "is_active", "created_at"],
                    where: { deleted_at: null },
                    required: false,
                },
                {
                    model: db.Product,
                    as: "products",
                    attributes: ["id", "name", "slug"],
                    where: { deleted_at: null },
                    required: false,
                    limit: 10,
                },
            ],
        });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        return category;
    }

    /**
     * Tạo category mới (Có Transaction & Xử lý trùng Slug an toàn)
     * @param {Object} data - { name, description, parent_id, is_active }
     * @returns {Object} - Created category
     */
    async createCategory(data) {
        const t = await db.sequelize.transaction();

        try {
            const { name, description, parent_id, is_active } = data;

            // Kiểm tra parent_id có tồn tại không
            if (parent_id) {
                const parentCategory = await db.Category.findByPk(parent_id, { transaction: t });
                if (!parentCategory) {
                    throw new NotFoundError("Parent category not found");
                }
            }

            // Tạo slug từ name
            const baseSlug = slugify(name, { lower: true, strict: true });
            let slug = baseSlug;
            let counter = 1;

            // Kiểm tra slug (quan trọng: dùng paranoid: false để check cả các record đã soft-delete)
            while (
                await db.Category.findOne({
                    where: { slug },
                    paranoid: false,
                    transaction: t
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            const category = await db.Category.create({
                name,
                slug,
                description,
                parent_id: parent_id || null,
                is_active: is_active !== undefined ? is_active : true,
            }, { transaction: t });

            await t.commit();

            // Lấy lại category với đầy đủ thông tin (không cần transaction chỗ này)
            return await this.getCategoryById(category.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Cập nhật category (Có Transaction & Xử lý trùng Slug an toàn)
     * @param {Number} categoryId - ID của category
     * @param {Object} data - { name, description, parent_id, is_active }
     * @returns {Object} - Updated category
     */
    async updateCategory(categoryId, data) {
        const t = await db.sequelize.transaction();

        try {
            const category = await db.Category.findByPk(categoryId, { transaction: t });

            if (!category) {
                throw new NotFoundError("Category not found");
            }

            const { name, description, parent_id, is_active } = data;

            // Kiểm tra parent_id
            if (parent_id !== undefined) {
                // Check 1: Không được làm cha của chính mình
                if (parent_id == categoryId) {
                    throw new BadRequestError("Category cannot be its own parent");
                }

                if (parent_id) {
                    const parentCategory = await db.Category.findByPk(parent_id, { transaction: t });
                    if (!parentCategory) {
                        throw new NotFoundError("Parent category not found");
                    }

                    // Check 2: Không tạo vòng lặp (parent không được là con của category này)
                    const isDescendant = await this.isDescendantOf(parent_id, categoryId);
                    if (isDescendant) {
                        throw new BadRequestError("Cannot set a descendant category as parent");
                    }
                }
            }

            // Nếu name thay đổi, tạo slug mới
            let slug = category.slug;
            if (name && name !== category.name) {
                const baseSlug = slugify(name, { lower: true, strict: true });
                slug = baseSlug;
                let counter = 1;

                // Check slug unique (trừ chính nó ra) và check cả soft-delete
                while (
                    await db.Category.findOne({
                        where: {
                            slug,
                            id: { [Op.ne]: categoryId },
                        },
                        paranoid: false, // Check cả thùng rác
                        transaction: t,
                    })
                ) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
            }

            // Update category
            await category.update({
                name: name !== undefined ? name : category.name,
                slug,
                description: description !== undefined ? description : category.description,
                parent_id: parent_id !== undefined ? parent_id : category.parent_id,
                is_active: is_active !== undefined ? is_active : category.is_active,
            }, { transaction: t });

            await t.commit();

            return await this.getCategoryById(categoryId);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Xóa category (soft delete)
     * @param {Number} categoryId - ID của category
     */
    async deleteCategory(categoryId) {
        const category = await db.Category.findByPk(categoryId, {
            include: [
                {
                    model: db.Category,
                    as: "children",
                    where: { deleted_at: null },
                    required: false,
                },
                {
                    model: db.Product,
                    as: "products",
                    where: { deleted_at: null },
                    required: false,
                },
            ],
        });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        // Kiểm tra xem category có children không
        if (category.children && category.children.length > 0) {
            throw new BadRequestError("Cannot delete category with subcategories. Please delete or reassign subcategories first.");
        }

        // Kiểm tra xem category có products không
        if (category.products && category.products.length > 0) {
            throw new BadRequestError("Cannot delete category with products. Please reassign or delete products first.");
        }

        // Set is_active = 0 trước khi soft delete
        await category.update({ is_active: false });
        await category.destroy();
    }

    /**
     * Kích hoạt/vô hiệu hóa category
     * @param {Number} categoryId - ID của category
     * @param {Boolean} isActive - true/false
     * @returns {Object} - Updated category
     */
    async toggleActiveStatus(categoryId, isActive) {
        const category = await db.Category.findByPk(categoryId);

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        await category.update({ is_active: isActive });

        return await this.getCategoryById(categoryId);
    }

    /**
     * Lấy danh sách category theo dạng cây (tree structure)
     * @returns {Array} - Array of root categories with nested children
     */
    async getCategoryTree() {
        const categories = await db.Category.findAll({
            where: { deleted_at: null },
            attributes: ["id", "name", "slug", "is_active", "parent_id"],
            order: [["name", "ASC"]],
        });

        // Build tree structure
        const categoryMap = {};
        const tree = [];

        // Tạo map
        categories.forEach((cat) => {
            categoryMap[cat.id] = { ...cat.toJSON(), children: [] };
        });

        // Build tree
        categories.forEach((cat) => {
            if (cat.parent_id === null) {
                tree.push(categoryMap[cat.id]);
            } else if (categoryMap[cat.parent_id]) {
                categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
            }
        });

        return tree;
    }

    /**
     * Kiểm tra xem category A có là con của category B không
     * @param {Number} categoryId - ID của category cần kiểm tra
     * @param {Number} ancestorId - ID của category tổ tiên
     * @returns {Boolean}
     */
    async isDescendantOf(categoryId, ancestorId) {
        const category = await db.Category.findByPk(categoryId);
        if (!category || !category.parent_id) return false;

        if (category.parent_id == ancestorId) return true;

        return await this.isDescendantOf(category.parent_id, ancestorId);
    }

    /**
     * Lấy thống kê category
     * @returns {Object} - Statistics
     */
    async getCategoryStats() {
        const totalCategories = await db.Category.count();
        const activeCategories = await db.Category.count({ where: { is_active: true } });
        const rootCategories = await db.Category.count({ where: { parent_id: null } });

        // Sử dụng raw query để tránh lỗi với Sequelize complex query
        const [categoriesWithProducts] = await db.sequelize.query(`
            SELECT 
                c.id,
                c.name,
                c.slug,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
            GROUP BY c.id, c.name, c.slug
            ORDER BY product_count DESC
            LIMIT 10
        `);

        return {
            total: totalCategories,
            active: activeCategories,
            inactive: totalCategories - activeCategories,
            root: rootCategories,
            topCategories: categoriesWithProducts,
        };
    }
}

module.exports = new CategoryAdminService();