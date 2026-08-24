import assert from "node:assert/strict";
import test from "node:test";
import {
  agentNotFoundResponse,
  explicitlyAcceptsMarkdown,
  notFoundMarkdown,
} from "./agent-not-found.ts";

test("only an explicit positive Markdown media range selects Markdown", () => {
  assert.equal(explicitlyAcceptsMarkdown("text/markdown"), true);
  assert.equal(explicitlyAcceptsMarkdown("text/html, text/markdown;q=0.8"), true);
  assert.equal(explicitlyAcceptsMarkdown("text/markdown;q=0"), false);
  assert.equal(explicitlyAcceptsMarkdown("text/html, */*"), false);
  assert.equal(explicitlyAcceptsMarkdown(null), false);
});

test("a missing HTML page becomes a Markdown 404 with recovery links", async () => {
  const request = new Request("https://ian.is/missing", {
    headers: { accept: "text/markdown" },
  });
  const response = agentNotFoundResponse(
    request,
    new Response("<h1>Page not found</h1>", {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
  );

  assert.equal(response.status, 404);
  assert.equal(response.statusText, "Not Found");
  assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.equal(await response.text(), notFoundMarkdown("https://ian.is"));
  assert.match(notFoundMarkdown(), /\[Site map\]\(https:\/\/ian\.is\/sitemap\.xml\)/);
  assert.match(notFoundMarkdown(), /\[Agent index\]\(https:\/\/ian\.is\/llms\.txt\)/);
});

test("HTML, JSON, and successful responses keep their original body", async () => {
  const html = new Response("<h1>Page not found</h1>", {
    status: 404,
    headers: { "content-type": "text/html" },
  });
  const json = new Response('{"error":"Not found"}', {
    status: 404,
    headers: { "content-type": "application/json" },
  });
  const page = new Response("<h1>Ian Nuttall</h1>", {
    status: 200,
    headers: { "content-type": "text/html" },
  });

  assert.equal(
    agentNotFoundResponse(new Request("https://ian.is/missing"), html),
    html,
  );
  assert.equal(
    agentNotFoundResponse(
      new Request("https://ian.is/api/missing", {
        headers: { accept: "text/markdown" },
      }),
      json,
    ),
    json,
  );
  assert.equal(
    agentNotFoundResponse(
      new Request("https://ian.is/", {
        headers: { accept: "text/markdown" },
      }),
      page,
    ),
    page,
  );
});
