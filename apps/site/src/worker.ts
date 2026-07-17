import { handle } from "@astrojs/cloudflare/handler";

// Thin Worker entry: delegate everything to the Astro Cloudflare handler.
// www -> apex canonicalization is handled by a Cloudflare Redirect Rule, and
// Accept: text/markdown negotiation is a Cloudflare Transform Rule rewriting
// to the prebuilt static .md twins — the Worker never runs for static asset
// traffic, so bot volume costs nothing.
export default {
  fetch(request, env, ctx) {
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
