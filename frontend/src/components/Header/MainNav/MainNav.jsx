import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiOutlineBars3, HiXMark } from 'react-icons/hi2';
import Logo from '../Logo/Logo';
import NavActions from '../NavActions/NavActions';

export default function MainNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // About section includes: /about, /stores, /factories, etc.
  const isAboutSection = currentPath.startsWith('/about') || 
                         currentPath === '/stores' || 
                         currentPath === '/factories' ||
                         currentPath === '/environmental' ||
                         currentPath === '/carbon' ||
                         currentPath === '/impact' ||
                         currentPath === '/cleaner-fashion';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 items-center px-2 sm:px-3 md:px-6 py-2 sm:py-2.5 md:py-3 border-b border-gray-200">
        {/* Left - Navigation Links (Always visible) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
          <Link to="/women" className={`px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 cursor-pointer hover:opacity-70 ${currentPath === '/women' ? 'relative' : ''}`}>
            <p className="text-[10px] sm:text-xs md:text-sm font-medium">Women</p>
            {currentPath === '/women' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </Link>
          <Link to="/men" className={`px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 cursor-pointer hover:opacity-70 ${currentPath === '/men' ? 'relative' : ''}`}>
            <p className="text-[10px] sm:text-xs md:text-sm font-medium">Men</p>
            {currentPath === '/men' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </Link>
          <Link to="/about" className={`flex px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 cursor-pointer hover:opacity-70 ${isAboutSection ? 'relative' : ''}`}>
            <p className="text-[10px] sm:text-xs md:text-sm font-medium">About</p>
            {isAboutSection && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </Link>
          <Link to="/blog" className={`flex px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 cursor-pointer hover:opacity-70 ${currentPath === '/blog' ? 'relative' : ''}`}>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Everworld Stories</p>
            {currentPath === '/blog' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </Link>
        </div>

        {/* Center Logo */}
        <Link to="/" className="flex justify-center">
          <Logo />
        </Link>

        {/* Right - Actions on desktop, Hamburger on mobile */}
        <div className="flex justify-end items-center">
          {!isMobile && <NavActions />}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Actions in Mobile Menu */}
            <div className="flex-1 overflow-y-auto p-4">
              <NavActions mobile onActionClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
