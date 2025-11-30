import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { TbX, TbPlus, TbMinus, TbTrash } from 'react-icons/tb';
import { Link } from 'react-router-dom';

const CartSidebar = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();

  // Format price to VND
  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[477px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-6">
          <h2 className="text-2xl font-[600] leading-[33.24px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-[#262626] hover:text-black transition-colors mt-2"
          >
            <TbX size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#737373] text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                // Get primary image or first image
                const itemImage = item.images?.find(img => img.is_primary)?.image_url 
                  || item.images?.[0]?.image_url 
                  || item.image 
                  || '/placeholder.png';
                
                return (
                  <div key={item.cartId} className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/product/${item.slug || item.id}`} onClick={() => setIsCartOpen(false)}>
                    <img 
                      src={itemImage} 
                      alt={item.name}
                      className="w-[70px] h-[100px] object-cover"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Link 
                          to={`/product/${item.id}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-[400] text-black hover:text-black transition-colors leading-[16.8px] tracking-[1.4px] block"
                          style={{ fontFamily: 'Maison Neue, sans-serif' }}
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[#737373] mt-0.5 leading-4 tracking-[0.2px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                          {item.selectedSize} | {item.selectedColor}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-[#737373] hover:text-[#D0021B] transition-colors"
                      >
                        <TbTrash size={14} />
                      </button>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col leading-4 tracking-[0.2px]">
                        <div className="flex items-center gap-0.5">
                          <span className="text-xs text-[#262626] font-[600]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                            {formatPrice(item.selectedVariant?.price || item.price)}₫
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#DDDBDC]">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="px-[15px] py-3 hover:bg-[#F5F5F5] transition-colors"
                        >
                          <TbMinus size={12} />
                        </button>
                        <span className="px-0 text-xs font-[400] text-center w-px leading-4 tracking-[0.2px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="px-[15px] py-3 hover:bg-[#F5F5F5] transition-colors"
                        >
                          <TbPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-[30px] bg-white shadow-[0px_-6px_18px_0px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-1">
                <span className="text-base font-[600] text-black leading-6 tracking-[0.2px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                  Subtotal
                </span>
                <span className="text-sm font-[400] text-black leading-[16.8px] tracking-[1.4px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                  ({getCartCount()} {getCartCount() === 1 ? 'item' : 'items'})
                </span>
              </div>
              <span className="text-base font-[600] text-black leading-6 tracking-[0.2px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                {formatPrice(getCartTotal())}₫
              </span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#262626] text-white py-3 font-[400] text-sm leading-[16.8px] tracking-[1.4px] hover:bg-black transition-colors mb-8" 
              style={{ fontFamily: 'Maison Neue, sans-serif' }}
            >
              CONTINUE TO CHECKOUT
            </button>
            
            <p className="text-xs text-center text-black leading-4 tracking-[0.2px] font-[600]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
              Psst, get it now before it sells out.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
