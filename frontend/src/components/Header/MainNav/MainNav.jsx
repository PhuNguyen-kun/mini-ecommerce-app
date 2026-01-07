import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineBars3, HiXMark } from "react-icons/hi2";
import Logo from "../Logo/Logo";
import NavActions from "../NavActions/NavActions";

export default function MainNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // About section includes: /about, /stores, /factories, etc.
  const isAboutSection =
    currentPath.startsWith("/about") ||
    currentPath === "/stores" ||
    currentPath === "/factories" ||
    currentPath === "/environmental" ||
    currentPath === "/carbon" ||
    currentPath === "/impact" ||
    currentPath === "/cleaner-fashion";

  // Breakpoints: mobile < 768px, tablet 768px-1024px, desktop > 1024px
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 items-center px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-3.5 border-b border-gray-200">
        {/* Left - Navigation Links (Hidden on mobile/tablet, visible on desktop) */}
        <div className="flex items-center justify-start">
          {/* Mobile/Tablet: Hamburger menu button */}
          {isMobile || isTablet ? (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <HiOutlineBars3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ) : (
            // Desktop: Navigation links
            <div className="flex items-center gap-3 lg:gap-4">
              <Link
                to="/women"
                className={`px-2 py-2 cursor-pointer hover:opacity-70 ${
                  currentPath === "/women" ? "relative" : ""
                }`}
              >
                <p className="text-sm lg:text-base font-medium">Nữ</p>
                {currentPath === "/women" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
              <Link
                to="/men"
                className={`px-2 py-2 cursor-pointer hover:opacity-70 ${
                  currentPath === "/men" ? "relative" : ""
                }`}
              >
                <p className="text-sm lg:text-base font-medium">Nam</p>
                {currentPath === "/men" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
              <Link
                to="/about"
                className={`px-2 py-2 cursor-pointer hover:opacity-70 ${
                  isAboutSection ? "relative" : ""
                }`}
              >
                <p className="text-sm lg:text-base font-medium">Giới thiệu</p>
                {isAboutSection && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
              <Link
                to="/blog"
                className={`px-2 py-2 cursor-pointer hover:opacity-70 ${
                  currentPath === "/blog" ? "relative" : ""
                }`}
              >
                <p className="text-sm lg:text-base font-medium whitespace-nowrap">
                  Câu chuyện
                </p>
                {currentPath === "/blog" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
            </div>
          )}
        </div>

        {/* Center Logo */}
        <Link to="/" className="flex justify-center">
          <Logo />
        </Link>

        {/* Right - Actions */}
        <div className="flex justify-end items-center">
          <NavActions />
        </div>
      </div>

      {/* Mobile/Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-white z-50 shadow-2xl flex flex-col lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links in Menu */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex flex-col space-y-1">
                <Link
                  to="/women"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    currentPath === "/women" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  <span className="text-base">Nữ</span>
                </Link>
                <Link
                  to="/men"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    currentPath === "/men" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  <span className="text-base">Nam</span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    isAboutSection ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  <span className="text-base">Giới thiệu</span>
                </Link>
                <Link
                  to="/blog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    currentPath === "/blog" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  <span className="text-base">Câu chuyện</span>
                </Link>
              </div>
            </div>

            {/* Actions in Mobile Menu */}
            <div className="flex-1 overflow-y-auto p-4">
              <NavActions
                mobile
                onActionClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
