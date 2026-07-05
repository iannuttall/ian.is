export const externalLinkRef = "ian.is";

export function isExternalHref(href, site = "https://ian.is") {
  if (typeof href !== "string" || href.length === 0) {
    return false;
  }

  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) {
    return false;
  }

  let url;
  let siteUrl;

  try {
    url = new URL(href);
    siteUrl = new URL(site);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  return url.hostname !== siteUrl.hostname;
}

export function withExternalLinkRef(href, site = "https://ian.is") {
  if (!isExternalHref(href, site)) {
    return href;
  }

  const url = new URL(href);

  if (!url.searchParams.has("ref")) {
    url.searchParams.set("ref", externalLinkRef);
  }

  return url.toString();
}

export function externalLinkAttrs(href, site = "https://ian.is") {
  if (!isExternalHref(href, site)) {
    return { href };
  }

  return {
    href: withExternalLinkRef(href, site),
    target: "_blank",
    rel: "noopener",
  };
}
