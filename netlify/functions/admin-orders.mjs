import {
  json,
  requireAdmin,
  sanityQuery,
  getOrder,
  saveOrder,
  sendShippingEmail,
} from "./_lib.mjs";

export default async (request) => {
  try {
    requireAdmin(request);

    if (request.method === "GET") {
      const orders = await sanityQuery(
        `*[_type == "shopMkOrder"] | order(createdAt desc)`
      );

      return json({ orders: orders || [] });
    }

    if (request.method === "PATCH") {
      const body = await request.json();

      if (!body.id || !body.orderStatus) {
        return json(
          { error: "id and orderStatus are required" },
          400
        );
      }

      const allowed = [
        "awaiting_payment",
        "processing",
        "ready_for_delivery",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowed.includes(body.orderStatus)) {
        return json({ error: "Invalid order status" }, 400);
      }

      const order = await getOrder(body.id);

      if (!order) {
        return json({ error: "Order not found" }, 404);
      }

      const previousStatus = order.orderStatus;

      const isNewShipment =
        body.orderStatus === "shipped" &&
        previousStatus !== "shipped";

      const shouldSendShippingEmail =
        isNewShipment && !order.shippingEmailSentAt;

      order.orderStatus = body.orderStatus;
      order.updatedAt = new Date().toISOString();

      if (body.deliveryFee !== undefined) {
        order.deliveryFee = Number(body.deliveryFee) || 0;
      }

      if (body.deliveryNote !== undefined) {
        order.delivery = order.delivery || {};
        order.delivery.note = String(body.deliveryNote);
      }

      // Save the order status first.
      await saveOrder(order);

      let shippingEmailSent = false;
      let shippingEmailError = null;

      if (shouldSendShippingEmail) {
        try {
          await sendShippingEmail(order);

          order.shippingEmailSentAt = new Date().toISOString();

          await saveOrder(order);

          shippingEmailSent = true;
        } catch (emailError) {
          console.error("Shipping email failed:", emailError);

          shippingEmailError =
            emailError?.message || "Could not send shipping email";
        }
      }

      return json({
        order,
        shippingEmailSent,
        ...(shippingEmailError
          ? { shippingEmailError }
          : {}),
      });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return json({ error: "Unauthorized" }, 401);
    }

    console.error(error);

    return json(
      { error: error.message || "Admin request failed" },
      500
    );
  }
};