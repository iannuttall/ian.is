import assert from "node:assert/strict";
import test from "node:test";
import { apiProblem, methodNotAllowed } from "./api-response.ts";

test("API problems include a code, message, and resolution hint", async () => {
  const response = apiProblem({
    status: 404,
    title: "Not found",
    code: "resource_not_found",
    message: "The resource does not exist.",
    resolution: "List resources and choose a valid slug.",
    instance: "/api/v1/resources/missing",
  });
  const body = (await response.json()) as {
    code: string;
    message: string;
    resolution: string;
  };

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("content-type"), "application/problem+json; charset=utf-8");
  assert.equal(body.code, "resource_not_found");
  assert.equal(body.message, "The resource does not exist.");
  assert.equal(body.resolution, "List resources and choose a valid slug.");
});

test("method errors name the allowed methods", async () => {
  const response = methodNotAllowed(
    new Request("https://ian.is/api/v1/resources", { method: "POST" }),
    ["GET"],
  );
  const body = (await response.json()) as {
    code: string;
    resolution: string;
  };

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
  assert.equal(body.code, "method_not_allowed");
  assert.match(body.resolution, /GET/u);
});
