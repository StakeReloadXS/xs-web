const CANONICAL_HOST = "stakereloadxs.com";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Keep Cloudflare preview deployments usable, but normalize every public
  // StakeReloadXS hostname/protocol to one canonical HTTPS origin.
  const isPublicHost =
    url.hostname === CANONICAL_HOST ||
    url.hostname === `www.${CANONICAL_HOST}`;

  if (isPublicHost && (url.hostname !== CANONICAL_HOST || url.protocol !== "https:")) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  const response = await context.next();
  const headers = new Headers(response.headers);

  // Social crawlers revalidate HTML while immutable versioned OG assets can
  // be cached aggressively. Avoid crawler-specific rendering entirely.
  if (url.pathname.startsWith("/assets/og/")) {
    headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    headers.set("X-Content-Type-Options", "nosniff");
  } else if ((headers.get("content-type") || "").includes("text/html")) {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
