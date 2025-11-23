import { Link } from 'react-router-dom';
import { HiMagnifyingGlass, HiUser, HiShoppingCart } from 'react-icons/hi2';

export default function NavActions() {
  return (
    <div className="flex items-center gap-4">
      <Link to="/search" className="hover:opacity-70 transition-opacity" aria-label="Search">
        <HiMagnifyingGlass className="w-5 h-5" />
      </Link>
      <button className="hover:opacity-70 transition-opacity" aria-label="Account">
        <HiUser className="w-5 h-5" />
      </button>
      <button className="hover:opacity-70 transition-opacity" aria-label="Shopping Cart">
        <HiShoppingCart className="w-5 h-5" />
      </button>
    </div>
  );
}
