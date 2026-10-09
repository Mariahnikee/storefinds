import crypto from "node:crypto";
import { json, getOrder, saveOrder, sendOrderEmail } from "./_lib.mjs";

export default async (event) => {
  if (event.httpMethod !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.PAYSTACK_SECRET_KEY) return json({ error: "Paystack is not configured" }, 500);
  try {
    const signature = event.headers?.["x-paystack-signature"] || event.headers?.["X-Paystack-Signature"];
    const rawBody = event.body || "";
    const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
    if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return json({ error: "Invalid signature" }, 401);

    const payload = JSON.parse(rawBody);
    if (payload.event !== "charge.success") return json({ received: true });
    const data = payload.data || {};
    const reference = data.reference;
    if (!reference) return json({ received: true });

    const order = await getOrder(reference);
    if (!order || order.paymentStatus === "paid") return json({ received: true });
    const expectedAmount = Number(order.amount) * 100;
    if (Number(data.amount) !== expectedAmount || data.currency !== "NGN") return json({ error: "Payment validation failed" }, 400);

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.paidAt = new Date().toISOString();
    order.paymentChannel = data.channel || null;
    order.gatewayResponse = data.gateway_response || null;
    order.customerCode = data.customer?.customer_code || null;
    await saveOrder(order);
    await sendOrderEmail(order);
    return json({ received: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Webhook processing failed" }, 500);
  }
};
