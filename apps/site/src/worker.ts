import { handle } from "@astrojs/cloudflare/handler";
import { createCloudflareMarkdownHandler } from "@iannuttall/seo-graph-astro/cloudflare";

// www -> apex canonicalization is handled by a Cloudflare Redirect Rule, not
// here. Static assets run through the markdown handler (requires
// `run_worker_first` in wrangler.jsonc) so agents get `Accept: text/markdown`
// negotiation and prebuilt .md twins at canonical URLs; SSR/API routes go
// straight to the Astro handler.
const markdown = createCloudflareMarkdownHandler({
  site: "https://ian.is",
  canonicalHosts: ["ian.is", "www.ian.is"],
  contentSignal: "search=yes, ai-input=yes, ai-train=yes",
});

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    // SSR/API routes and every non-GET request go to Astro. This includes
    // the adapter's build-time prerender protocol, which is POST-based.
    if (
      url.pathname.startsWith("/api/") ||
      (request.method !== "GET" && request.method !== "HEAD")
    ) {
      return handle(request, env, ctx);
    }
    return markdown(request, env.ASSETS);
  },
} satisfies ExportedHandler<Env>;
