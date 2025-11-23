import { Link, useLocation } from 'react-router-dom';

export default function AboutSubNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { text: 'About', path: '/about' },
    { text: 'Stores', path: '/stores' },
    { text: 'Factories', path: '/factories' },
    { text: 'Environmental Initiatives', path: '/environmental' },
    { text: 'Our Carbon Commitment', path: '/carbon' },
    { text: 'Annual Impact Report', path: '/impact' },
    { text: 'Cleaner Fashion', path: '/cleaner-fashion' },
  ];

  return (
    <div className="flex items-center justify-center gap-6 px-6 py-5 border-b border-gray-200">
      {navItems.map((item, index) => (
        <Link 
          key={index} 
          to={item.path}
          className={`cursor-pointer hover:opacity-70 ${
            currentPath === item.path ? 'relative' : ''
          }`}
        >
          <p className="text-xs text-gray-700">{item.text}</p>
          {currentPath === item.path && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </Link>
      ))}
    </div>
  );
}
