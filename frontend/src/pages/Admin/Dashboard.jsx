import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Card, Statistic, Alert, Select, Row, Col } from "antd";
import {
  HiShoppingBag,
  HiCurrencyDollar,
  HiUsers,
  HiCube,
  HiFolder,
} from "react-icons/hi2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import adminService from "../../services/adminService";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Custom hook để animate số từ 0 đến target value
const useCountUp = (targetValue, duration = 1500, startDelay = 0) => {
  const [count, setCount] = useState(0);
  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const cleanupRef = useRef(null);

  // Cleanup ngay lập tức khi component unmount
  useLayoutEffect(() => {
    isMountedRef.current = true;

    cleanupRef.current = () => {
      isMountedRef.current = false;
      // Dừng ngay lập tức, không chờ
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    return cleanupRef.current;
  }, []);

  useEffect(() => {
    if (!targetValue || targetValue === 0) {
      if (isMountedRef.current) {
        setCount(0);
      }
      return;
    }

    // Cancel any existing animations ngay lập tức
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!isMountedRef.current) return;

    // Reset count
    setCount(0);

    const startAnimation = () => {
      if (!isMountedRef.current) return;

      const startTime = performance.now();
      const target = targetValue;

      const animate = (currentTime) => {
        if (!isMountedRef.current) {
          return;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(target * easeOut);

        if (isMountedRef.current) {
          setCount(currentValue);
        }

        if (progress < 1 && isMountedRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else if (isMountedRef.current) {
          setCount(target);
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startAnimation();
      }
      timeoutRef.current = null;
    }, startDelay);

    return () => {
      // Cleanup ngay lập tức
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [targetValue, duration, startDelay]);

  return count;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState("7");
  const [ordersPeriod, setOrdersPeriod] = useState("7");
  const [chartsReady, setChartsReady] = useState(false);
  const [numbersReady, setNumbersReady] = useState(false);

  // Count-up animations cho các số
  // Doanh thu dùng duration ngắn hơn và step lớn hơn vì số lớn
  const totalOrdersCount = useCountUp(
    stats?.overview?.totalOrders || 0,
    1200,
    numbersReady ? 0 : 100
  );
  const totalRevenueCount = useCountUp(
    stats?.overview?.totalRevenue || 0,
    1000, // Nhanh hơn cho doanh thu
    numbersReady ? 0 : 150
  );
  const totalUsersCount = useCountUp(
    stats?.overview?.totalUsers || 0,
    1200,
    numbersReady ? 0 : 200
  );
  const activeProductsCount = useCountUp(
    stats?.overview?.activeProducts || 0,
    1200,
    numbersReady ? 0 : 250
  );
  const totalCategoriesCount = useCountUp(
    stats?.overview?.totalCategories || 0,
    1200,
    numbersReady ? 0 : 300
  );

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Delay một chút sau khi data load để đảm bảo charts được mount trước khi update data
  useEffect(() => {
    if (stats && !loading) {
      // Set chartsReady sau một delay nhỏ để charts được mount với empty data trước
      const timer = setTimeout(() => {
        setChartsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setChartsReady(false);
    }
  }, [stats, loading]);

  // Trigger number animations khi data ready
  useEffect(() => {
    if (stats && !loading) {
      const timer = setTimeout(() => {
        setNumbersReady(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setNumbersReady(false);
    }
  }, [stats, loading]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Revenue Chart Data
  const getRevenueChartData = () => {
    if (!stats || !chartsReady) {
      // Return empty data structure để chart render ngay, sau đó animate khi data load
      return {
        labels: [],
        datasets: [
          {
            label: "Doanh thu",
            data: [],
            borderColor: "rgb(0, 0, 0)",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }
    const data =
      revenuePeriod === "7"
        ? stats.revenueChart.last7Days
        : stats.revenueChart.last30Days;

    return {
      labels: data.map((item) => formatDate(item.date)),
      datasets: [
        {
          label: "Doanh thu",
          data: data.map((item) => item.revenue),
          borderColor: "rgb(0, 0, 0)",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Orders Chart Data
  const getOrdersChartData = () => {
    if (!stats || !chartsReady) {
      // Return empty data structure để chart render ngay, sau đó animate khi data load
      return {
        labels: [],
        datasets: [
          {
            label: "Số đơn hàng",
            data: [],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }
    const data =
      ordersPeriod === "7"
        ? stats.ordersChart.last7Days
        : stats.ordersChart.last30Days;

    return {
      labels: data.map((item) => formatDate(item.date)),
      datasets: [
        {
          label: "Số đơn hàng",
          data: data.map((item) => item.count),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Orders by Status Chart Data (for Bar Chart)
  const getOrdersByStatusChartData = () => {
    if (!stats || !chartsReady) {
      // Return empty data structure để chart render ngay, sau đó animate khi data load
      return {
        labels: [],
        datasets: [
          {
            label: "Số đơn hàng",
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 2,
          },
        ],
      };
    }

    const statusLabels = {
      PENDING_PAYMENT: "Chờ thanh toán",
      CONFIRMED: "Đã xác nhận",
      PAID: "Đã thanh toán",
      SHIPPING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      PAYMENT_FAILED: "Thanh toán thất bại",
    };

    const statusColors = {
      PENDING_PAYMENT: "rgba(251, 191, 36, 0.8)", // yellow
      CONFIRMED: "rgba(59, 130, 246, 0.8)", // blue
      PAID: "rgba(34, 197, 94, 0.8)", // green
      SHIPPING: "rgba(168, 85, 247, 0.8)", // purple
      COMPLETED: "rgba(16, 185, 129, 0.8)", // teal
      CANCELLED: "rgba(239, 68, 68, 0.8)", // red
      PAYMENT_FAILED: "rgba(107, 114, 128, 0.8)", // gray
    };

    const labels = [];
    const data = [];
    const backgroundColors = [];

    Object.entries(stats.ordersByStatus).forEach(([status, count]) => {
      labels.push(statusLabels[status] || status);
      data.push(count);
      backgroundColors.push(statusColors[status] || "rgba(128, 128, 128, 0.8)");
    });

    return {
      labels,
      datasets: [
        {
          label: "Số đơn hàng",
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((c) => c.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  };

  // Top 10 Best-Selling Products Chart Data (for Pie Chart)
  const getTopProductsChartData = () => {
    if (!stats || !stats.topSellingProducts || !chartsReady) {
      // Return empty data structure để chart render ngay, sau đó animate khi data load
      return {
        labels: [],
        datasets: [
          {
            label: "Số lượng bán",
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 2,
          },
        ],
      };
    }

    const colors = [
      "rgba(59, 130, 246, 0.8)", // blue
      "rgba(34, 197, 94, 0.8)", // green
      "rgba(251, 191, 36, 0.8)", // yellow
      "rgba(239, 68, 68, 0.8)", // red
      "rgba(168, 85, 247, 0.8)", // purple
      "rgba(16, 185, 129, 0.8)", // teal
      "rgba(249, 115, 22, 0.8)", // orange
      "rgba(236, 72, 153, 0.8)", // pink
      "rgba(14, 165, 233, 0.8)", // sky
      "rgba(139, 92, 246, 0.8)", // violet
    ];

    const labels = stats.topSellingProducts.map((product) => {
      // Truncate long product names
      const name = product.productName;
      return name.length > 30 ? name.substring(0, 30) + "..." : name;
    });
    const data = stats.topSellingProducts.map(
      (product) => product.totalQuantity
    );
    const backgroundColors = colors.slice(0, stats.topSellingProducts.length);

    return {
      labels,
      datasets: [
        {
          label: "Số lượng bán",
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((c) => c.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      datalabels: {
        display: false, // Disable for line/bar charts
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Tắt legend cho bar chart
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      // x: {
      //   ticks: {
      //     maxRotation: 45,
      //     minRotation: 45,
      //     font: {
      //       size: 11,
      //     },
      //   },
      // },
      // y: {
      //   beginAtZero: true,
      //   ticks: {
      //     stepSize: 1,
      //   },
      // },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} sản phẩm (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#ffffff",
        font: {
          weight: "bold",
          size: 14,
          family: "'Arial', 'Helvetica', sans-serif",
        },
        formatter: (value, ctx) => {
          const dataset = ctx.chart.data.datasets[0];
          const total = dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? (value / total) * 100 : 0;

          // Format: nếu >= 1% thì hiển thị 1 chữ số thập phân, nếu < 1% thì làm tròn
          const formatted =
            percentage >= 1 ? percentage.toFixed(1) : percentage.toFixed(0);
          return `${formatted}%`;
        },
        display: function (ctx) {
          // Chỉ hiển thị nếu slice >= 2% để tránh quá đông
          const dataset = ctx.chart.data.datasets[0];
          const total = dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((ctx.parsed || 0) / total) * 100 : 0;
          return percentage >= 2;
        },
        anchor: "center",
        align: "center",
        backgroundColor: function (ctx) {
          // Thêm background màu đen mờ để text dễ đọc
          return "rgba(0, 0, 0, 0.6)";
        },
        borderRadius: 4,
        padding: {
          top: 4,
          bottom: 4,
          left: 6,
          right: 6,
        },
        textStrokeColor: "#000000",
        textStrokeWidth: 0.5,
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Thử lại
          </button>
        }
      />
    );
  }

  if (!stats) {
    return <Alert title="Không có dữ liệu" type="warning" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ display: "flex", flexWrap: "wrap" }}>
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={{ flex: "1 1 0" }}
          xl={{ flex: "1 1 0" }}
        >
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-600 text-sm font-medium mb-4">
                Tổng đơn hàng
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <HiShoppingBag className="text-3xl text-blue-600" />
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#1890ff" }}
                >
                  {totalOrdersCount.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div>Hôm nay: {stats.overview.todayOrders}</div>
                <div>Tuần này: {stats.overview.weekOrders}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          md={12}
          lg={{ flex: "1 1 0" }}
          xl={{ flex: "1 1 0" }}
        >
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-600 text-sm font-medium mb-4">
                Doanh thu
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <HiCurrencyDollar className="text-3xl text-green-600" />
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#52c41a" }}
                >
                  {formatCurrency(totalRevenueCount)}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div>
                  Hôm nay: {formatCurrency(stats.overview.todayRevenue)}
                </div>
                <div>
                  Tháng này: {formatCurrency(stats.overview.monthRevenue)}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          md={12}
          lg={{ flex: "1 1 0" }}
          xl={{ flex: "1 1 0" }}
        >
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-600 text-sm font-medium mb-4">
                Tổng người dùng
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <HiUsers className="text-3xl text-purple-600" />
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#722ed1" }}
                >
                  {totalUsersCount.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div>Mới tháng này: {stats.overview.newUsersThisMonth}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          md={12}
          lg={{ flex: "1 1 0" }}
          xl={{ flex: "1 1 0" }}
        >
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-600 text-sm font-medium mb-4">
                Sản phẩm
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <HiCube className="text-3xl text-orange-600" />
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#fa8c16" }}
                >
                  {activeProductsCount.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div>Tổng: {stats.overview.totalProducts}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          md={12}
          lg={{ flex: "1 1 0" }}
          xl={{ flex: "1 1 0" }}
        >
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-600 text-sm font-medium mb-4">
                Danh mục
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <HiFolder className="text-3xl text-indigo-600" />
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#2f54eb" }}
                >
                  {totalCategoriesCount.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="Doanh thu theo thời gian"
            extra={
              <Select
                value={revenuePeriod}
                onChange={setRevenuePeriod}
                style={{ width: 100 }}
                options={[
                  { label: "7 ngày", value: "7" },
                  { label: "30 ngày", value: "30" },
                ]}
              />
            }
            className="shadow-sm"
          >
            <div style={{ height: "300px" }}>
              <Line data={getRevenueChartData()} options={chartOptions} />
            </div>
          </Card>
        </Col>

        {/* Orders Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="Đơn hàng theo thời gian"
            extra={
              <Select
                value={ordersPeriod}
                onChange={setOrdersPeriod}
                style={{ width: 100 }}
                options={[
                  { label: "7 ngày", value: "7" },
                  { label: "30 ngày", value: "30" },
                ]}
              />
            }
            className="shadow-sm"
          >
            <div style={{ height: "300px" }}>
              <Line data={getOrdersChartData()} options={chartOptions} />
            </div>
          </Card>
        </Col>

        {/* Top 10 Best-Selling Products Chart */}
        <Col xs={24} lg={12}>
          <Card title="Top 10 sản phẩm bán chạy" className="shadow-sm">
            <div style={{ height: "300px" }}>
              <Pie
                data={getTopProductsChartData()}
                options={pieChartOptions}
                plugins={[ChartDataLabels]}
              />
            </div>
          </Card>
        </Col>

        {/* Orders by Status Bar Chart */}
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng theo trạng thái" className="shadow-sm">
            <div style={{ height: "300px" }}>
              <Bar
                data={getOrdersByStatusChartData()}
                options={barChartOptions}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
