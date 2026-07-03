import { siteDescription, siteName, siteUrl, toAbsoluteUrl } from "@/lib/site";

export type SeoBreadcrumbItem = {
  label: string;
  href?: string;
};

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description: siteDescription,
    url: siteUrl,
  };
}

export function webPageSchema(options: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "FAQPage";
}) {
  const url = toAbsoluteUrl(options.path);

  return {
    "@context": "https://schema.org",
    "@type": options.type ?? "WebPage",
    name: options.title,
    headline: options.title,
    description: options.description,
    url,
    mainEntityOfPage: url,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
  };
}

export function breadcrumbSchema(items: SeoBreadcrumbItem[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: toAbsoluteUrl(item.href ?? currentPath),
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

