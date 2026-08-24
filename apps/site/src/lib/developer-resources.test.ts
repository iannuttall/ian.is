import assert from "node:assert/strict";
import test from "node:test";
import {
  developerResources,
  findDeveloperResources,
  getDeveloperResource,
} from "./developer-resources.ts";

test("developer resources have stable unique slugs and absolute links", () => {
  assert.equal(
    new Set(developerResources.map((resource) => resource.slug)).size,
    developerResources.length,
  );
  for (const resource of developerResources) {
    assert.doesNotThrow(() => new URL(resource.pageUrl));
    assert.ok(resource.interfaces.length > 0);
    assert.ok(resource.links.length > 0);
    for (const link of resource.links) assert.doesNotThrow(() => new URL(link.url));
  }
});

test("developer resources can be found by name, interface, or slug", () => {
  assert.equal(findDeveloperResources("MCP").some((item) => item.slug === "keep"), true);
  assert.deepEqual(findDeveloperResources("unclaimed").map((item) => item.slug), ["unclaimed"]);
  assert.equal(getDeveloperResource("ian-is")?.name, "ian.is");
  assert.equal(getDeveloperResource("missing"), undefined);
});
