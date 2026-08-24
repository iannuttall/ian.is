import type { APIContext } from "astro";
import { apiJson, apiProblem, methodNotAllowed } from "../../../../lib/api-response.ts";
import { findDeveloperResources } from "../../../../lib/developer-resources.ts";

export const prerender = false;

export function GET({ request }: APIContext) {
  const query = new URL(request.url).searchParams.get("query")?.trim();
  if (query && query.length > 100) {
    return apiProblem({
      status: 400,
      title: "Invalid query",
      code: "invalid_query",
      message: "The query must be 100 characters or fewer.",
      resolution: "Shorten the query and send the request again.",
      instance: new URL(request.url).pathname,
    });
  }

  const resources = findDeveloperResources(query);
  return apiJson(
    {
      name: "Ian Nuttall developer resources",
      description:
        "Public APIs, MCP servers, CLIs, agent skills, packages, and source repositories published by Ian Nuttall.",
      count: resources.length,
      resources,
    },
    200,
    { "cache-control": "public, max-age=300, must-revalidate" },
  );
}

export function ALL({ request }: APIContext) {
  return methodNotAllowed(request, ["GET"]);
}
