import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const rows = (await getCollection("tools")).map((entry) => entry.data);
  return new Response(JSON.stringify(rows, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
