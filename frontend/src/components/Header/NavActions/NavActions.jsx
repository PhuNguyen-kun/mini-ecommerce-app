import { Link } from 'react-router-dom';
import { HiMagnifyingGlass, HiUser, HiShoppingCart } from 'react-icons/hi2';
import { useCart } from '../../../context/CartContext';

export default function NavActions() {
  const { setIsCartOpen, getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <div className="flex items-center gap-4">
      <Link to="/search" className="hover:opacity-70 transition-opacity" aria-label="Search">
        <HiMagnifyingGlass className="w-5 h-5" />
      </Link>
      <button className="hover:opacity-70 transition-opacity" aria-label="Account">
        <HiUser className="w-5 h-5" />
      </button>
      <button 
        className="hover:opacity-70 transition-opacity relative" 
        aria-label="Shopping Cart"
        onClick={() => setIsCartOpen(true)}
      >
        <HiShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#D0021B] text-white text-xs font-[600] rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
