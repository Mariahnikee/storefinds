export const SANITY_PROJECT = "s13wiqvi";
export const SANITY_DATASET = "production";
export const SANITY_API_VERSION = "2026-05-19";
export const SANITY_QUERY_API = `https://${SANITY_PROJECT}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
export const SANITY_MUTATION_API = `https://${SANITY_PROJECT}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`;

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export async function readJson(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export function makeOrderId() {
  return `SMK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function requireAdmin(request) {
  const expected = process.env.ADMIN_TOKEN;
  const authorization =
    typeof request.headers?.get === "function"
      ? request.headers.get("authorization")
      : request.headers?.authorization;
  const supplied = authorization?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied || supplied !== expected)
    throw new Error("Unauthorized");
}

export async function sanityQuery(query, params = {}) {
  const url = new URL(SANITY_QUERY_API);
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error)
    throw new Error(data.error?.description || "Sanity query failed");
  return data.result;
}

export async function sanityMutate(mutations) {
  if (!process.env.SANITY_WRITE_TOKEN)
    throw new Error("SANITY_WRITE_TOKEN is not configured");
  const response = await fetch(SANITY_MUTATION_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  const data = await response.json();
  if (!response.ok || data.error)
    throw new Error(data.error?.description || "Sanity mutation failed");
  return data;
}

export async function getOrder(id) {
  return sanityQuery(`*[_type == "shopMkOrder" && orderId == $id][0]`, { id });
}

export async function saveOrder(order) {
  return sanityMutate([
    {
      createOrReplace: {
        _id: `shopmkOrder-${order.orderId}`,
        _type: "shopMkOrder",
        ...order,
      },
    },
  ]);
}

export async function sendOrderEmail(order) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const lines = order.items
    .map(
      (item) =>
        `${item.title}${item.color ? ` (${item.color})` : ""} × ${item.quantity} — ₦${item.lineTotal.toLocaleString()}`,
    )
    .join("\n");
  const html = `<h2>New Shop MK Finds order ${order.orderId}</h2><p><strong>Customer:</strong> ${escapeHtml(order.customer.name)}</p><p><strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p><p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p><p><strong>Address:</strong> ${escapeHtml(order.delivery.address)}, ${escapeHtml(order.delivery.city)}, ${escapeHtml(order.delivery.state)}</p><p><strong>Delivery:</strong> Bolt — customer pays delivery separately on delivery.</p><h3>Items</h3><pre>${escapeHtml(lines)}</pre><p><strong>Products total:</strong> ₦${Number(order.amount).toLocaleString()}</p><p><strong>Payment status:</strong> ${escapeHtml(order.paymentStatus)}</p><p><strong>Paystack reference:</strong> ${escapeHtml(order.paymentReference || "—")}</p>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.ORDER_FROM_EMAIL || "Shop MK Finds <onboarding@resend.dev>",
      to: [process.env.ORDER_EMAIL || "storefinds@gmail.com"],
      subject: `New paid order ${order.orderId}`,
      html,
    }),
  });
  if (!response.ok) console.error("Resend error", await response.text());
  return { skipped: false };
}

export async function sendShippingEmail(order) {
  if (!process.env.RESEND_API_KEY)
    throw new Error("RESEND_API_KEY is not configured");
  if (!order.customer?.email)
    throw new Error("Customer email is missing for this order");

  const customerName = escapeHtml(order.customer.name || "there");
  const orderId = escapeHtml(order.orderId);
  const address = [
    order.delivery?.address,
    order.delivery?.city,
    order.delivery?.state,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(", ");

  const itemRows = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee7de;font-size:14px;color:#2c2c2a;">
        ${escapeHtml(item.title)}${item.color ? ` · ${escapeHtml(item.color)}` : ""}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #eee7de;font-size:14px;color:#7a7570;text-align:center;">${Number(item.quantity || 0)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eee7de;font-size:14px;color:#2c2c2a;text-align:right;">₦${Number(item.lineTotal || 0).toLocaleString()}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f0eb;font-family:Arial,Helvetica,sans-serif;color:#2c2c2a;">
    <div style="padding:32px 16px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eee7de;">
        <div style="background:#6d213c;padding:26px 28px;text-align:center;">
          <img src="https://storefinds.store/logo.png" alt="Shop MK Finds" style="max-width:150px;height:auto;display:inline-block;">
        </div>

        <div style="padding:34px 28px;">
          <p style="margin:0 0 8px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#8b2d4f;font-weight:700;">Order update</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;color:#2c2c2a;">Your order is on its way! 🚚</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5f5a56;">Hi ${customerName}, your Shop MK Finds order <strong>${orderId}</strong> has been shipped and is now on its way to you.</p>

          <div style="background:#f5e8ee;border-radius:12px;padding:18px 18px;margin-bottom:24px;">
            <p style="margin:0 0 7px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#8b2d4f;font-weight:700;">Delivery details</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#2c2c2a;"><strong>Address:</strong> ${address || "—"}</p>
            <p style="margin:5px 0 0;font-size:14px;color:#2c2c2a;"><strong>Phone:</strong> ${escapeHtml(order.customer.phone || "—")}</p>
          </div>

          <h2 style="font-size:17px;margin:0 0 10px;color:#2c2c2a;">Items in this order</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:9px 0;border-bottom:1px solid #d6cdbe;text-align:left;font-size:12px;color:#7a7570;text-transform:uppercase;">Item</th>
                <th style="padding:9px 0;border-bottom:1px solid #d6cdbe;text-align:center;font-size:12px;color:#7a7570;text-transform:uppercase;">Qty</th>
                <th style="padding:9px 0;border-bottom:1px solid #d6cdbe;text-align:right;font-size:12px;color:#7a7570;text-transform:uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="padding-top:16px;text-align:right;">
            <span style="font-size:14px;color:#7a7570;">Products total</span>
            <strong style="font-size:18px;color:#6d213c;margin-left:8px;">₦${Number(order.amount || 0).toLocaleString()}</strong>
          </div>

          <div style="margin-top:28px;padding-top:22px;border-top:1px solid #eee7de;">
           <p style="margin:0;font-size:14px;line-height:1.7;color:#5f5a56;">
  Our delivery team will contact you before arrival. Please keep your phone available.
  <br />
  <strong>Please note: Bolt delivery fee is separate and will be paid on delivery.</strong>
</p>
          </div>
        </div>

        <div style="background:#faf7f2;padding:22px 28px;text-align:center;border-top:1px solid #eee7de;">
          <p style="margin:0 0 5px;font-size:14px;font-weight:700;color:#6d213c;">Shop MK Finds</p>
          <p style="margin:0;font-size:12px;color:#7a7570;">Simple Finds, Better Living.</p>
          <p style="margin:12px 0 0;font-size:12px;color:#7a7570;">Need help? Reply to this email or contact us at storefinds@gmail.com</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Shop MK Finds <orders@storefinds.store>",
      to: [order.customer.email],
      reply_to: "storefinds@gmail.com",
      subject: `Your Order #${order.orderId} Has Shipped! 🚚`,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Shipping email Resend error", details);
    throw new Error("Could not send shipping email");
  }

  return { sent: true };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
