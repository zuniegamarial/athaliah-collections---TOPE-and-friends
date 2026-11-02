import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load saved cart on startup
    useEffect(() => {
        AsyncStorage.getItem('cart_items').then((data) => {
            if (data) {
                setCartItems(JSON.parse(data));
            }
        }).catch(() => {});
    }, []);

    // Save cart changes locally
    const saveCart = (newItems) => {
        setCartItems(newItems);
        AsyncStorage.setItem('cart_items', JSON.stringify(newItems)).catch(() => {});
    };

    const addToCart = (product) => {
        const existing = cartItems.find(item => item.id === product.id);
        let updated;
        if (existing) {
            updated = cartItems.map(item => 
                item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
            );
        } else {
            updated = [...cartItems, { ...product, quantity: 1 }];
        }
        saveCart(updated);
    };

    const removeFromCart = (productId) => {
        const updated = cartItems.filter(item => item.id !== productId);
        saveCart(updated);
    };

    const clearCart = () => {
        saveCart([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);