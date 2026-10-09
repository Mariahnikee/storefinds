import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

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

function normalizeCart(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) =>
    item &&
    typeof item.key === "string" &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    Number.isFinite(Number(item.price)) &&
    Number(item.price) >= 0 &&
    Number.isInteger(Number(item.quantity)) &&
    Number(item.quantity) > 0
  ).map((item) => ({ ...item, price: Number(item.price), quantity: Number(item.quantity) }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [userId, setUserId] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const itemsRef = useRef(items);
  const lastCloudCart = useRef("");

  useEffect(() => {
    itemsRef.current = items;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Could not persist the cart in this browser.", error);
    }
  }, [items]);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    let channel;

    async function loadUserCart(user) {
      if (!active) return;
      if (!user) {
        setUserId(null);
        setCloudReady(false);
        return;
      }

      setCloudReady(false);
      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.error("Could not load the shared cart. Run supabase/cart-sync.sql in the Supabase SQL Editor.", error);
        setCloudReady(false);
        return;
      }

      if (data) {
        const remoteItems = normalizeCart(data.items);
        lastCloudCart.current = JSON.stringify(remoteItems);
        setItems(remoteItems);
      } else {
        const guestItems = itemsRef.current;
        const serialized = JSON.stringify(guestItems);
        const { error: saveError } = await supabase
          .from("user_carts")
          .upsert({ user_id: user.id, items: guestItems, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
        if (!active) return;
        if (saveError) {
          console.error("Could not save the initial shared cart.", saveError);
          setCloudReady(false);
          return;
        }
        lastCloudCart.current = serialized;
      }

      setCloudReady(true);

      if (channel) supabase.removeChannel(channel);
      channel = supabase
        .channel(`cart-sync-${user.id}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "user_carts",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          if (!active || payload.eventType === "DELETE") return;
          const remoteItems = normalizeCart(payload.new?.items);
          const serialized = JSON.stringify(remoteItems);
          if (serialized !== lastCloudCart.current) {
            lastCloudCart.current = serialized;
            setItems(remoteItems);
          }
        })
        .subscribe();
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Could not read the authentication session.", error);
      loadUserCart(data?.session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserCart(session?.user || null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!supabase || !userId || !cloudReady) return;
    const serialized = JSON.stringify(items);
    if (serialized === lastCloudCart.current) return;

    let active = true;
    const timeout = setTimeout(async () => {
      const { error } = await supabase
        .from("user_carts")
        .upsert({ user_id: userId, items, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (!active) return;
      if (error) {
        console.error("Could not sync cart to Supabase. Check the cart table and its RLS policies.", error);
      } else {
        lastCloudCart.current = serialized;
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [items, userId, cloudReady]);

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
