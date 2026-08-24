type ProblemOptions = {
  status: number;
  title: string;
  code: string;
  message: string;
  resolution: string;
  instance: string;
  headers?: HeadersInit;
};

const publicJsonHeaders = {
  "access-control-allow-origin": "*",
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

export function apiJson(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...publicJsonHeaders,
      ...Object.fromEntries(new Headers(headers)),
    },
  });
}

export function apiProblem(options: ProblemOptions) {
  return new Response(
    JSON.stringify({
      type: `https://ian.is/developers/errors/${options.code}`,
      title: options.title,
      status: options.status,
      detail: options.message,
      instance: options.instance,
      code: options.code,
      message: options.message,
      resolution: options.resolution,
    }),
    {
      status: options.status,
      headers: {
        ...publicJsonHeaders,
        "content-type": "application/problem+json; charset=utf-8",
        ...Object.fromEntries(new Headers(options.headers)),
      },
    },
  );
}

export function methodNotAllowed(request: Request, allowed: string[]) {
  return apiProblem({
    status: 405,
    title: "Method not allowed",
    code: "method_not_allowed",
    message: `${request.method} is not supported for this endpoint.`,
    resolution: `Use one of these methods: ${allowed.join(", ")}.`,
    instance: new URL(request.url).pathname,
    headers: { allow: allowed.join(", ") },
  });
}
