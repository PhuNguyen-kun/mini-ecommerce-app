import { Link, useLocation } from 'react-router-dom';
import Logo from '../Logo/Logo';
import NavActions from '../NavActions/NavActions';

export default function MainNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // About section includes: /about, /stores, /factories, etc.
  const isAboutSection = currentPath.startsWith('/about') || 
                         currentPath === '/stores' || 
                         currentPath === '/factories' ||
                         currentPath === '/environmental' ||
                         currentPath === '/carbon' ||
                         currentPath === '/impact' ||
                         currentPath === '/cleaner-fashion';

  return (
    <div className="grid grid-cols-3 items-center px-2 sm:px-3 md:px-6 py-2 sm:py-2.5 md:py-3 border-b border-gray-200">
      {/* Left Navigation */}
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

      {/* Right Actions */}
      <div className="flex justify-end">
        <NavActions />
      </div>
    </div>
  );
}
