const db = require("../models");

class LocationService {
    // Lấy danh sách Tỉnh
    async getProvinces() {
        return await db.Province.findAll({
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });
    }

    // Lấy danh sách Huyện theo Tỉnh
    async getDistricts(provinceId) {
        return await db.District.findAll({
            where: { province_id: provinceId },
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });
    }

    // Lấy danh sách Xã theo Huyện
    async getWards(districtId) {
        return await db.Ward.findAll({
            where: { district_id: districtId },
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });
    }
}

module.exports = new LocationService();