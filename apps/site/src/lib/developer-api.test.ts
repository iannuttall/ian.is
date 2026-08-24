import assert from "node:assert/strict";
import test from "node:test";
import type { APIContext } from "astro";
import {
  ALL as unknownApiEndpoint,
} from "../pages/api/[...path].ts";
import {
  ALL as resourcesMethod,
  GET as listResources,
} from "../pages/api/v1/resources/index.ts";
import { GET as getResource } from "../pages/api/v1/resources/[slug].ts";

function context(url: string, init?: RequestInit, params = {}) {
  return {
    request: new Request(url, init),
    params,
  } as APIContext;
}

test("the resource API lists and filters typed developer resources", async () => {
  const all = await listResources(context("https://ian.is/api/v1/resources"));
  const allBody = (await all.json()) as { count: number };
  assert.equal(all.status, 200);
  assert.equal(allBody.count, 7);

  const filtered = await listResources(
    context("https://ian.is/api/v1/resources?query=unclaimed"),
  );
  const filteredBody = (await filtered.json()) as {
    count: number;
    resources: Array<{ slug: string }>;
  };
  assert.equal(filteredBody.count, 1);
  assert.equal(filteredBody.resources[0]?.slug, "unclaimed");
});

test("the resource API returns structured query and slug errors", async () => {
  const invalidQuery = await listResources(
    context(`https://ian.is/api/v1/resources?query=${"x".repeat(101)}`),
  );
  const invalidQueryBody = (await invalidQuery.json()) as { code: string };
  assert.equal(invalidQuery.status, 400);
  assert.equal(invalidQueryBody.code, "invalid_query");

  const missing = await getResource(
    context(
      "https://ian.is/api/v1/resources/missing",
      undefined,
      { slug: "missing" },
    ),
  );
  const missingBody = (await missing.json()) as { code: string; resolution: string };
  assert.equal(missing.status, 404);
  assert.equal(missingBody.code, "resource_not_found");
  assert.match(missingBody.resolution, /GET \/api\/v1\/resources/u);
});

test("the API returns JSON problems for unsupported methods and paths", async () => {
  const method = resourcesMethod(
    context("https://ian.is/api/v1/resources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  );
  const methodBody = (await method.json()) as { code: string };
  assert.equal(method.status, 405);
  assert.equal(methodBody.code, "method_not_allowed");

  const unknown = unknownApiEndpoint(
    context("https://ian.is/api/unknown"),
  );
  const unknownBody = (await unknown.json()) as { code: string; resolution: string };
  assert.equal(unknown.status, 404);
  assert.equal(unknownBody.code, "api_endpoint_not_found");
  assert.match(unknownBody.resolution, /openapi\.json/u);
});
