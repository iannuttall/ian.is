export function withTrailingSlash(path: string) {
  if (path === "") return "/";
  const [pathname, suffix = ""] = path.split(/([?#].*)/, 2);
  if (!pathname || pathname === "/") return `/${suffix}`;
  return `${pathname.replace(/\/+$/, "")}/${suffix}`;
}

export function withoutTrailingSlash(path: string) {
  if (path === "/") return "/";
  const [pathname, suffix = ""] = path.split(/([?#].*)/, 2);
  return `${pathname.replace(/\/+$/, "")}${suffix}`;
}

