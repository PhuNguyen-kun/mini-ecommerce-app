const vnpayService = require("../services/vnpayService");
const orderService = require("../services/orderService");
const db = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { responseOk } = require("../utils/apiResponse");
const { BadRequestError } = require("../utils/ApiError");

class PaymentController {
  vnpayReturn = asyncHandler(async (req, res) => {
    let vnpParams = req.query;

    const isValid = vnpayService.verifyReturnUrl(vnpParams);

    if (!isValid) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/result?success=false&message=Invalid signature`
      );
    }

    const orderCode = vnpParams.vnp_TxnRef;
    const rspCode = vnpParams.vnp_ResponseCode;
    const transactionNo = vnpParams.vnp_TransactionNo;
    const amount = parseInt(vnpParams.vnp_Amount) / 100;
    const bankCode = vnpParams.vnp_BankCode;

    const order = await db.Order.findOne({
      where: { order_code: orderCode },
    });

    if (!order) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/result?success=false&message=Order not found`
      );
    }

    const transaction = await db.sequelize.transaction();

    try {
      await db.PaymentTransaction.create(
        {
          order_id: order.id,
          provider: "VNPAY_FAKE",
          amount: amount,
          status: rspCode === "00" ? "SUCCESS" : "FAILED",
          transaction_code: transactionNo,
          message: this.getVNPayMessage(rspCode),
          raw_request: JSON.stringify({ orderCode, amount, bankCode }),
          raw_response: JSON.stringify(vnpParams),
        },
        { transaction }
      );

      if (rspCode === "00") {
        await order.update(
          {
            status: "PAID",
            payment_status: "SUCCESS",
            paid_at: new Date(),
          },
          { transaction }
        );

        const cart = await db.Cart.findOne({
          where: { user_id: order.user_id },
          transaction,
        });

        if (cart) {
          await db.CartItem.destroy({
            where: { cart_id: cart.id },
            transaction,
          });
        }
      } else {
        await order.update(
          {
            status: "PAYMENT_FAILED",
            payment_status: "FAILED",
          },
          { transaction }
        );
      }

      await transaction.commit();

      if (rspCode === "00") {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/result?success=true&orderCode=${orderCode}`
        );
      } else {
        return res.redirect(
          `${
            process.env.FRONTEND_URL
          }/payment/result?success=false&message=${encodeURIComponent(
            this.getVNPayMessage(rspCode)
          )}`
        );
      }
    } catch (error) {
      await transaction.rollback();
      console.error("VNPay return error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/result?success=false&message=System error`
      );
    }
  });

  vnpayIPN = asyncHandler(async (req, res) => {
    let vnpParams = req.query;
    const isValid = vnpayService.verifyIpnUrl(vnpParams);

    if (!isValid) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid signature" });
    }

    const orderCode = vnpParams.vnp_TxnRef;
    const rspCode = vnpParams.vnp_ResponseCode;

    const order = await db.Order.findOne({
      where: { order_code: orderCode },
    });

    if (!order) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    if (order.payment_status === "SUCCESS") {
      return res
        .status(200)
        .json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (rspCode === "00") {
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    }
  });

  getVNPayMessage(code) {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
      99: "Các lỗi khác",
    };
    return messages[code] || "Lỗi không xác định";
  }
}

module.exports = new PaymentController();
