import React from "react";
import { Home, ShoppingBag, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function MobileBottomNav() {
  const { itemCount } = useCart();

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("storefinds:open-cart"));
  };

  const navClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full text-[10px] font-medium transition-colors ${
      isActive ? "text-[#6D213C]" : "text-[#7A7570]"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-1050 sm:hidden h-17 bg-white/95 backdrop-blur-md border-t border-[#E7DDD2] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="h-full max-w-md mx-auto flex items-center px-1">
        <NavLink to="/" className={navClass} aria-label="Home">
          <Home size={19} strokeWidth={1.8} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/shop" className={navClass} aria-label="Shop">
          <ShoppingBag size={19} strokeWidth={1.8} />
          <span>Shop</span>
        </NavLink>

        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full text-[10px] font-medium text-[#7A7570]"
          aria-label="Open cart"
        >
          <span className="relative">
            <ShoppingCart size={19} strokeWidth={1.8} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4.25 h-4.25 px-1 rounded-full bg-[#6D213C] text-white text-[9px] font-bold flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </span>
          <span>Cart</span>
        </button>
      </div>
    </nav>
  );
}
