const db = require("../models");
const cloudinary = require("../config/cloudinary");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");

class UserService {
  async updateProfile(userId, updateData) {
    const user = await db.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Kiểm tra email nếu có thay đổi
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await db.User.findOne({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new BadRequestError("Email already exists");
      }
    }

    // Cho phép cập nhật các trường
    const allowedFields = ["full_name", "phone", "email"];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);
    return user.toJSON();
  }

  async uploadAvatar(userId, file) {
    if (!file) {
      throw new BadRequestError("No file uploaded");
    }

    const user = await db.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Xóa avatar cũ nếu có
    if (user.avatar_public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar_public_id);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }

    // Cập nhật avatar mới
    await user.update({
      avatar_url: file.path,
      avatar_public_id: file.filename,
    });

    return user.toJSON();
  }

  async deleteAvatar(userId) {
    const user = await db.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.avatar_public_id) {
      throw new BadRequestError("No avatar to delete");
    }

    // Xóa avatar trên Cloudinary
    try {
      await cloudinary.uploader.destroy(user.avatar_public_id);
    } catch (error) {
      console.error("Error deleting avatar from Cloudinary:", error);
    }

    // Cập nhật database
    await user.update({
      avatar_url: null,
      avatar_public_id: null,
    });

    return user.toJSON();
  }
}

module.exports = new UserService();
