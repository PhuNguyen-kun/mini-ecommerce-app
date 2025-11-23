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
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-6">
        <Link to="/women" className={`px-3 py-2 cursor-pointer hover:opacity-70 ${currentPath === '/women' ? 'relative' : ''}`}>
          <p className="text-sm font-medium">Women</p>
          {currentPath === '/women' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
        </Link>
        <Link to="/men" className={`px-3 py-2 cursor-pointer hover:opacity-70 ${currentPath === '/men' ? 'relative' : ''}`}>
          <p className="text-sm font-medium">Men</p>
          {currentPath === '/men' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
        </Link>
        <Link to="/about" className={`px-3 py-2 cursor-pointer hover:opacity-70 ${isAboutSection ? 'relative' : ''}`}>
          <p className="text-sm font-medium">About</p>
          {isAboutSection && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
        </Link>
        <Link to="/blog" className={`px-3 py-2 cursor-pointer hover:opacity-70 ${currentPath === '/blog' ? 'relative' : ''}`}>
          <p className="text-sm font-medium">Everworld Stories</p>
          {currentPath === '/blog' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
        </Link>
      </div>

      <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
        <Logo />
      </Link>

      <NavActions />
    </div>
  );
}
