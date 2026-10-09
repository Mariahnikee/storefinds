import { json, getOrder, saveOrder, sendOrderEmail } from "./_lib.mjs";

export default async (requestOrEvent) => {
  const method = requestOrEvent?.method || requestOrEvent?.httpMethod;

  if (method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return json({ error: "Paystack is not configured" }, 500);
  }

  const reference = requestOrEvent?.url
    ? new URL(requestOrEvent.url).searchParams.get("reference")
    : requestOrEvent?.queryStringParameters?.reference;

  if (!reference) {
    return json({ error: "Missing payment reference" }, 400);
  }

  try {
    const order = await getOrder(reference);

    if (!order) {
      return json({ error: "Order not found" }, 404);
    }

    if (order.paymentStatus === "paid") {
      return json({ paid: true, order });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status || !data.data) {
      return json(
        { error: data.message || "Unable to verify payment" },
        400
      );
    }

    const payment = data.data;
    const expectedAmount = Number(order.amount) * 100;

    if (
      payment.status !== "success" ||
      Number(payment.amount) !== expectedAmount ||
      payment.currency !== "NGN"
    ) {
      return json({ paid: false, order });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.paidAt = order.paidAt || new Date().toISOString();
    order.paymentChannel = payment.channel || null;
    order.gatewayResponse = payment.gateway_response || null;
    order.customerCode = payment.customer?.customer_code || null;

    await saveOrder(order);
    await sendOrderEmail(order);

    return json({ paid: true, order });
  } catch (error) {
    console.error(error);
    return json({ error: "Payment verification failed" }, 500);
  }
};