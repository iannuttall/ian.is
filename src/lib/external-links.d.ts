export const externalLinkRef: "ian.is";

export function isExternalHref(href: string, site?: string): boolean;

export function withExternalLinkRef(href: string, site?: string): string;

export function externalLinkAttrs(
  href: string,
  site?: string,
): {
  href: string;
  target?: "_blank";
  rel?: "noopener";
};
