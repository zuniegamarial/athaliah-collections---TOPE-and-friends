import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const currentUser = localStorage.getItem('username') || 'guest';
  const cartStorageKey = `athaliah_cart_${currentUser}`;

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(cartStorageKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Automatically save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => 
        (item.id && item.id === product.id) || 
        (item._id && item._id === product._id) ||
        (item.name && item.name === product.name)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + (product.quantity || 1);
        return updated;
      } else {
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId && item._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}