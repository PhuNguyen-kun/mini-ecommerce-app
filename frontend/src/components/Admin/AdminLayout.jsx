import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HiUser,
  HiBars3,
  HiHome,
  HiShoppingBag,
  HiCube,
  HiFolder,
  HiUsers,
  HiStar,
} from "react-icons/hi2";
import { Dropdown, Tooltip } from "antd";
import authService from "../../services/authService";
import { message } from "antd";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role !== "admin") {
            navigate("/admin/login");
            return;
          }
          setUserName(user.full_name || "");
          setUserAvatar(user.avatar_url || "");
        } catch (e) {
          console.error("Error parsing user data:", e);
          navigate("/admin/login");
        }
      } else {
        navigate("/admin/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      message.success("Đăng xuất thành công");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/admin/login");
    }
  };

  const menuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      style: {
        color: "#D0021B",
      },
      onClick: handleLogout,
    },
  ];

  const menuItemsList = [
    {
      key: "/admin/dashboard",
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: HiHome,
    },
    {
      key: "/admin/orders",
      label: "Đơn hàng",
      path: "/admin/orders",
      icon: HiShoppingBag,
    },
    {
      key: "/admin/products",
      label: "Sản phẩm",
      path: "/admin/products",
      icon: HiCube,
    },
    {
      key: "/admin/categories",
      label: "Danh mục",
      path: "/admin/categories",
      icon: HiFolder,
    },
    {
      key: "/admin/users",
      label: "Người dùng",
      path: "/admin/users",
      icon: HiUsers,
    },
    {
      key: "/admin/reviews",
      label: "Đánh giá",
      path: "/admin/reviews",
      icon: HiStar,
    },
  ];

  const currentPath = location.pathname;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <aside
        className={`bg-black text-white flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center relative">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-900 rounded transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <HiBars3 className="w-5 h-5" />
          </button>
          <h1
            className={`text-xl font-bold transition-all duration-300 whitespace-nowrap ${
              isCollapsed
                ? "opacity-0 max-w-0 overflow-hidden ml-0"
                : "opacity-100 max-w-[200px] ml-3"
            }`}
          >
            Admin Panel
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItemsList.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path === "/admin/dashboard" && currentPath === "/admin");
              const Icon = item.icon;

              const menuItem = (
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white text-black font-medium"
                      : "text-white hover:bg-gray-900"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`transition-all duration-300 whitespace-nowrap ${
                      isCollapsed
                        ? "opacity-0 max-w-0 overflow-hidden ml-0"
                        : "opacity-100 max-w-[200px] ml-3"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );

              return (
                <li key={item.key}>
                  {isCollapsed ? (
                    <Tooltip title={item.label} placement="right">
                      {menuItem}
                    </Tooltip>
                  ) : (
                    menuItem
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-end">
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["hover"]}
              placement="bottomRight"
            >
              <button
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                aria-label="Account"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "block";
                    }}
                  />
                ) : null}
                <HiUser
                  className="w-5 h-5"
                  style={{ display: userAvatar ? "none" : "block" }}
                />
                {userName && (
                  <span className="text-sm font-medium text-black max-w-[100px] truncate">
                    {userName}
                  </span>
                )}
              </button>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
