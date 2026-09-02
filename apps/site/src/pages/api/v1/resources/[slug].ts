import type { APIContext } from "astro";
import { apiJson, apiProblem, methodNotAllowed } from "../../../../lib/api-response.ts";
import { getDeveloperResource } from "../../../../lib/developer-resources.ts";

export const prerender = false;

export function GET({ params, request }: APIContext) {
  const resource = getDeveloperResource(params.slug ?? "");
  if (!resource) {
    return apiProblem({
      status: 404,
      title: "Developer resource not found",
      code: "resource_not_found",
      message: `No public developer resource uses the slug "${params.slug ?? ""}".`,
      resolution:
        "GET /api/v1/resources to list the available resource slugs.",
      instance: new URL(request.url).pathname,
    });
  }

  return apiJson(resource, 200, {
    "cache-control": "public, max-age=300, must-revalidate",
  });
}

export function ALL({ request }: APIContext) {
  return methodNotAllowed(request, ["GET"]);
}
