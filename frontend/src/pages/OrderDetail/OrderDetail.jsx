import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiCheckCircle,
  FiStar,
  FiArrowLeft,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import orderService from "../../services/orderService";

const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getTimelineSteps = (order) => {
  const steps = [
    {
      id: "placed",
      label: "Đơn hàng đã đặt",
      icon: <FiPackage className="w-5 h-5" />,
      date: order.created_at,
      completed: true,
    },
    {
      id: "paid",
      label: "Đơn hàng đã thanh toán",
      icon: <FiDollarSign className="w-5 h-5" />,
      date:
        order.paid_at ||
        (order.status !== "PENDING_PAYMENT" &&
        order.payment_status === "SUCCESS"
          ? order.created_at
          : null),
      amount: order.total_amount,
      completed:
        order.status !== "PENDING_PAYMENT" &&
        order.status !== "PAYMENT_FAILED" &&
        order.status !== "CANCELLED",
    },
    {
      id: "shipping",
      label: "Đã giao cho đơn vị vận chuyển",
      icon: <FiTruck className="w-5 h-5" />,
      date:
        order.status === "SHIPPING" || order.status === "COMPLETED"
          ? order.updated_at
          : null,
      completed: order.status === "SHIPPING" || order.status === "COMPLETED",
    },
    {
      id: "received",
      label: "Đã nhận được hàng",
      icon: <FiCheckCircle className="w-5 h-5" />,
      date: order.status === "COMPLETED" ? order.updated_at : null,
      completed: order.status === "COMPLETED",
    },
  ];

  return steps;
};

const getStatusLabel = (status, paymentStatus) => {
  const statusMap = {
    PENDING_PAYMENT: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Đơn hàng đã hoàn thành",
    CANCELLED: "Đã hủy",
    PAYMENT_FAILED: "Thanh toán thất bại",
  };

  if (status === "COMPLETED") {
    return "Đơn hàng đã hoàn thành";
  }

  return statusMap[status] || status;
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await orderService.getOrderById(id);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        message.error("Không thể tải thông tin đơn hàng");
        navigate("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const timelineSteps = getTimelineSteps(order);
  const isCancelled =
    order.status === "CANCELLED" || order.status === "PAYMENT_FAILED";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Trở lại</span>
            </button>
            <div
              className={`px-4 py-2 rounded-full font-semibold ${
                isCancelled
                  ? "bg-red-100 text-red-800"
                  : order.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {getStatusLabel(order.status, order.payment_status)}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <p className="text-lg font-bold text-gray-900">
                {order.order_code}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
              <p className="text-xl font-bold text-red-600">
                {formatPrice(order.total_amount)}₫
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Trạng thái đơn hàng
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
              <div
                className={`absolute top-0 left-0 w-full transition-all duration-500 ${
                  isCancelled ? "bg-red-300" : "bg-green-500"
                }`}
                style={{
                  height: `${
                    isCancelled
                      ? "0%"
                      : (timelineSteps.filter((s) => s.completed).length /
                          timelineSteps.length) *
                        100
                  }%`,
                }}
              />
            </div>

            {/* Timeline steps */}
            <div className="relative space-y-8">
              {timelineSteps.map((step, index) => {
                const isLast = index === timelineSteps.length - 1;
                return (
                  <div
                    key={step.id}
                    className="relative flex items-start gap-4"
                  >
                    {/* Step icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        step.completed && !isCancelled
                          ? "bg-green-500 border-green-500 text-white shadow-lg"
                          : isCancelled
                          ? "bg-gray-200 border-gray-300 text-gray-400"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <div
                        className={
                          step.completed && !isCancelled ? "text-white" : ""
                        }
                      >
                        {step.icon}
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold ${
                            step.completed && !isCancelled
                              ? "text-green-600"
                              : isCancelled
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {step.label}
                        </h3>
                        {step.date && (
                          <span className="text-sm text-gray-500">
                            {formatDate(step.date)}
                          </span>
                        )}
                      </div>
                      {step.amount && step.completed && (
                        <p className="text-sm text-gray-600 font-medium">
                          {formatPrice(step.amount)}₫
                        </p>
                      )}
                      {!step.date && !step.completed && (
                        <p className="text-sm text-gray-400">Chưa hoàn thành</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Sản phẩm</h2>
          <div className="space-y-4">
            {order.items?.map((item) => {
              const productImage =
                item.variant?.product?.images?.[0]?.image_url ||
                "/placeholder.png";

              let size = null;
              let color = null;

              if (item.variant?.option_values) {
                item.variant.option_values.forEach((optVal) => {
                  const optionName = optVal.option?.name?.toLowerCase();
                  if (optionName === "kích cỡ" || optionName === "size") {
                    size = optVal.value;
                  } else if (
                    optionName === "màu sắc" ||
                    optionName === "color" ||
                    optionName === "màu"
                  ) {
                    color = optVal.value;
                  }
                });
              }

              const variantInfo = [];
              if (color) variantInfo.push(color);
              if (size) variantInfo.push(size);
              const variantText =
                variantInfo.length > 0 ? variantInfo.join(" / ") : null;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <img
                    src={productImage}
                    alt={item.product_name_snapshot}
                    className="w-20 h-20 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.product_name_snapshot}
                    </h4>
                    {variantText && (
                      <p className="text-sm text-gray-500 mb-2">
                        {variantText}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.subtotal)}₫
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium text-gray-900">
                {formatPrice(order.items_total)}₫
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-medium text-gray-900">
                {formatPrice(order.shipping_fee)}₫
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
              <span className="text-gray-900">Tổng cộng:</span>
              <span className="text-red-600">
                {formatPrice(order.total_amount)}₫
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Địa chỉ giao hàng
          </h2>
          <div className="space-y-1 text-gray-700">
            <p className="font-medium">{order.shipping_full_name}</p>
            <p>{order.shipping_phone}</p>
            <p>
              {order.shipping_address_line}, {order.shipping_ward},{" "}
              {order.shipping_district}, {order.shipping_province}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
