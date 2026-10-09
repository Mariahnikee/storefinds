import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "storefinds-cart";

function readCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const addToCart = useCallback((product, quantity = 1, color = "") => {
    setItems((current) => {
      const key = `${product.slug}-${color}`;
      const existing = current.find((item) => item.key === key);
      if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { key, slug: product.slug, title: product.title, price: Number(product.price), image: product.image || "", color, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity <= 0) return setItems((current) => current.filter((item) => item.key !== key));
    setItems((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
  }, []);

  const removeFromCart = useCallback((key) => setItems((current) => current.filter((item) => item.key !== key)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const value = useMemo(() => ({ items, subtotal, itemCount, addToCart, updateQuantity, removeFromCart, clearCart }), [items, subtotal, itemCount, addToCart, updateQuantity, removeFromCart, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
