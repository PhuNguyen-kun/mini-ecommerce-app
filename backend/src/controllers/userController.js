const userService = require("../services/userService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class UserController {
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    return responseOk(res, user, "Profile updated successfully");
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    const user = await userService.uploadAvatar(req.user.id, req.file);
    return responseOk(res, user, "Avatar uploaded successfully");
  });

  deleteAvatar = asyncHandler(async (req, res) => {
    const user = await userService.deleteAvatar(req.user.id);
    return responseOk(res, user, "Avatar deleted successfully");
  });
}

module.exports = new UserController();
