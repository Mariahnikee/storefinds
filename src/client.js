import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "s13wiqvi",
  dataset: "production",
  useCdn: false,
  apiVersion: "2026-05-19",
});

export default client;
