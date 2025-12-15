const wishlistService = require("../services/wishListService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class WishlistController {
    //1. Lay danh sach yeu thich cua User
    getMyWishlist = asyncHandler(async (req, res) => {
        const result = await wishlistService.getMyWishlist(req.user.id);
        return responseOk(res, result, "Wishlist fetched successfully");
    });
    // 2. Toggle (Thêm/Xóa) yêu thích
    toggleWishlist = asyncHandler(async (req, res) => {
        const { product_id } = req.body;
        const result = await wishlistService.toggleWishlist(req.user.id, product_id);
        return responseOk(res, result, result.message);
    });

}

module.exports = new WishlistController();