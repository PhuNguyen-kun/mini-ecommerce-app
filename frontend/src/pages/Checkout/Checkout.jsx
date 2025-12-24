import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, message } from "antd";
import { useCart } from "../../context/CartContext";
import locationService from "../../services/locationService";
import orderService from "../../services/orderService";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, fetchCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    province_id: null,
    district_id: null,
    ward_id: null,
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Auto-fill user info from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.id) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading((prev) => ({ ...prev, provinces: true }));
        const response = await locationService.getProvinces();
        if (response.success && response.data) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.province_id) {
      const fetchDistricts = async () => {
        try {
          setLoading((prev) => ({ ...prev, districts: true }));
          setDistricts([]);
          setWards([]);
          setFormData((prev) => ({
            ...prev,
            district_id: null,
            ward_id: null,
          }));

          const response = await locationService.getDistricts(
            formData.province_id
          );
          if (response.success && response.data) {
            setDistricts(response.data);
          }
        } catch (error) {
          console.error("Error loading districts:", error);
        } finally {
          setLoading((prev) => ({ ...prev, districts: false }));
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.province_id]);

  useEffect(() => {
    if (formData.district_id) {
      const fetchWards = async () => {
        try {
          setLoading((prev) => ({ ...prev, wards: true }));
          setWards([]);
          setFormData((prev) => ({ ...prev, ward_id: null }));

          const response = await locationService.getWards(formData.district_id);
          if (response.success && response.data) {
            setWards(response.data);
          }
        } catch (error) {
          console.error("Error loading wards:", error);
        } finally {
          setLoading((prev) => ({ ...prev, wards: false }));
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [formData.district_id]);

  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.province_id)
      newErrors.province_id = "Vui lòng chọn tỉnh/thành phố";
    if (!formData.district_id)
      newErrors.district_id = "Vui lòng chọn quận/huyện";
    if (!formData.ward_id) newErrors.ward_id = "Vui lòng chọn phường/xã";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      message.warning("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);

    try {
      const checkoutData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        province_id: formData.province_id,
        district_id: formData.district_id,
        ward_id: formData.ward_id,
        note: formData.note || "",
        paymentMethod: paymentMethod,
        shipping_fee: 30000,
      };

      const response = await orderService.checkout(checkoutData);

      if (response.success) {
        if (paymentMethod === "vnpay" && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
          return;
        }

        message.success("Bạn đã đặt hàng thành công");
        setIsSuccess(true);

        if (paymentMethod === "cod" && fetchCart) {
          await fetchCart();
        }

        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      let errorMessage = "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.";

      if (error.data) {
        if (
          error.data.errors &&
          Array.isArray(error.data.errors) &&
          error.data.errors.length > 0
        ) {
          errorMessage = error.data.errors[0];
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const subtotal = getCartTotal();
  const shippingFee = 30000; // Fixed shipping fee
  const total = subtotal + shippingFee;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Đang xử lý...
            </h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
            <button
              onClick={() => navigate("/")}
              className="bg-black text-white px-6 py-3 hover:bg-gray-800"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                        placeholder="0912345678"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <Select
                        className="address-select"
                        placeholder="Chọn Tỉnh/Thành phố"
                        value={formData.province_id}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            province_id: value,
                            district_id: null,
                            ward_id: null,
                          }));
                          if (errors.province_id) {
                            setErrors((prev) => ({ ...prev, province_id: "" }));
                          }
                        }}
                        loading={loading.provinces}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={provinces.map((p) => ({
                          value: p.id,
                          label: p.name,
                        }))}
                        style={{ width: "100%" }}
                        status={errors.province_id ? "error" : ""}
                      />
                      {errors.province_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.province_id}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <Select
                        className="address-select"
                        placeholder="Chọn Quận/Huyện"
                        value={formData.district_id}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            district_id: value,
                            ward_id: null,
                          }));
                          if (errors.district_id) {
                            setErrors((prev) => ({ ...prev, district_id: "" }));
                          }
                        }}
                        loading={loading.districts}
                        disabled={!formData.province_id}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={districts.map((d) => ({
                          value: d.id,
                          label: d.name,
                        }))}
                        style={{ width: "100%" }}
                        status={errors.district_id ? "error" : ""}
                      />
                      {errors.district_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.district_id}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phường/Xã <span className="text-red-500">*</span>
                      </label>
                      <Select
                        className="address-select"
                        placeholder="Chọn Phường/Xã"
                        value={formData.ward_id}
                        onChange={(value) => {
                          setFormData((prev) => ({ ...prev, ward_id: value }));
                          if (errors.ward_id) {
                            setErrors((prev) => ({ ...prev, ward_id: "" }));
                          }
                        }}
                        loading={loading.wards}
                        disabled={!formData.district_id}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={wards.map((w) => ({
                          value: w.id,
                          label: w.name,
                        }))}
                        style={{ width: "100%" }}
                        status={errors.ward_id ? "error" : ""}
                      />
                      {errors.ward_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.ward_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ghi chú (Tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-gray-500">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">Thanh toán qua VNPay</div>
                      <div className="text-sm text-gray-500">
                        Thanh toán bằng thẻ ATM, Visa, Mastercard qua cổng VNPay
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-xl font-bold mb-4">
                Đơn hàng ({cart.length} sản phẩm)
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const itemImage =
                    item.images?.find((img) => img.is_primary)?.image_url ||
                    item.images?.[0]?.image_url ||
                    "/placeholder.png";
                  const itemPrice = item.selectedVariant?.price || item.price;

                  return (
                    <div key={item.cartId} className="flex gap-3">
                      <div className="relative">
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.selectedColor} / {item.selectedSize}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(itemPrice * item.quantity)}₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {formatPrice(shippingFee)}₫
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatPrice(total)}₫</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 mt-6 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : paymentMethod === "vnpay"
                  ? "Thanh toán qua VNPay"
                  : "Đặt hàng"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <a href="#" className="underline">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="underline">
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
