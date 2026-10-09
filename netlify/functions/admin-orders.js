const { json, required, db, mapOrder } = require("../lib/server.js");

function authorized(event) {
  const expected = process.env.ADMIN_TOKEN;
  const header = event.headers?.authorization || event.headers?.Authorization || "";
  return Boolean(expected && header === `Bearer ${expected}`);
}

exports.handler = async (event) => {
  if (!["GET", "PATCH"].includes(event.httpMethod)) return json(405, { error: "Method not allowed" });
  if (!authorized(event)) return json(401, { error: "Unauthorized" });
  try {
    if (event.httpMethod === "GET") {
      const rows = await db("orders?select=*&order=created_at.desc&limit=200");
      return json(200, { orders: (rows || []).map(mapOrder) });
    }

    const body = JSON.parse(event.body || "{}");
    const allowed = ["processing", "ready_for_delivery", "shipped", "delivered", "cancelled"];
    if (!body.id || !allowed.includes(body.orderStatus)) return json(400, { error: "Invalid order status update." });
    const rows = await db(`orders?order_id=eq.${encodeURIComponent(String(body.id))}&select=*`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ order_status: body.orderStatus }),
    });
    if (!rows?.length) return json(404, { error: "Order not found." });
    return json(200, { order: mapOrder(rows[0]) });
  } catch (error) {
    console.error("admin-orders:", error);
    return json(500, { error: "Unable to access orders right now." });
  }
};
