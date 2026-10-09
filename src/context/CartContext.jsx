import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "storefinds-cart";

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item &&
      typeof item.key === "string" &&
      typeof item.slug === "string" &&
      typeof item.title === "string" &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) >= 0 &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0
    ).map((item) => ({ ...item, price: Number(item.price), quantity: Number(item.quantity) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // Keep cart interactions working in memory when browser storage is unavailable.
      console.warn("Could not persist the cart in this browser.", error);
    }
  }, [items]);

  const addToCart = useCallback((product, quantity = 1, color = "") => {
    const safeQuantity = Number(quantity);
    const safePrice = Number(product?.price);
    if (!product?.slug || !product?.title || !Number.isInteger(safeQuantity) || safeQuantity < 1 ||
        !Number.isFinite(safePrice) || safePrice < 0) {
      console.warn("Ignored an invalid product or quantity while adding to cart.");
      return;
    }

    const normalizedColor = String(color || "");
    const key = `${product.slug}-${normalizedColor}`;
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => item.key === key
          ? { ...item, quantity: item.quantity + safeQuantity }
          : item);
      }
      return [...current, {
        key,
        slug: product.slug,
        title: product.title,
        price: safePrice,
        image: product.image || "",
        color: normalizedColor,
        quantity: safeQuantity,
      }];
    });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    const safeQuantity = Number(quantity);
    if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) {
      setItems((current) => current.filter((item) => item.key !== key));
      return;
    }
    setItems((current) => current.map((item) => item.key === key
      ? { ...item, quantity: safeQuantity }
      : item));
  }, []);

  const removeFromCart = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const value = useMemo(() => ({
    items, subtotal, itemCount, addToCart, updateQuantity, removeFromCart, clearCart,
  }), [items, subtotal, itemCount, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
