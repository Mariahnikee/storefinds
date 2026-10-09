import { json, db, paystackRequest, sendOrderEmail, mapOrder } from "../lib/server.js";

export const handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  try {
    const reference = event.queryStringParameters?.reference;
    if (!reference || !/^[a-zA-Z0-9_-]{8,100}$/.test(reference)) return json(400, { error: "A valid payment reference is required." });
    const rows = await db(`orders?payment_reference=eq.${encodeURIComponent(reference)}&select=*`);
    const row = rows?.[0];
    if (!row) return json(404, { error: "Order not found for this payment reference." });
    if (row.payment_status !== "paid") {
      const payment = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
      const expectedKobo = Number(row.amount) * 100;
      if (payment.status === "success" && Number(payment.amount) === expectedKobo && payment.currency === "NGN" &&
          String(payment.customer?.email || "").toLowerCase() === String(row.customer.email).toLowerCase()) {
        const updated = await db(`orders?payment_reference=eq.${encodeURIComponent(reference)}`, {
          method: "PATCH", headers: { Prefer: "return=representation" },
          body: JSON.stringify({ payment_status: "paid", order_status: "processing", paid_at: new Date().toISOString() }),
        });
        const paidOrder = updated?.[0] || { ...row, payment_status: "paid", order_status: "processing" };
        const emailSent = await sendOrderEmail(paidOrder);
        if (emailSent) {
          await db(`orders?payment_reference=eq.${encodeURIComponent(reference)}`, {
            method: "PATCH", headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ confirmation_email_sent_at: new Date().toISOString() }),
          }).catch((error) => console.error("Could not record email status:", error));
        }
        return json(200, { paid: true, order: mapOrder(paidOrder), emailSent });
      }
    }
    return json(200, { paid: row.payment_status === "paid", order: mapOrder(row) });
  } catch (error) {
    console.error("verify-payment:", error);
    return json(500, { error: "We couldn't verify this payment yet. Please try again." });
  }
};
