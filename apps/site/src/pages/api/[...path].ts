import type { APIContext } from "astro";
import { apiProblem } from "../../lib/api-response.ts";

export const prerender = false;

export function ALL({ request }: APIContext) {
  const pathname = new URL(request.url).pathname;
  return apiProblem({
    status: 404,
    title: "API endpoint not found",
    code: "api_endpoint_not_found",
    message: `No public API endpoint exists at ${pathname}.`,
    resolution:
      "Read https://ian.is/openapi.json or GET https://ian.is/api/v1/resources to find a supported endpoint.",
    instance: pathname,
  });
}
