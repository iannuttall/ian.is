import { handle } from "@astrojs/cloudflare/handler";

// Thin Worker entry: delegate everything to the Astro Cloudflare handler.
// www -> apex canonicalization is handled by a Cloudflare Redirect Rule, not
// here, so we never need `run_worker_first` in wrangler.jsonc.
export default {
  fetch(request, env, ctx) {
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
