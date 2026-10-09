import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartWidget() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setOpen(true);
    window.addEventListener("storefinds:open-cart", handleOpenCart);
    return () => window.removeEventListener("storefinds:open-cart", handleOpenCart);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open shopping cart" className="hidden sm:flex fixed right-4 bottom-4 z-[1100] items-center gap-2 bg-[#6D213C] text-white rounded-full px-3.5 sm:px-5 py-3 shadow-xl hover:bg-[#8B2D4F] transition">
        <span className="relative"><ShoppingBag size={19}/><span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-white text-[#6D213C] text-[10px] font-bold flex items-center justify-center">{itemCount}</span></span>
        <span className="text-sm font-semibold">Cart · ₦{subtotal.toLocaleString()}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[1200]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-[88%] sm:w-full sm:max-w-[410px] bg-[#FAF7F2] shadow-2xl flex flex-col overflow-hidden"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close shopping cart"
              className="absolute left-[-48px] top-4 w-10 h-10 rounded-full bg-white text-[#2C2C2A] shadow-lg flex items-center justify-center hover:bg-[#F5E8EE] sm:hidden"
            >
              <X size={20} strokeWidth={1.8}/>
            </button>

            <div className="shrink-0 bg-white border-b border-[#E7DDD2] px-5 py-4 sm:px-5 sm:py-5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F5E8EE] flex items-center justify-center shrink-0">
                  <ShoppingBag size={19} strokeWidth={1.7} className="text-[#6D213C]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[17px] sm:text-xl font-semibold text-[#2C2C2A] leading-tight">Shopping Cart</h2>
                  <p className="text-[11px] text-[#7A7570] mt-0.5">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close shopping cart"
                className="w-9 h-9 rounded-full border border-[#D6CDBE] bg-white text-[#2C2C2A] flex items-center justify-center hover:bg-[#F5E8EE] shrink-0"
              >
                <X size={17}/>
              </button>
            </div>

            {items.length ? (
              <>
                <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 sm:py-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.key} className="bg-white rounded-xl border border-[#E9E0D6] p-3.5 sm:p-4 shadow-sm">
                      <div className="flex gap-3">
                        <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-lg bg-[#F8F5F0] overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-[13px] sm:text-sm text-[#2C2C2A] leading-snug line-clamp-2">{item.title}</p>
                              {item.color && <p className="text-[10px] text-[#7A7570] mt-1">{item.color}</p>}
                            </div>
                            <button onClick={() => removeFromCart(item.key)} className="text-[#A39A92] hover:text-red-600 p-1 -mr-1 shrink-0" aria-label={`Remove ${item.title}`}>
                              <Trash2 size={14}/>
                            </button>
                          </div>

                          <p className="font-semibold text-[13px] text-[#6D213C] mt-2">₦{item.price.toLocaleString()}</p>

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-[#D6CDBE] rounded-lg overflow-hidden bg-[#FAF7F2]">
                              <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-[#2C2C2A] hover:bg-[#F5E8EE]" aria-label="Decrease quantity"><Minus size={12}/></button>
                              <span className="w-7 text-center text-xs font-semibold text-[#2C2C2A]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-[#2C2C2A] hover:bg-[#F5E8EE]" aria-label="Increase quantity"><Plus size={12}/></button>
                            </div>
                            <span className="text-[11px] text-[#7A7570]">Item total: ₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 border-t border-[#E7DDD2] px-4 sm:px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:py-5 bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center text-[15px] sm:text-lg font-bold text-[#2C2C2A]">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7570] mt-1.5">Delivery fee is separate and paid on delivery.</p>
                  <Link to="/checkout" onClick={() => setOpen(false)} className="mt-3 block w-full bg-[#6D213C] hover:bg-[#8B2D4F] text-white text-center py-3.5 rounded-xl text-sm font-bold shadow-sm transition-colors">Checkout</Link>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-[#FAF7F2]">
                <div className="w-14 h-14 rounded-full bg-[#F5E8EE] flex items-center justify-center text-[#6D213C]"><ShoppingBag size={23}/></div>
                <h3 className="font-bold text-lg mt-4 text-[#2C2C2A]">Your cart is empty</h3>
                <p className="text-sm text-[#7A7570] mt-2 max-w-[250px] leading-relaxed">Add something you love and it will appear here.</p>
                <button onClick={() => setOpen(false)} className="mt-5 bg-[#6D213C] text-white px-5 py-3 rounded-xl font-semibold">Continue Shopping</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
