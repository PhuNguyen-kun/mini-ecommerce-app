const crypto = require("crypto");
const querystring = require("querystring");
const { BadRequestError } = require("../utils/ApiError");

class VNPayService {
  constructor() {
    this.vnpUrl =
      process.env.VNPAY_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    this.tmnCode = process.env.VNPAY_TMN_CODE;
    this.hashSecret = process.env.VNPAY_HASH_SECRET;
    this.returnUrl = process.env.VNPAY_RETURN_URL;
  }

  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  createPaymentUrl(orderId, amount, orderCode, ipAddr) {
    if (!this.tmnCode || !this.hashSecret) {
      throw new BadRequestError("VNPAY configuration is missing");
    }

    const createDate = this.formatDate(new Date());
    const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000));

    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderCode,
      vnp_OrderInfo: "Thanh toan don hang " + orderCode,
      vnp_OrderType: "other",
      vnp_Amount: Math.round(amount * 100),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    vnpParams = this.sortObject(vnpParams);

    const signData = Object.keys(vnpParams)
      .map((key) => {
        const value = encodeURIComponent(String(vnpParams[key])).replace(
          /%20/g,
          "+"
        );
        return `${key}=${value}`;
      })
      .join("&");

    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnpParams.vnp_SecureHash = signed;

    const paymentUrl = this.vnpUrl + "?" + querystring.stringify(vnpParams);

    return paymentUrl;
  }

  verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = this.sortObject(vnpParams);
    const signData = Object.keys(sortedParams)
      .map((key) => {
        const value = encodeURIComponent(String(sortedParams[key])).replace(
          /%20/g,
          "+"
        );
        return `${key}=${value}`;
      })
      .join("&");

    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return secureHash === signed;
  }

  verifyIpnUrl(vnpParams) {
    return this.verifyReturnUrl(vnpParams);
  }

  formatDate(date) {
    const pad = (num) => (num < 10 ? "0" + num : num);
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }
}

module.exports = new VNPayService();
