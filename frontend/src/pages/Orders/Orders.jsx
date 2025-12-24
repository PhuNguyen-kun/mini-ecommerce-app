import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  message,
  Input,
  DatePicker,
  Space,
  Select,
  Modal,
  Tooltip,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  FiPackage,
} from "react-icons/fi";
import orderService from "../../services/orderService";
import { getStatusConfig } from "../../constants/orderStatusConfig";

const { RangePicker } = DatePicker;

const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const OrderCard = ({ order, onCancel, onRefresh }) => {
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(order.status, order.payment_status);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const canCancel =
    order.status === "PENDING_PAYMENT" ||
    order.status === "CONFIRMED" ||
    order.status === "PAYMENT_FAILED";

  const canConfirmReceived = order.status === "SHIPPING";

  const getCancelTooltip = () => {
    if (canCancel) return "";
    
    if (order.payment_method === "COD") {
      return "Bạn chỉ có thể hủy khi đơn hàng chưa được giao";
    } else {
      return "Bạn chỉ có thể hủy khi chưa thanh toán";
    }
  };

  const handleCancelClick = () => {
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: "Bạn chắc chắn muốn hủy đặt hàng sản phẩm này chứ?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setIsCancelling(true);
          await onCancel(order.id);
          message.success("Đơn hàng đã được hủy");
          if (onRefresh) {
            onRefresh();
          }
        } catch (error) {
          console.error("Error cancelling order:", error);
          let errorMessage = "Không thể hủy đơn hàng. Vui lòng thử lại.";
          if (error.data?.message) {
            errorMessage = error.data.message;
          }
          message.error(errorMessage);
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  const handleConfirmReceived = () => {
    Modal.confirm({
      title: "Xác nhận đã nhận hàng",
      content:
        "Bạn có chắc chắn đã nhận được hàng? Hành động này không thể hoàn tác.",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsConfirming(true);
          const response = await orderService.confirmOrderReceived(order.id);
          if (response.success) {
            message.success("Xác nhận đã nhận hàng thành công!");
            if (onRefresh) {
              onRefresh();
            }
          }
        } catch (error) {
          console.error("Error confirming order received:", error);
          message.error(error.message || "Không thể xác nhận đã nhận hàng");
        } finally {
          setIsConfirming(false);
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FiPackage className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {order.order_code}
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Đặt hàng lúc: {formatDate(order.created_at)}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${statusConfig.color}`}
          >
            <statusConfig.IconComponent className="w-4 h-4" />
            <span className="text-sm font-medium">{statusConfig.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
            <p className="text-sm font-medium text-gray-900">
              {order.payment_method === "COD"
                ? "Thanh toán khi nhận hàng"
                : "VNPay"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Số lượng sản phẩm</p>
            <p className="text-sm font-medium text-gray-900">
              {order.items?.length || 0} sản phẩm
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
            <p className="text-lg font-bold text-red-600">
              {formatPrice(order.total_amount)}₫
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Địa chỉ giao hàng
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_full_name} - {order.shipping_phone}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_address_line}, {order.shipping_ward},{" "}
              {order.shipping_district}, {order.shipping_province}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Chi tiết sản phẩm
            </h4>
            <div className="space-y-3">
              {order.items?.map((item) => {
                const productImage =
                  item.variant?.product?.images?.[0]?.image_url ||
                  "/placeholder.png";

                // Extract size and color from variant option_values
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

                const productSlug = item.variant?.product?.slug;
                const canReview = order.status === "COMPLETED";

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() =>
                        productSlug && navigate(`/product/${productSlug}`)
                      }
                      className="flex-shrink-0"
                    >
                      <img
                        src={productImage}
                        alt={item.product_name_snapshot}
                        className="w-16 h-16 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          productSlug && navigate(`/product/${productSlug}`)
                        }
                        className="text-left w-full"
                      >
                        <h5 className="text-sm font-medium text-gray-900 mb-1 hover:text-black transition-colors">
                          {item.product_name_snapshot}
                        </h5>
                      </button>
                      {variantText && (
                        <p className="text-xs text-gray-500 mb-1">
                          {variantText}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.subtotal)}₫
                          </span>
                          {canReview && (
                            <button
                              onClick={() =>
                                productSlug &&
                                navigate(`/product/${productSlug}?review=true`)
                              }
                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                            >
                              Đánh giá
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
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
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span className="text-gray-900">Tổng cộng:</span>
                <span className="text-red-600">
                  {formatPrice(order.total_amount)}₫
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end gap-3">
            <Tooltip title={getCancelTooltip()}>
              <button
                onClick={handleCancelClick}
                disabled={!canCancel || isCancelling}
                className="bg-white text-gray-700 border border-gray-300 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? "Đang xử lý..." : "Hủy"}
              </button>
            </Tooltip>
            {canConfirmReceived && (
              <button
                onClick={handleConfirmReceived}
                disabled={isConfirming}
                className="bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isConfirming ? "Đang xử lý..." : "Đã nhận được hàng"}
              </button>
            )}
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Chi tiết đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async (page = 1, limit = 10, isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const startDate = dateRange?.[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : null;
      const endDate = dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : null;
      const response = await orderService.getOrders(
        page,
        limit,
        searchText || null,
        startDate,
        endDate,
        statusFilter || null
      );
      if (response.success) {
        setOrders(response.data || []);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders(1, pagination.limit, true);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      const timeoutId = setTimeout(
        () => {
          fetchOrders(1, pagination.limit, false);
        },
        searchText ? 500 : 0
      );

      return () => clearTimeout(timeoutId);
    }
  }, [searchText, dateRange, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (isInitialLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style>
        {`
          .ant-picker-cell-in-range .ant-picker-cell-inner {
            color: white !important;
          }
          .ant-picker-cell-in-range:not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) .ant-picker-cell-inner {
            color: white !important;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lịch sử đặt hàng
          </h1>
          <p className="text-gray-600 mb-6">
            Xem và theo dõi các đơn hàng của bạn
          </p>

          <Space orientation="vertical" size="middle" className="w-full">
            <Space size="middle" className="w-full">
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearchChange}
                allowClear
                style={{ width: 400 }}
              />
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                value={dateRange}
                onChange={handleDateRangeChange}
                allowClear
              />
              <Select
                placeholder="Lọc theo trạng thái"
                value={statusFilter || undefined}
                onChange={(value) => {
                  setStatusFilter(value || "");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                allowClear
                style={{ width: 200 }}
              >
                {[
                  "PENDING_PAYMENT",
                  "CONFIRMED",
                  "PAID",
                  "SHIPPING",
                  "COMPLETED",
                  "CANCELLED",
                  "PAYMENT_FAILED",
                ].map((status) => {
                  const config = getStatusConfig(status);
                  const IconComponent = config.IconComponent;
                  return (
                    <Select.Option key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{config.label}</span>
                      </div>
                    </Select.Option>
                  );
                })}
              </Select>
            </Space>
          </Space>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <a
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-6 relative">
              {isRefreshing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
                  </div>
                </div>
              )}
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={orderService.cancelOrder.bind(orderService)}
                  onRefresh={() =>
                    fetchOrders(pagination.page, pagination.limit, false)
                  }
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() =>
                    fetchOrders(pagination.page - 1, pagination.limit, false)
                  }
                  disabled={pagination.page === 1 || isRefreshing}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    fetchOrders(pagination.page + 1, pagination.limit, false)
                  }
                  disabled={
                    pagination.page >= pagination.totalPages || isRefreshing
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
