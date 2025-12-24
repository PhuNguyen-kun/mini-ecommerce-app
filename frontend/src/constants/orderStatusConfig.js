import { FiClock, FiCheckCircle, FiTruck, FiXCircle } from "react-icons/fi";

export const getStatusConfig = (status, paymentStatus) => {
  const statusMap = {
    PENDING_PAYMENT: {
      label: "Chờ thanh toán",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      IconComponent: FiClock,
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      IconComponent: FiCheckCircle,
    },
    PAID: {
      label: "Đã thanh toán",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      IconComponent: FiCheckCircle,
    },
    SHIPPING: {
      label: "Đang giao hàng",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      IconComponent: FiTruck,
    },
    COMPLETED: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800 border-green-200",
      IconComponent: FiCheckCircle,
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      IconComponent: FiXCircle,
    },
    PAYMENT_FAILED: {
      label: "Thanh toán thất bại",
      color: "bg-red-100 text-red-800 border-red-200",
      IconComponent: FiXCircle,
    },
  };

  return statusMap[status] || statusMap.PENDING_PAYMENT;
};

export const getStatusLabel = (status, paymentStatus) => {
  const statusMap = {
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
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
