import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const states = ["Lagos", "Abuja (FCT)", "Ogun", "Oyo", "Rivers", "Kano", "Kaduna", "Enugu", "Delta", "Other"];

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", note: "" });

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function pay() {
    setError("");
    if (!items.length) return setError("Your cart is empty.");
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state) return setError("Please complete all required checkout details.");
    setLoading(true);
    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, quantity, color }) => ({ slug, quantity, color })),
          customer: { name: form.name, email: form.email, phone: form.phone },
          delivery: { address: form.address, city: form.city, state: form.state, note: form.note },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start payment");
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (!items.length) return <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6"><h1 className="text-4xl font-bold text-[#2C2C2A]">Your cart is empty</h1><Link to="/shop" className="mt-6 bg-[#6D213C] text-white px-6 py-3 rounded-xl font-semibold">Continue Shopping</Link></div>;

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 md:px-8 py-10 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8"><p className="text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold">Shop MK Finds</p><h1 className="text-4xl md:text-5xl font-bold text-[#2C2C2A] mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Checkout</h1></div>
        <div className="grid lg:grid-cols-[1fr_390px] gap-8">
          <div className="space-y-6">
            <section className="bg-white rounded-3xl border border-[#D6CDBE] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-5">Your details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[["name","Full name","text"],["email","Email address","email"],["phone","Phone number","tel"]].map(([key,label,type]) => <label key={key} className="block"><span className="text-sm font-semibold text-[#2C2C2A]">{label} *</span><input type={type} value={form[key]} onChange={set(key)} className="mt-2 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 outline-none focus:border-[#6D213C]" /></label>)}
              </div>
            </section>
            <section className="bg-white rounded-3xl border border-[#D6CDBE] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-5">Delivery details</h2>
              <p className="text-sm text-gray-500 mb-5">Delivery is arranged with Bolt. The Bolt delivery fee is paid separately on delivery.</p>
              <div className="space-y-4">
                <label className="block"><span className="text-sm font-semibold">Full delivery address *</span><textarea value={form.address} onChange={set("address")} rows={3} className="mt-2 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 outline-none focus:border-[#6D213C]" /></label>
                <div className="grid md:grid-cols-2 gap-4"><label className="block"><span className="text-sm font-semibold">City / Area *</span><input value={form.city} onChange={set("city")} className="mt-2 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 outline-none focus:border-[#6D213C]" /></label><label className="block"><span className="text-sm font-semibold">State *</span><select value={form.state} onChange={set("state")} className="mt-2 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 bg-white"><option value="">Select state</option>{states.map((state) => <option key={state}>{state}</option>)}</select></label></div>
                <label className="block"><span className="text-sm font-semibold">Delivery note (optional)</span><textarea value={form.note} onChange={set("note")} rows={2} placeholder="Landmark or special instruction" className="mt-2 w-full rounded-xl border border-[#D6CDBE] px-4 py-3 outline-none focus:border-[#6D213C]" /></label>
              </div>
            </section>
          </div>
          <aside className="bg-white rounded-3xl border border-[#D6CDBE] p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-bold mb-5">Order summary</h2>
            <div className="space-y-4 max-h-105 overflow-auto">
              {items.map((item) => <div key={item.key} className="flex gap-3"><img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover bg-[#F3EEE7]" /><div className="flex-1"><p className="font-semibold text-sm">{item.title}</p>{item.color && <p className="text-xs text-gray-500">{item.color}</p>}<div className="flex items-center gap-2 mt-2"><button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-7 h-7 border rounded-lg flex items-center justify-center"><Minus size={13}/></button><span className="text-sm">{item.quantity}</span><button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-7 h-7 border rounded-lg flex items-center justify-center"><Plus size={13}/></button><button onClick={() => removeFromCart(item.key)} className="ml-auto text-gray-400"><Trash2 size={15}/></button></div></div><p className="font-bold text-sm">₦{(item.price * item.quantity).toLocaleString()}</p></div>)}
            </div>
            <div className="border-t mt-6 pt-5"><div className="flex justify-between text-lg font-bold"><span>Products total</span><span>₦{subtotal.toLocaleString()}</span></div><p className="text-xs text-gray-500 mt-2">Bolt delivery fee is separate and paid on delivery.</p></div>
            {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
            <button onClick={pay} disabled={loading} className="mt-5 w-full bg-[#6D213C] hover:bg-[#8B2D4F] disabled:opacity-60 text-white py-4 rounded-2xl font-bold">{loading ? "Preparing secure payment…" : `Pay ₦${subtotal.toLocaleString()}`}</button>
            <p className="text-[11px] text-gray-400 text-center mt-3">Secure payment powered by Paystack</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
