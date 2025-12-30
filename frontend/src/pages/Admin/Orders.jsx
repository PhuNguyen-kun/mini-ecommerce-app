import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  message,
  Input,
  DatePicker,
  Space,
  Select,
  Modal,
  Dropdown,
} from "antd";
import { SearchOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from "react-icons/fi";
import adminService from "../../services/adminService";
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

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchText, dateRange, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        allResponse,
        pendingResponse,
        shippingResponse,
        completedResponse,
      ] = await Promise.all([
        adminService.getAllOrders(1, 1),
        adminService.getAllOrders(1, 1, null, null, null, "PENDING_PAYMENT"),
        adminService.getAllOrders(1, 1, null, null, null, "SHIPPING"),
        adminService.getAllOrders(1, 1, null, null, null, "COMPLETED"),
      ]);

      const confirmedResponse = await adminService.getAllOrders(
        1,
        1,
        null,
        null,
        null,
        "CONFIRMED"
      );
      const paidResponse = await adminService.getAllOrders(
        1,
        1,
        null,
        null,
        null,
        "PAID"
      );

      const statsData = {
        total: allResponse.pagination?.total || 0,
        pending:
          (pendingResponse.pagination?.total || 0) +
          (confirmedResponse.pagination?.total || 0) +
          (paidResponse.pagination?.total || 0),
        shipping: shippingResponse.pagination?.total || 0,
        completed: completedResponse.pagination?.total || 0,
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const startDate = dateRange?.[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : null;
      const endDate = dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : null;

      const response = await adminService.getAllOrders(
        currentPage,
        20,
        searchText || null,
        startDate,
        endDate,
        statusFilter || null
      );

      if (response.success) {
        setOrders(response.data || []);
        setTotalOrders(response.pagination?.total || 0);
        setTotalPages(response.pagination?.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value || "");
    setCurrentPage(1);
  };

  const handleViewDetail = async (orderId) => {
    try {
      const response = await adminService.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      message.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        message.success("Cập nhật trạng thái đơn hàng thành công");
        await fetchOrders();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMessage =
        error.message || "Không thể cập nhật trạng thái đơn hàng";
      message.error(errorMessage);
    }
  };

  const getStatusOptions = (currentStatus, paymentMethod) => {
    const statusFlow = {
      PENDING_PAYMENT: ["CONFIRMED", "PAID", "CANCELLED", "PAYMENT_FAILED"],
      CONFIRMED: ["PAID", "SHIPPING", "CANCELLED"],
      PAID: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["COMPLETED"],
      PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
    };

    let allowedStatuses = statusFlow[currentStatus] || [];

    if (paymentMethod === "COD") {
      allowedStatuses = allowedStatuses.filter((status) => status !== "PAID");
    }

    return allowedStatuses;
  };

  const getStatusMenuItems = (order) => {
    const allowedStatuses = getStatusOptions(
      order.status,
      order.payment_method
    );
    if (allowedStatuses.length === 0) return [];

    return allowedStatuses.map((status) => {
      const config = getStatusConfig(status);
      return {
        key: status,
        label: config.label,
        onClick: () => {
          Modal.confirm({
            title: "Xác nhận cập nhật trạng thái",
            content: `Bạn có chắc muốn chuyển đơn hàng ${order.order_code} sang trạng thái "${config.label}"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => handleUpdateStatus(order.id, status),
          });
        },
      };
    });
  };

  return (
    <div className="p-6">
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <p className="text-gray-600 mt-1">
          Xem và quản lý tất cả đơn hàng của khách hàng
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Đang chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Đang giao hàng</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shipping}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Hoàn thành</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <Space size="middle" className="w-full" wrap>
          <Input
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            allowClear
            style={{ width: 300 }}
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
            onChange={handleStatusFilterChange}
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
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(
                    order.status,
                    order.payment_status
                  );
                  const statusMenuItems = getStatusMenuItems(order);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FiPackage className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {order.order_code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {order.user?.full_name || order.shipping_full_name}
                          </p>
                          <p className="text-gray-500">
                            {order.user?.phone || order.shipping_phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items?.length || 0} sản phẩm
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          {formatPrice(order.total_amount)}₫
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.payment_method === "COD"
                            ? "COD"
                            : order.payment_method === "VNPAY_FAKE"
                            ? "VNPay"
                            : order.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${statusConfig.color}`}
                        >
                          <statusConfig.IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-1 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <EyeOutlined />
                          <span>Chi tiết</span>
                        </button>
                        <Dropdown
                          menu={{ items: statusMenuItems }}
                          trigger={["click"]}
                          disabled={statusMenuItems.length === 0}
                        >
                          <button
                            disabled={statusMenuItems.length === 0}
                            className="text-purple-600 hover:text-purple-900 flex items-center gap-1 px-3 py-1 rounded hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-purple-600"
                          >
                            <EditOutlined />
                            <span>Cập nhật trạng thái</span>
                          </button>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {(currentPage - 1) * 20 + 1} -{" "}
              {Math.min(currentPage * 20, totalOrders)} trong tổng số{" "}
              {totalOrders} đơn hàng
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage >= totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FiPackage className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold">
              Chi tiết đơn hàng {selectedOrder?.order_code}
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        centered
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Khách hàng
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedOrder.user?.full_name ||
                    selectedOrder.shipping_full_name}
                </p>
                {selectedOrder.user?.email && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedOrder.user.email}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.user?.phone || selectedOrder.shipping_phone}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Trạng thái & Thanh toán
                </p>
                <div className="mb-2">
                  <div
                    className={`px-3 py-1.5 rounded-full border flex items-center gap-2 inline-flex ${
                      getStatusConfig(
                        selectedOrder.status,
                        selectedOrder.payment_status
                      ).color
                    }`}
                  >
                    {(() => {
                      const statusConfig = getStatusConfig(
                        selectedOrder.status,
                        selectedOrder.payment_status
                      );
                      const IconComponent = statusConfig.IconComponent;
                      return (
                        <>
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {statusConfig.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Phương thức:{" "}
                  <span className="font-medium">
                    {selectedOrder.payment_method === "COD"
                      ? "COD"
                      : selectedOrder.payment_method === "VNPAY_FAKE"
                      ? "VNPay"
                      : selectedOrder.payment_method}
                  </span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Địa chỉ giao hàng
              </p>
              <p className="text-sm font-medium text-gray-900">
                {selectedOrder.shipping_full_name} -{" "}
                {selectedOrder.shipping_phone}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedOrder.shipping_address_line},{" "}
                {selectedOrder.shipping_ward}, {selectedOrder.shipping_district}
                , {selectedOrder.shipping_province}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Sản phẩm ({selectedOrder.items?.length || 0})
              </p>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => {
                  let size = null;
                  let color = null;
                  let colorOptionValueId = null;

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
                        colorOptionValueId = optVal.id;
                      }
                    });
                  }

                  let productImage = "/placeholder.png";

                  if (colorOptionValueId && item.variant?.product?.images) {
                    const colorImage = item.variant.product.images.find(
                      (img) =>
                        img.product_option_value_id === colorOptionValueId
                    );
                    productImage = colorImage?.image_url;
                  }

                  if (!productImage || productImage === "/placeholder.png") {
                    productImage =
                      item.variant?.product?.images?.[0]?.image_url ||
                      "/placeholder.png";
                  }

                  const variantInfo = [];
                  if (color) variantInfo.push(color);
                  if (size) variantInfo.push(size);
                  const variantText =
                    variantInfo.length > 0 ? variantInfo.join(" / ") : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <img
                        src={productImage}
                        alt={item.product_name_snapshot}
                        className="w-20 h-20 object-cover rounded border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {item.product_name_snapshot}
                        </p>
                        {variantText && (
                          <p className="text-xs text-gray-500 mb-2">
                            {variantText}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>SKU: {item.product_sku_snapshot}</span>
                          <span>Số lượng: {item.quantity}</span>
                          <span>Đơn giá: {formatPrice(item.unit_price)}₫</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.subtotal)}₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(selectedOrder.items_total)}₫
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(selectedOrder.shipping_fee)}₫
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t">
                <span className="text-gray-900">Tổng cộng:</span>
                <span className="text-red-600 text-lg">
                  {formatPrice(selectedOrder.total_amount)}₫
                </span>
              </div>
            </div>

            <div className="pt-4 border-t flex items-center gap-6 text-xs text-gray-500">
              <div>
                <span className="font-medium">Ngày đặt:</span>{" "}
                {formatDate(selectedOrder.created_at)}
              </div>
              {selectedOrder.paid_at && (
                <div>
                  <span className="font-medium">Ngày thanh toán:</span>{" "}
                  {formatDate(selectedOrder.paid_at)}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
