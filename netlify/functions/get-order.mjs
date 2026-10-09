import { json, getOrder } from "./_lib.mjs";

export default async (event) => {
  if (event.httpMethod !== "GET") return json({ error: "Method not allowed" }, 405);
  const reference = event.queryStringParameters?.reference;
  if (!reference) return json({ error: "Missing payment reference" }, 400);
  try {
    const order = await getOrder(reference);
    if (!order) return json({ error: "Order not found" }, 404);
    return json({ order: { id: order.orderId, customer: { name: order.customer.name, email: order.customer.email }, items: order.items, amount: order.amount, currency: order.currency, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus, paymentReference: order.paymentReference, delivery: { city: order.delivery.city, state: order.delivery.state, method: order.delivery.method, feePayment: order.delivery.feePayment }, createdAt: order.createdAt } });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to retrieve order" }, 500);
  }
};
