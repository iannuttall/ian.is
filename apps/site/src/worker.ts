import { handle } from "@astrojs/cloudflare/handler";
import { agentNotFoundResponse } from "@/lib/agent-not-found";

// Known assets still bypass this Worker. Missing paths reach Astro, then this
// wrapper gives explicit Markdown requests a small recovery document.
// www -> apex canonicalization is handled by a Cloudflare Redirect Rule, and
// Accept: text/markdown negotiation is a Cloudflare Transform Rule rewriting
// to the prebuilt static .md twins — the Worker never runs for static asset
// traffic, so normal bot volume costs nothing.
export default {
  async fetch(request, env, ctx) {
    const response = await handle(request, env, ctx);
    return agentNotFoundResponse(request, response);
  },
} satisfies ExportedHandler<Env>;
