import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, selectedSize, selectedColor) => {
    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      cartId: `${product.id}-${selectedSize}-${selectedColor}`,
      quantity: 1
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.cartId === cartItem.cartId);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.cartId === cartItem.cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, cartItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) {
      removeFromCart(cartId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.cartId === cartId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
