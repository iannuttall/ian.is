export const siteName = "Ian Nuttall";
export const siteUrl = "https://ian.is";
// Canonical apex host. www -> apex redirect is handled by a Cloudflare Redirect
// Rule, never in the Worker (so we avoid `run_worker_first`).
export const canonicalHost = "ian.is";
export const personDescription =
  "Ian Nuttall is a British marketer, software engineer and entrepreneur with over 20 years of experience building internet businesses and AI tools.";
export const siteDescription =
  "The personal site of Ian Nuttall, a British marketer, software engineer and entrepreneur.";
export const personProfiles = {
  github: "https://github.com/iannuttall",
  linkedin: "https://www.linkedin.com/in/iannuttall",
  x: "https://x.com/iannuttall",
  youtube: "https://www.youtube.com/@iannuttall",
} as const;
export const ogImageServiceUrl = "https://og.ian.is/";
export const clickySiteId = "101414716";
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
