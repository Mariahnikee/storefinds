import { json, db, getSanityProducts, paystackRequest, mapOrder } from "../lib/server.js";
import crypto from "node:crypto";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = JSON.parse(event.body || "{}");
    const { items, customer, delivery } = body;
    if (!Array.isArray(items) || items.length === 0) return json(400, { error: "Your cart is empty." });
    if (!customer?.name || !/^\S+@\S+\.\S+$/.test(customer.email || "") || !customer?.phone ||
        !delivery?.address || !delivery?.city || !delivery?.state) {
      return json(400, { error: "Please provide valid customer and delivery details." });
    }
    if (items.length > 30) return json(400, { error: "Too many items in this order." });
    const normalized = items.map((item) => ({ slug: String(item.slug || "").trim(), quantity: Number(item.quantity), color: String(item.color || "").slice(0, 80) }));
    if (normalized.some((item) => !item.slug || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
      return json(400, { error: "One or more cart items are invalid." });
    }
    const slugs = [...new Set(normalized.map((item) => item.slug))];
    const products = await getSanityProducts(slugs);
    const productBySlug = new Map(products.map((product) => [product.slug, product]));
    if (slugs.some((slug) => !productBySlug.has(slug))) return json(400, { error: "A product is no longer available. Please refresh your cart." });
    const orderItems = normalized.map((item) => {
      const product = productBySlug.get(item.slug);
      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0) throw new Error("A product has an invalid price.");
      return { slug: item.slug, title: product.title, price, image: product.imageUrl || "", quantity: item.quantity, color: item.color };
    });
    const amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!Number.isSafeInteger(amount) || amount < 100) return json(400, { error: "The order total is invalid." });
    const orderId = `SMK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const reference = `smk_${crypto.randomUUID().replace(/-/g, "")}`;
    const orderRow = {
      order_id: orderId,
      customer: { name: String(customer.name).trim().slice(0, 120), email: String(customer.email).trim().toLowerCase(), phone: String(customer.phone).trim().slice(0, 40) },
      delivery: { address: String(delivery.address).trim().slice(0, 500), city: String(delivery.city).trim().slice(0, 120), state: String(delivery.state).trim().slice(0, 100), note: String(delivery.note || "").trim().slice(0, 500) },
      items: orderItems, amount, payment_reference: reference, payment_status: "pending", order_status: "awaiting_payment",
    };
    const saved = await db("orders", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(orderRow) });
    const order = saved?.[0];
    try {
      const siteUrl = (process.env.SITE_URL || "http://localhost:8888").replace(/\/$/, "");
      const payment = await paystackRequest("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({ email: orderRow.customer.email, amount: amount * 100, reference, callback_url: `${siteUrl}/order-success`, metadata: { order_id: orderId, customer_name: orderRow.customer.name } }),
      });
      return json(200, { authorizationUrl: payment.authorization_url, reference, order: order ? mapOrder(order) : null });
    } catch (paymentError) {
      await db(`orders?order_id=eq.${encodeURIComponent(orderId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ payment_status: "initialization_failed" }) }).catch(() => {});
      throw paymentError;
    }
  } catch (error) {
    console.error("create-payment:", error);
    return json(500, { error: "We couldn't start checkout. Please try again shortly." });
  }
};
