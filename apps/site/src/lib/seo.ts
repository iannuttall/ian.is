import { assembleGraph, buildPiece } from "@iannuttall/seo-graph-core";
import type {
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  Person,
  ProfilePage,
  QAPage,
  WebSite,
  WithContext,
} from "schema-dts";
import {
  personDescription,
  personProfiles,
  siteDescription,
  siteName,
  siteUrl,
  toAbsoluteUrl,
} from "@/lib/site";

export type SeoBreadcrumbItem = {
  label: string;
  href?: string;
};

const schemaIds = {
  person: `${siteUrl}/#person`,
  website: `${siteUrl}/#website`,
} as const;

function personEntity() {
  return buildPiece<Person>({
    "@id": schemaIds.person,
    "@type": "Person",
    name: siteName,
    alternateName: "@iannuttall",
    givenName: "Ian",
    familyName: "Nuttall",
    description: personDescription,
    url: siteUrl,
    sameAs: Object.values(personProfiles),
  });
}

function webSiteEntity() {
  return buildPiece<WebSite>({
    "@id": schemaIds.website,
    "@type": "WebSite",
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    inLanguage: "en",
    about: { "@id": schemaIds.person },
    creator: { "@id": schemaIds.person },
    publisher: { "@id": schemaIds.person },
  });
}

export function webSiteSchema() {
  return assembleGraph([personEntity(), webSiteEntity()]);
}

export function webPageSchema(options: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "FAQPage";
  mainEntity?: Record<string, unknown>;
}) {
  const url = toAbsoluteUrl(options.path);
  const pageId = `${url}#webpage`;

  return assembleGraph([
    personEntity(),
    webSiteEntity(),
    buildPiece({
      "@id": pageId,
      "@type": options.type ?? "WebPage",
      name: options.title,
      headline: options.title,
      description: options.description,
      url,
      inLanguage: "en",
      mainEntityOfPage: url,
      isPartOf: { "@id": schemaIds.website },
      about: { "@id": schemaIds.person },
      creator: { "@id": schemaIds.person },
      publisher: { "@id": schemaIds.person },
      ...(options.mainEntity ? { mainEntity: options.mainEntity } : {}),
    }),
  ]);
}

export function profilePageSchema(options: {
  title: string;
  description: string;
  path: string;
}) {
  const url = toAbsoluteUrl(options.path);

  return assembleGraph([
    personEntity(),
    webSiteEntity(),
    buildPiece<ProfilePage>({
      "@id": `${url}#profilepage`,
      "@type": "ProfilePage",
      name: options.title,
      headline: options.title,
      description: options.description,
      url,
      inLanguage: "en",
      isPartOf: { "@id": schemaIds.website },
      mainEntity: { "@id": schemaIds.person },
    }),
  ]);
}

export function blogPostingSchema(options: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  const url = toAbsoluteUrl(options.path);

  return assembleGraph([
    personEntity(),
    webSiteEntity(),
    buildPiece<BlogPosting>({
      "@id": `${url}#article`,
      "@type": "BlogPosting",
      headline: options.title,
      description: options.description,
      datePublished: options.datePublished,
      dateModified: options.dateModified,
      url,
      inLanguage: "en",
      mainEntityOfPage: url,
      isPartOf: { "@id": schemaIds.website },
      author: { "@id": schemaIds.person },
      publisher: { "@id": schemaIds.person },
    }),
  ]);
}

export function qaPageSchema(options: {
  question: string;
  context?: string;
  path: string;
  asked: string;
  answered: string;
  answerText: string;
}) {
  const url = toAbsoluteUrl(options.path);

  return assembleGraph([
    personEntity(),
    webSiteEntity(),
    buildPiece<QAPage>({
      "@id": `${url}#qapage`,
      "@type": "QAPage",
      url,
      inLanguage: "en",
      isPartOf: { "@id": schemaIds.website },
      mainEntity: {
        "@type": "Question",
        name: options.question,
        text: options.context ?? options.question,
        dateCreated: options.asked,
        answerCount: 1,
        acceptedAnswer: {
          "@type": "Answer",
          text: options.answerText,
          dateCreated: options.answered,
          url,
          author: { "@id": schemaIds.person },
        },
      },
    }),
  ]);
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
  } satisfies WithContext<BreadcrumbList>;
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
  } satisfies WithContext<FAQPage>;
}
