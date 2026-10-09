import { json } from "./_lib.mjs";

export default async () => json({ ok: true, service: "storefinds-api", timestamp: new Date().toISOString() });
