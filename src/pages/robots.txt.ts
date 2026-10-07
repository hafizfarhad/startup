import type { APIRoute } from "astro";
import { robotsTxt, siteConfig } from "../lib/config";

export const GET: APIRoute = () =>
  new Response(robotsTxt(siteConfig.siteUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
