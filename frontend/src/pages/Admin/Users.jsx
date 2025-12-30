import { useState, useEffect, useMemo } from "react";
import {
  message,
  Input,
  DatePicker,
  Space,
  Select,
  Modal,
  Switch,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import adminService from "../../services/adminService";

const { RangePicker } = DatePicker;

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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  });

  const currentUserId = useMemo(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      console.error("Error parsing current user:", e);
    }
    return null;
  }, []);

  const dateRangeString = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return null;
    return `${dateRange[0].format("YYYY-MM-DD")}_${dateRange[1].format("YYYY-MM-DD")}`;
  }, [dateRange]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchText, dateRangeString, roleFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const startDate = dateRange?.[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : null;
      const endDate = dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : null;

      const isActive =
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
          ? false
          : null;

      const response = await adminService.getAllUsers(
        currentPage,
        20,
        searchText || null,
        roleFilter || null,
        isActive,
        startDate,
        endDate
      );

      if (response.success) {
        setUsers(response.data || []);
        setTotalUsers(response.pagination?.total || 0);
        setTotalPages(response.pagination?.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Không thể tải danh sách người dùng");
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

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value || "");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value || "");
    setCurrentPage(1);
  };

  const handleViewDetail = async (userId) => {
    try {
      const response = await adminService.getUserById(userId);
      if (response.success) {
        setSelectedUser(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching user detail:", error);
      message.error("Không thể tải chi tiết người dùng");
    }
  };

  const handleToggleActive = async (user, newStatus) => {
    try {
      const response = await adminService.updateUser(user.id, {
        is_active: newStatus,
      });

      if (response.success) {
        message.success(
          `Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} tài khoản thành công`
        );
        await fetchUsers();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      message.error("Không thể cập nhật trạng thái tài khoản");
    }
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
          .ant-switch-checked {
            background-color: #52c41a !important;
          }
        `}
      </style>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h1>
        <p className="text-gray-600 mt-1">
          Xem và quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Tổng người dùng</p>
            <FiUsers className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Đang hoạt động</p>
            <FiUserCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Đã vô hiệu hóa</p>
            <FiUserX className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Mới tháng này</p>
            <FiUserPlus className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.newThisMonth}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <Space size="middle" className="w-full" wrap>
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT..."
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
            placeholder="Lọc theo vai trò"
            value={roleFilter || undefined}
            onChange={handleRoleFilterChange}
            allowClear
            style={{ width: 150 }}
          >
            <Select.Option value="customer">Khách hàng</Select.Option>
            <Select.Option value="admin">Quản trị viên</Select.Option>
          </Select>
          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter || undefined}
            onChange={handleStatusFilterChange}
            allowClear
            style={{ width: 150 }}
          >
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="inactive">Đã vô hiệu hóa</Select.Option>
          </Select>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Chưa có người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.full_name || "User") + "&background=random"}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.full_name || "User") + "&background=random";
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-flex ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <FiUserCheck className="w-3 h-3" />
                            Đang hoạt động
                          </>
                        ) : (
                          <>
                            <FiUserX className="w-3 h-3" />
                            Đã vô hiệu hóa
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Space>
                        <button
                          onClick={() => handleViewDetail(user.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <EyeOutlined />
                          <span>Chi tiết</span>
                        </button>
                        <Switch
                          checked={user.is_active}
                          onChange={(checked) => handleToggleActive(user, checked)}
                          checkedChildren="ON"
                          unCheckedChildren="OFF"
                          className={user.is_active ? "ant-switch-checked" : ""}
                          disabled={currentUserId === user.id}
                          title={
                            currentUserId === user.id
                              ? "Bạn không thể vô hiệu hóa tài khoản của chính mình"
                              : undefined
                          }
                        />
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {(currentPage - 1) * 20 + 1} -{" "}
              {Math.min(currentPage * 20, totalUsers)} trong tổng số{" "}
              {totalUsers} người dùng
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
            <FiUsers className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold">
              Chi tiết người dùng
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedUser.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedUser.full_name || "User") + "&background=random"}
                alt={selectedUser.full_name}
                className="w-20 h-20 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedUser.full_name || "User") + "&background=random";
                }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.full_name}
                </h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                {selectedUser.phone && (
                  <p className="text-sm text-gray-600">{selectedUser.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Vai trò</p>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex ${
                    selectedUser.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedUser.role === "admin"
                    ? "Quản trị viên"
                    : "Khách hàng"}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Trạng thái
                </p>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                    selectedUser.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedUser.is_active ? (
                    <>
                      <FiUserCheck className="w-3 h-3" />
                      Đang hoạt động
                    </>
                  ) : (
                    <>
                      <FiUserX className="w-3 h-3" />
                      Đã vô hiệu hóa
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedUser.addresses && selectedUser.addresses.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Địa chỉ ({selectedUser.addresses.length})
                </p>
                <div className="space-y-2">
                  {selectedUser.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {address.receiver_name} - {address.phone}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.address_line}, {address.ward?.name || ""}, {address.district?.name || ""}
                        , {address.province?.name || ""}
                      </p>
                      {address.is_default && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.orders && selectedUser.orders.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Đơn hàng gần đây ({selectedUser.orders.length})
                </p>
                <div className="space-y-2">
                  {selectedUser.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.order_code}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(
                            order.total_amount
                          )}
                          ₫
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex items-center gap-6 text-xs text-gray-500">
              <div>
                <span className="font-medium">Ngày tạo:</span>{" "}
                {formatDate(selectedUser.created_at)}
              </div>
              {selectedUser.updated_at && (
                <div>
                  <span className="font-medium">Cập nhật lần cuối:</span>{" "}
                  {formatDate(selectedUser.updated_at)}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
