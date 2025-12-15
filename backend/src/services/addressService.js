const db = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/ApiError");

class AddressService {
    // 1. Lấy danh sách (Kèm tên Tỉnh/Huyện/Xã để hiển thị đẹp)
    async getAll(userId) {
        return await db.UserAddress.findAll({
            where: { user_id: userId },
            include: [
                { model: db.Province, as: "province", attributes: ["id", "name"] },
                { model: db.District, as: "district", attributes: ["id", "name"] },
                { model: db.Ward, as: "ward", attributes: ["id", "name"] },
            ],
            order: [
                ["is_default", "DESC"], // Cái nào mặc định đưa lên đầu
                ["created_at", "DESC"],
            ],
        });
    }

    // 2. Chi tiết 1 địa chỉ
    async getOne(userId, addressId) {
        const address = await db.UserAddress.findOne({
            where: { id: addressId, user_id: userId },
        });
        if (!address) throw new NotFoundError("Địa chỉ không tồn tại");
        return address;
    }

    // 3. Tạo mới
    async create(userId, data) {
        return db.sequelize.transaction(async (t) => {
            // B1: Validate ID Tỉnh/Huyện/Xã có thật trong DB không
            const countP = await db.Province.count({ where: { id: data.province_id } });
            const countD = await db.District.count({ where: { id: data.district_id } });
            const countW = await db.Ward.count({ where: { id: data.ward_id } });

            if (!countP || !countD || !countW) {
                throw new BadRequestError("Địa điểm không hợp lệ (ID Tỉnh/Huyện/Xã sai)");
            }

            // B2: Logic Mặc định
            // Nếu user chưa có địa chỉ nào -> Cái đầu tiên auto là Default
            const existingCount = await db.UserAddress.count({
                where: { user_id: userId },
                transaction: t,
            });
            if (existingCount === 0) data.is_default = true;

            // Nếu user tick chọn Default -> Reset các cái cũ về false
            if (data.is_default) {
                await db.UserAddress.update(
                    { is_default: false },
                    { where: { user_id: userId }, transaction: t }
                );
            }

            // B3: Tạo
            const newAddress = await db.UserAddress.create(
                { ...data, user_id: userId },
                { transaction: t }
            );

            // Reload để lấy kèm thông tin Tỉnh/Huyện (để trả về FE hiển thị luôn)
            return newAddress.reload({
                include: ["province", "district", "ward"],
                transaction: t
            });
        });
    }

    // 4. Cập nhật
    async update(userId, addressId, data) {
        return db.sequelize.transaction(async (t) => {
            const address = await db.UserAddress.findOne({
                where: { id: addressId, user_id: userId },
                transaction: t,
            });

            if (!address) throw new NotFoundError("Địa chỉ không tồn tại");

            // Nếu update set default -> Reset các cái khác
            if (data.is_default && !address.is_default) {
                await db.UserAddress.update(
                    { is_default: false },
                    { where: { user_id: userId }, transaction: t }
                );
            }

            await address.update(data, { transaction: t });

            // Reload để trả về data đầy đủ relation
            return address.reload({
                include: ["province", "district", "ward"],
                transaction: t
            });
        });
    }
    // 5. Xóa (Phiên bản An Toàn - Production Level)
    async delete(userId, addressId) {
        return db.sequelize.transaction(async (t) => {
            // B1: Tìm địa chỉ cần xóa
            const addressToDelete = await db.UserAddress.findOne({
                where: { id: addressId, user_id: userId },
                transaction: t
            });

            if (!addressToDelete) throw new NotFoundError("Địa chỉ không tồn tại");

            // B2: Kiểm tra logic "Người thừa kế" (Inheritance Logic)
            // Chỉ cần xử lý nếu địa chỉ đang xóa là Mặc Định (is_default = true)
            if (addressToDelete.is_default) {
                // Tìm một địa chỉ khác để trao quyền (lấy cái mới nhất, trừ cái đang xóa ra)
                const candidate = await db.UserAddress.findOne({
                    where: {
                        user_id: userId,
                        id: { [db.Sequelize.Op.ne]: addressId } // ID khác ID đang xóa
                    },
                    order: [['created_at', 'DESC']], // Lấy cái mới nhất còn lại
                    transaction: t
                });

                // Nếu tìm thấy người thừa kế -> Set nó làm Default mới
                if (candidate) {
                    await candidate.update({ is_default: true }, { transaction: t });
                }

                // Lưu ý: Nếu không tìm thấy candidate (candidate == null), nghĩa là user
                // chỉ có đúng 1 địa chỉ này thôi -> Xóa xong là hết sạch địa chỉ (OK).
            }

            // B3: Thực hiện Xóa Mềm chuẩn chỉnh
            // Phải update is_default = false TRƯỚC hoặc CÙNG LÚC khi destroy
            await addressToDelete.update({ is_default: false }, { transaction: t });

            // Sau đó mới gọi destroy (sẽ cập nhật deleted_at)
            await addressToDelete.destroy({ transaction: t });

            return true;
        });
    }

    // 6. API Set Default nhanh
    async setDefault(userId, addressId) {
        return db.sequelize.transaction(async (t) => {
            const address = await db.UserAddress.findOne({
                where: { id: addressId, user_id: userId },
                transaction: t,
            });

            if (!address) throw new NotFoundError("Địa chỉ không tồn tại");

            // Reset all -> false
            await db.UserAddress.update(
                { is_default: false },
                { where: { user_id: userId }, transaction: t }
            );

            // Set current -> true
            await address.update({ is_default: true }, { transaction: t });
            return address;
        });
    }
}

module.exports = new AddressService();