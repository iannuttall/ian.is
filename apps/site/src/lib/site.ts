export const siteName = "Ian Nuttall";
export const siteUrl = "https://ian.is";
// Canonical apex host. www -> apex redirect is handled by a Cloudflare Redirect
// Rule, never in the Worker (so we avoid `run_worker_first`).
export const canonicalHost = "ian.is";
export const siteDescription = "Notes, tools, and experiments with SEO and AI.";
export const ogImageServiceUrl = "https://og.ian.is/";
export const clickySiteId = "";
export const googleAnalyticsId = "";
export const adsenseClientId = "";

export function toAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function toOgImageUrl(canonicalUrl: string, imagePath?: string) {
  if (imagePath) {
    return new URL(imagePath, siteUrl).toString();
  }

  const url = new URL(ogImageServiceUrl);
  url.searchParams.set("url", canonicalUrl);
  return url.toString();
}
