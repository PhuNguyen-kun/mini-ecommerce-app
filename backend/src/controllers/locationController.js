const locationService = require("../services/locationService"); // Import Service
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class LocationController {
    getProvinces = asyncHandler(async (req, res) => {
        const provinces = await locationService.getProvinces();
        return responseOk(res, provinces, "Get provinces successfully");
    });

    getDistricts = asyncHandler(async (req, res) => {
        const { province_id } = req.params;
        const districts = await locationService.getDistricts(province_id);
        return responseOk(res, districts, "Get districts successfully");
    });

    getWards = asyncHandler(async (req, res) => {
        const { district_id } = req.params;
        const wards = await locationService.getWards(district_id);
        return responseOk(res, wards, "Get wards successfully");
    });
}

module.exports = new LocationController();