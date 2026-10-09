import { useEffect, useMemo, useState } from "react";
import { Eye, LogOut, RefreshCw } from "lucide-react";

const STATUSES = [
  "awaiting_payment",
  "processing",
  "ready_for_delivery",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_LABELS = {
  awaiting_payment: "Awaiting payment",
  processing: "Processing",
  ready_for_delivery: "Ready for delivery",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;

export default function AdminOrdersPage() {
  const [token, setToken] = useState(
    () => localStorage.getItem("shopmk-admin-token") || "",
  );
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");

  async function load() {
    if (!token.trim()) {
      setError("Enter your admin token to view orders.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin-orders", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load orders");
      localStorage.setItem("shopmk-admin-token", token.trim());
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      if (err.message === "Unauthorized")
        localStorage.removeItem("shopmk-admin-token");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrder(id, orderStatus) {
    setSavingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin-orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ id, orderStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update order");
      setOrders((current) =>
        current.map((order) => (order.orderId === id ? data.order : order)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId("");
    }
  }

  function logout() {
    localStorage.removeItem("shopmk-admin-token");
    setToken("");
    setOrders([]);
    setSelectedId(null);
    setError("");
  }

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === "all" || order.orderStatus === filter;
      const searchable = [
        order.orderId,
        order.customer?.name,
        order.customer?.email,
        order.customer?.phone,
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [orders, filter, search]);

  const selectedOrder = orders.find((order) => order.orderId === selectedId);

  if (
    !token ||
    (!orders.length && error === "Enter your admin token to view orders.")
  ) {
    return (
      <LoginScreen
        token={token}
        setToken={setToken}
        load={load}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold">
              Shop MK Finds
            </p>
            <h1
              className="text-4xl font-bold mt-2 text-[#2C2C2A]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Order Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage customer orders and delivery status.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-[#D6CDBE] bg-white px-4 py-3 rounded-xl font-semibold text-sm disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-[#D6CDBE] bg-white px-4 py-3 rounded-xl font-semibold text-sm"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 mb-5 text-sm">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Total orders" value={orders.length} />
          <Stat
            label="Paid"
            value={orders.filter((o) => o.paymentStatus === "paid").length}
          />
          <Stat
            label="Shipped"
            value={orders.filter((o) => o.orderStatus === "shipped").length}
          />
          <Stat
            label="Delivered"
            value={orders.filter((o) => o.orderStatus === "delivered").length}
          />
        </section>

        <section className="bg-white border border-[#D6CDBE] rounded-2xl p-4 mb-5 flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, name, email or phone"
            className="flex-1 border border-[#D6CDBE] rounded-xl px-4 py-3 outline-none focus:border-[#6D213C]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-[#D6CDBE] rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </section>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.orderId}
              className="bg-white border border-[#D6CDBE] rounded-2xl p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-[#6D213C]">{order.orderId}</p>
                  <h2 className="font-semibold mt-1">
                    {order.customer?.name || "Customer"} · {money(order.amount)}
                  </h2>
                  <p className="text-sm text-gray-500 wrap-break-word">
                    {order.customer?.phone} · {order.customer?.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.delivery?.address}, {order.delivery?.city},{" "}
                    {order.delivery?.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {order.paymentStatus}
                  </span>
                  <select
                    value={order.orderStatus}
                    disabled={savingId === order.orderId}
                    onChange={(e) => updateOrder(order.orderId, e.target.value)}
                    className="border border-[#D6CDBE] rounded-xl px-3 py-2 bg-white text-sm"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setSelectedId(
                        selectedId === order.orderId ? null : order.orderId,
                      )
                    }
                    className="inline-flex items-center gap-2 border border-[#D6CDBE] rounded-xl px-3 py-2 text-sm font-semibold"
                  >
                    <Eye size={15} />{" "}
                    {selectedId === order.orderId ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              {selectedId === order.orderId && (
                <OrderDetails order={selectedOrder} />
              )}
            </article>
          ))}
          {!loading && !filteredOrders.length && (
            <div className="text-center text-gray-500 py-16">
              No matching orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ token, setToken, load, loading, error }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white border border-[#D6CDBE] rounded-3xl p-7 md:p-9 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6D213C] font-bold">
          Shop MK Finds
        </p>
        <h1
          className="text-3xl font-bold mt-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Admin orders
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Enter the private admin token you created in Netlify.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Admin token"
          className="mt-6 w-full border border-[#D6CDBE] rounded-xl px-4 py-3 outline-none focus:border-[#6D213C]"
        />
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3">
            {error}
          </p>
        )}
        <button
          onClick={load}
          disabled={loading}
          className="mt-4 w-full bg-[#6D213C] text-white py-3 rounded-xl font-bold disabled:opacity-60"
        >
          {loading ? "Loading orders…" : "Open dashboard"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-[#D6CDBE] rounded-2xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1 text-[#2C2C2A]">{value}</p>
    </div>
  );
}

function OrderDetails({ order }) {
  if (!order) return null;
  return (
    <div className="mt-5 pt-5 border-t border-[#EEE7DE] grid md:grid-cols-2 gap-6 text-sm">
      <div>
        <h3 className="font-bold mb-3">Items</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div
              key={`${order.orderId}-${item.slug}-${item.color}`}
              className="flex justify-between gap-4"
            >
              <span>
                {item.title}
                {item.color ? ` · ${item.color}` : ""} × {item.quantity}
              </span>
              <span className="font-semibold">{money(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Products total</span>
          <span>{money(order.amount)}</span>
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-3">Order information</h3>
        <p>
          <strong>Payment:</strong> {order.paymentStatus}
        </p>
        <p className="mt-1">
          <strong>Reference:</strong> {order.paymentReference || "—"}
        </p>
        <p className="mt-1">
          <strong>Delivery:</strong> {order.delivery?.method || "Bolt"} —{" "}
          {order.delivery?.feePayment || "Pay on delivery"}
        </p>
        <p className="mt-1">
          <strong>Note:</strong> {order.delivery?.note || "—"}
        </p>
        {order.paidAt && (
          <p className="mt-1">
            <strong>Paid:</strong> {new Date(order.paidAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
