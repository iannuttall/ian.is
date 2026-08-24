const markdownType = "text/markdown";

function mediaTypeQuality(range: string) {
  const [mediaType, ...parameters] = range.split(";");
  const quality = parameters
    .map((parameter) => parameter.trim().match(/^q=(0(?:\.\d+)?|1(?:\.0+)?)$/i)?.[1])
    .find(Boolean);

  return {
    mediaType: mediaType?.trim().toLowerCase(),
    quality: quality === undefined ? 1 : Number.parseFloat(quality),
  };
}

export function explicitlyAcceptsMarkdown(value: string | null) {
  if (!value) return false;

  return value
    .split(",")
    .map(mediaTypeQuality)
    .some((range) => range.mediaType === markdownType && range.quality > 0);
}

export function notFoundMarkdown(origin = "https://ian.is") {
  const baseUrl = new URL(origin);

  return `# Page not found

The requested page does not exist. Use one of these indexes to find the right page.

- [Site map](${new URL("/sitemap.xml", baseUrl)})
- [Agent index](${new URL("/llms.txt", baseUrl)})
- [Developer resources](${new URL("/developers.md", baseUrl)})
- [Contact Ian Nuttall](${new URL("/contact.md", baseUrl)})
`;
}

export function agentNotFoundResponse(
  request: Request,
  response: Response,
) {
  const contentType = response.headers.get("content-type") ?? "";
  const shouldReturnMarkdown =
    (request.method === "GET" || request.method === "HEAD") &&
    response.status === 404 &&
    contentType.toLowerCase().startsWith("text/html") &&
    explicitlyAcceptsMarkdown(request.headers.get("accept"));

  if (!shouldReturnMarkdown) return response;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("content-type", `${markdownType}; charset=utf-8`);
  headers.set("x-content-type-options", "nosniff");

  return new Response(
    request.method === "HEAD" ? null : notFoundMarkdown(new URL(request.url).origin),
    {
      status: 404,
      statusText: "Not Found",
      headers,
    },
  );
}
