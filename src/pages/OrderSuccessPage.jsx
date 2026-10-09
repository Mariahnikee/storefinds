import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock3 } from "lucide-react";
import { useCart } from "../context/CartContext";

const CART_STORAGE_KEY = "storefinds-cart";

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const reference = params.get("reference");

  useEffect(() => {
    if (!reference) {
      setError("No payment reference was found.");
      setChecking(false);
      return undefined;
    }

    let active = true;
    let timer;
    let attempts = 0;

    const load = async () => {
      try {
        const response = await fetch(`/api/verify-payment?reference=${encodeURIComponent(reference)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to verify payment");
        if (!active) return;

        setOrder(data.order);
        setChecking(false);

        if (data.paid || data.order?.paymentStatus === "paid") {
          // Clear both React state and the persisted cart so a completed order
          // cannot reappear when the customer returns to the shop.
          clearCart();
          try {
            localStorage.removeItem(CART_STORAGE_KEY);
          } catch {
            // Ignore storage errors; the in-memory cart is still cleared.
          }
          return;
        }

        if (attempts < 5) {
          attempts += 1;
          timer = window.setTimeout(load, 2500);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message);
        setChecking(false);
      }
    };

    load();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [reference, clearCart]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-5 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#D6CDBE] p-8 md:p-10 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-3xl font-bold text-[#2C2C2A]">We couldn't verify your payment</h1>
            <p className="text-gray-500 mt-3">{error}</p>
            <p className="text-sm text-gray-500 mt-3">If money was deducted, please don't pay again. Contact Shop MK Finds with your payment reference.</p>
            {reference && <p className="text-xs text-gray-400 mt-4 break-all">Reference: {reference}</p>}
          </>
        ) : !order ? (
          <>
            <div className="animate-pulse mx-auto w-14 h-14 rounded-full bg-[#F0EAE0]" />
            <h1 className="text-2xl font-bold mt-6">Confirming your payment…</h1>
            <p className="text-gray-500 mt-2">Please wait while we verify your payment.</p>
          </>
        ) : order.paymentStatus === "paid" ? (
          <>
            <CheckCircle2 className="mx-auto text-[#6D213C]" size={64} />
            <p className="text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold mt-5">Shop MK Finds</p>
            <h1 className="text-4xl font-bold mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order confirmed</h1>
            <p className="text-gray-500 mt-3">Order <strong>{order.orderId}</strong></p>
            <div className="bg-[#FAF7F2] rounded-2xl p-5 mt-6 text-left">
              <div className="flex justify-between font-bold"><span>Products total</span><span>₦{Number(order.amount).toLocaleString()}</span></div>
              <p className="text-sm text-gray-500 mt-3">Bolt delivery is arranged separately and the delivery fee is paid on delivery.</p>
              <p className="text-sm mt-3"><strong>Status:</strong> Paid</p>
            </div>
            <p className="text-sm text-gray-500 mt-6">Thank you, {order.customer.name}. Your order has been received.</p>
          </>
        ) : (
          <>
            <Clock3 className="mx-auto text-[#6D213C]" size={64} />
            <p className="text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold mt-5">Shop MK Finds</p>
            <h1 className="text-4xl font-bold mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Payment processing</h1>
            <p className="text-gray-500 mt-3">We're still confirming your payment. Please don't make another payment.</p>
            <p className="text-sm mt-5">Order <strong>{order.orderId}</strong></p>
            {checking && <p className="text-xs text-gray-400 mt-2">Checking Paystack…</p>}
          </>
        )}
        <Link to="/shop" className="inline-block mt-7 bg-[#6D213C] text-white px-6 py-3 rounded-xl font-semibold">Continue Shopping</Link>
      </div>
    </div>
  );
}
