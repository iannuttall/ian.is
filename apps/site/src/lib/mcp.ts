import {
  McpServer,
  createMcpHandler,
  hostHeaderValidationResponse,
  originValidationResponse,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import { findDeveloperResources } from "./developer-resources.ts";

const allowedHosts = ["ian.is", "www.ian.is", "localhost", "127.0.0.1", "[::1]"];
const allowedOrigins = [
  "https://ian.is",
  "https://www.ian.is",
  "http://localhost",
  "http://127.0.0.1",
  "http://[::1]",
];

export function createIanMcpServer() {
  const server = new McpServer({
    name: "is.ian/site",
    title: "Ian Nuttall developer resources",
    version: "1.0.0",
  });

  server.registerTool(
    "ian_list_developer_resources",
    {
      title: "List Ian Nuttall developer resources",
      description:
        "List or search the public APIs, MCP servers, CLIs, agent skills, packages, and source repositories published by Ian Nuttall.",
      inputSchema: z.object({
        query: z
          .string()
          .max(100)
          .optional()
          .describe("Optional text to match against names, descriptions, and interface types."),
      }),
    },
    async ({ query }) => {
      const resources = findDeveloperResources(query);
      const result = { count: resources.length, resources };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    },
  );

  return server;
}

const mcpHandler = createMcpHandler(createIanMcpServer, {
  legacy: "stateless",
});

export function handleMcpRequest(request: Request) {
  const rejected =
    hostHeaderValidationResponse(request, allowedHosts) ??
    originValidationResponse(request, allowedOrigins);
  return rejected ?? mcpHandler.fetch(request);
}
