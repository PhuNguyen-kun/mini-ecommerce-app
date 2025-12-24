const express = require("express");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIPN);

module.exports = router;
