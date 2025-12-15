const addressService = require("../services/addressService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class AddressController {
    getAll = asyncHandler(async (req, res) => {
        const result = await addressService.getAll(req.user.id);
        return responseOk(res, result, "Lấy danh sách địa chỉ thành công");
    });

    create = asyncHandler(async (req, res) => {
        const result = await addressService.create(req.user.id, req.body);
        return responseOk(res, result, "Thêm địa chỉ thành công", 201);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await addressService.update(req.user.id, id, req.body);
        return responseOk(res, result, "Cập nhật địa chỉ thành công");
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await addressService.delete(req.user.id, id);
        return responseOk(res, null, "Xóa địa chỉ thành công");
    });

    setDefault = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await addressService.setDefault(req.user.id, id);
        return responseOk(res, result, "Đặt làm địa chỉ mặc định thành công");
    });
}

module.exports = new AddressController();