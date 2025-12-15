const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Public API - Không cần đăng nhập
router.get("/provinces", locationController.getProvinces);
router.get("/districts/:province_id", locationController.getDistricts);
router.get("/wards/:district_id", locationController.getWards);

module.exports = router;