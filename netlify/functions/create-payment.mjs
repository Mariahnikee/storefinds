import { json, makeOrderId, sanityQuery, saveOrder } from "./_lib.mjs";

export default async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.PAYSTACK_SECRET_KEY) return json({ error: "Paystack is not configured" }, 500);
  try {
    const body = await request.json();
    const { items, customer, delivery } = body;
    if (!Array.isArray(items) || !items.length) throw new Error("Your cart is empty");
    if (!customer?.name || !customer?.email || !customer?.phone) throw new Error("Complete your contact details");
    if (!delivery?.address || !delivery?.city || !delivery?.state) throw new Error("Complete your delivery address");

    const slugs = [...new Set(items.map((item) => item.slug).filter(Boolean))];
    const products = await sanityQuery(`*[_type == "shopMkProduct" && slug.current in $slugs]{title, "slug": slug.current, price, "image": images[0].asset->url}`, { slugs });
    const productMap = new Map((products || []).map((product) => [product.slug, product]));
    const normalizedItems = [];
    let amount = 0;

    for (const item of items) {
      const product = productMap.get(item.slug);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("One or more products in your cart are invalid");
      const lineTotal = Number(product.price) * quantity;
      amount += lineTotal;
      normalizedItems.push({ slug: product.slug, title: product.title, price: Number(product.price), quantity, color: item.color || "", image: product.image || "", lineTotal });
    }

    const order = {
      orderId: makeOrderId(),
      customer: { name: String(customer.name).trim(), email: String(customer.email).trim().toLowerCase(), phone: String(customer.phone).trim() },
      delivery: { address: String(delivery.address).trim(), city: String(delivery.city).trim(), state: String(delivery.state).trim(), note: String(delivery.note || "").trim(), method: "Bolt", feePayment: "Pay on delivery" },
      items: normalizedItems, amount, currency: "NGN", paymentStatus: "pending", orderStatus: "awaiting_payment", paymentReference: null, createdAt: new Date().toISOString(),
    };

    await saveOrder(order);
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: order.customer.email, amount: amount * 100, currency: "NGN", reference: order.orderId, callback_url: `${process.env.SITE_URL || "https://storefinds.store"}/order-success`, metadata: { orderId: order.orderId, customerName: order.customer.name, phone: order.customer.phone } }),
    });
    const paymentData = await paystackResponse.json();
    if (!paystackResponse.ok || !paymentData.status) throw new Error(paymentData.message || "Could not initialize payment");

    order.paymentReference = paymentData.data.reference;
    await saveOrder(order);
    return json({ authorizationUrl: paymentData.data.authorization_url, reference: paymentData.data.reference, orderId: order.orderId });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || "Unable to start payment" }, 400);
  }
};
