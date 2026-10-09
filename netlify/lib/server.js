const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function supabaseHeaders(extra = {}) {
  const key = required("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function db(path, options = {}) {
  const base = required("SUPABASE_URL").replace(/\/$/, "");
  const response = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: supabaseHeaders(options.headers || {}),
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = typeof data === "object" ? data?.message || data?.details || data?.hint : data;
    throw new Error(error || `Supabase request failed (${response.status})`);
  }
  return data;
}

async function getSanityProducts(slugs) {
  const projectId = process.env.SANITY_PROJECT_ID || "s13wiqvi";
  const dataset = process.env.SANITY_DATASET || "production";
  const query = '*[_type == "shopMkProduct" && slug.current in $slugs]{title, "slug": slug.current, price, "imageUrl": images[0].asset->url}';
  const url = new URL(`https://${projectId}.api.sanity.io/v2026-05-19/data/query/${dataset}`);
  url.searchParams.set("query", query);
  url.searchParams.set("$slugs", JSON.stringify(slugs));
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not validate products with the catalogue.");
  const data = await response.json();
  return data.result || [];
}

async function paystackRequest(path, options = {}) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${required("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Paystack request failed.");
  }
  return data.data;
}

async function sendOrderEmail(order) {
  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  if (!key || !domain || !from) {
    console.warn("Mailgun is not configured; order email was not sent.");
    return false;
  }

  const amount = Number(order.amount).toLocaleString("en-NG");
  const form = new URLSearchParams({
    from,
    to: order.customer.email,
    subject: `Shop MK Finds order confirmed — ${order.order_id}`,
    text: `Hi ${order.customer.name},\n\nYour payment has been confirmed and your order ${order.order_id} is received.\nProducts total: ₦${amount}.\n\nDelivery is arranged separately. Thank you for shopping with Shop MK Finds.`,
  });
  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  if (!response.ok) {
    console.error("Mailgun email failed:", await response.text());
    return false;
  }
  return true;
}

function mapOrder(row) {
  return {
    orderId: row.order_id,
    customer: row.customer,
    delivery: row.delivery,
    items: row.items,
    amount: Number(row.amount),
    paymentReference: row.payment_reference,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
  };
}

module.exports = { json, required, db, getSanityProducts, paystackRequest, sendOrderEmail, mapOrder };
