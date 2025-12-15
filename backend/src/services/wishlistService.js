const db = require("../models");
const { NouFoundError } = require("../utils/ApiError");

class WishlistService {
    //1. Lay danh sach yeu thich cua User
    // 1. Lấy danh sách yêu thích
    async getMyWishlist(userId) {
        const wishlist = await db.Wishlist.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: db.Product,
                    as: "product",
                    // CHỈ LẤY NHỮNG CỘT CẦN THIẾT CHO CARD
                    attributes: ["id", "name", "slug", "is_active"],
                    include: [
                        // 1. Lấy danh mục (Để hiển thị tag VD: "Áo Nam")
                        {
                            model: db.Category,
                            as: "category",
                            attributes: ["id", "name", "slug"]
                        },
                        // 2. Lấy ĐÚNG 1 ảnh đại diện
                        {
                            model: db.ProductImage,
                            as: "images",
                            where: { is_primary: true },
                            required: false, // Left join (đề phòng ko có ảnh bìa thì ko mất sp)
                            attributes: ["image_url"],
                        },
                        // 3. Lấy Variants (Chỉ để tính Giá Min-Max và check Tồn kho)
                        {
                            model: db.ProductVariant,
                            as: "variants",
                            where: { is_active: true, deleted_at: null },
                            required: false,
                            attributes: ["price", "stock"], // Frontend sẽ dùng cái này tính range giá
                        }
                    ],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        return wishlist;
    }
    // 2. Toggle (Thêm/Xóa) yêu thích
    // Logic: Nếu đã thích -> Xóa. Nếu chưa thích -> Thêm.
    async toggleWishlist(userId, productId) {
        const product = await db.Product.findByPk(productId);
        if (!product) {
            throw new NouFoundError('Product not found');
        }
        const existingItem = await db.Wishlist.findOne({
            where: { user_id: userId, product_id: productId },
        });
        if (existingItem) {
            await existingItem.destroy();
            return { message: 'Product removed from wishlist' };
        }
        else {
            await db.Wishlist.create({ user_id: userId, product_id: productId });
            return { message: 'Product added to wishlist' };
        }
    }
}

module.exports = new WishlistService();