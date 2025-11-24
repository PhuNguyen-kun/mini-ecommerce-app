import { useCart } from '../../context/CartContext';
import { TbX, TbPlus, TbMinus, TbTrash } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const CartSidebar = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount, addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  const recommendedProducts = [
    {
      id: 1,
      name: 'The Good Merino Wool Beanie',
      price: 35,
      originalPrice: null,
      sizes: ['One Size'],
      colors: [{ name: 'Chambray Blue', value: '#6B9AC4' }],
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=140&h=200&fit=crop',
      category: 'Accessories',
      description: 'One Size | Chambray Blue'
    }
  ];

  const handleAddRecommended = (product) => {
    addToCart(product, product.sizes[0], product.colors[0].name);
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
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-[70px] h-[100px] object-cover"
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
                          {item.originalPrice && (
                            <span className="text-xs text-[#737373] line-through font-[400]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                              ${item.originalPrice}
                            </span>
                          )}
                          <span className="text-xs text-[#262626] font-[600]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                            ${item.price}
                          </span>
                        </div>
                        {item.originalPrice && (
                          <span className="text-xs text-[#D0021B] font-[400]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                            ({Math.round((1 - item.price / item.originalPrice) * 100)}% Off)
                          </span>
                        )}
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
              ))}
            </div>
          )}

          {/* Before You Go Section */}
          {cart.length > 0 && (
            <div className="mt-6 pt-0">
              <h3 className="text-sm font-[600] mb-2 leading-[21px] tracking-[0.42px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                Before You Go
              </h3>
              <div className="space-y-2">
                {recommendedProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="border border-[#DDDBDC] p-[10px]"
                  >
                    <div className="flex gap-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-[70px] h-[100px] object-cover"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-[400] text-black leading-[16.8px] tracking-[1.4px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                            {product.name}
                          </h4>
                          <p className="text-xs text-[#737373] mt-0.5 leading-4 tracking-[0.2px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                            {product.description}
                          </p>
                        </div>
                        
                        <div className="flex items-end justify-between">
                          <span className="text-xs font-[600] text-[#262626] leading-4 tracking-[0.2px]" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
                            ${product.price}
                          </span>
                          <button 
                            onClick={() => handleAddRecommended(product)}
                            className="bg-[#262626] text-white px-0 py-3 text-sm font-[400] leading-[16.8px] tracking-[1.4px] hover:bg-black transition-colors w-[81px]"
                            style={{ fontFamily: 'Maison Neue, sans-serif' }}
                          >
                            ADD
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Indicator Dots */}
                <div className="flex gap-3 items-center justify-start">
                  {[0, 1, 2, 3].map((index) => (
                    <div 
                      key={index}
                      className={`w-[7px] h-[7px] rounded-full ${
                        index === currentSlide ? 'bg-black' : 'bg-[#DDDBDC]'
                      }`}
                    />
                  ))}
                </div>
              </div>
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
                ${getCartTotal()}
              </span>
            </div>
            
            <button className="w-full bg-[#262626] text-white py-3 font-[400] text-sm leading-[16.8px] tracking-[1.4px] hover:bg-black transition-colors mb-8" style={{ fontFamily: 'Maison Neue, sans-serif' }}>
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
