import assert from "node:assert/strict";
import test from "node:test";
import { handleMcpRequest } from "./mcp.ts";

const headers = {
  accept: "application/json, text/event-stream",
  "content-type": "application/json",
  host: "ian.is",
};

async function mcpRequest(body: unknown) {
  return handleMcpRequest(
    new Request("https://ian.is/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
}

async function mcpJson(response: Response) {
  const text = await response.text();
  if (!response.headers.get("content-type")?.startsWith("text/event-stream")) {
    return JSON.parse(text);
  }

  const data = text
    .split("\n")
    .find((line) => line.startsWith("data: "))
    ?.slice("data: ".length);
  assert.ok(data, "MCP event stream must contain a JSON data event");
  return JSON.parse(data);
}

test("MCP initializes through Streamable HTTP", async () => {
  const response = await mcpRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "ian-is-test", version: "1.0.0" },
    },
  });
  const body = await mcpJson(response);

  assert.equal(response.status, 200);
  assert.equal(body.result.serverInfo.name, "is.ian/site");
  assert.equal(body.result.protocolVersion, "2025-11-25");
});

test("MCP lists and calls the developer resource tool", async () => {
  const listResponse = await mcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
  const list = await mcpJson(listResponse);
  assert.equal(list.result.tools[0].name, "ian_list_developer_resources");
  assert.ok(list.result.tools[0].description);
  assert.equal(list.result.tools[0].inputSchema.properties.query.maxLength, 100);

  const callResponse = await mcpRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "ian_list_developer_resources",
      arguments: { query: "unclaimed" },
    },
  });
  const call = await mcpJson(callResponse);
  assert.equal(call.result.structuredContent.count, 1);
  assert.equal(call.result.structuredContent.resources[0].slug, "unclaimed");
});
