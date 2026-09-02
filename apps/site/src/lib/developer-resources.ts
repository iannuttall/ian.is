export const developerResourceLinkTypes = [
  "api",
  "documentation",
  "mcp",
  "package",
  "source",
  "website",
] as const;

export type DeveloperResourceLinkType =
  (typeof developerResourceLinkTypes)[number];

export type DeveloperResource = {
  slug: string;
  name: string;
  description: string;
  pageUrl: string;
  interfaces: string[];
  links: Array<{
    type: DeveloperResourceLinkType;
    url: string;
  }>;
};

export const developerResources: DeveloperResource[] = [
  {
    slug: "ian-is",
    name: "ian.is",
    description:
      "The public index for Ian Nuttall's products, writing, and developer resources.",
    pageUrl: "https://ian.is/developers",
    interfaces: ["API", "MCP", "Agent Skill"],
    links: [
      { type: "documentation", url: "https://ian.is/developers" },
      { type: "api", url: "https://ian.is/openapi.json" },
      { type: "mcp", url: "https://ian.is/server.json" },
      { type: "source", url: "https://github.com/iannuttall/ian.is" },
    ],
  },
  {
    slug: "keep",
    name: "Keep",
    description:
      "Shared project memory for agents through hosted MCP and a command-line client.",
    pageUrl: "https://ian.is/keep",
    interfaces: ["MCP", "CLI"],
    links: [
      { type: "documentation", url: "https://ian.is/keep" },
      { type: "website", url: "https://keep.md" },
    ],
  },
  {
    slug: "seo-skill",
    name: "SEO Skill",
    description:
      "Local SEO reports with structured evidence and stable finding IDs.",
    pageUrl: "https://ian.is/seo-skill",
    interfaces: ["MCP", "CLI", "Agent Skill"],
    links: [
      { type: "documentation", url: "https://ian.is/seo-skill" },
      { type: "website", url: "https://seoskill.dev" },
      { type: "source", url: "https://github.com/iannuttall/seo" },
    ],
  },
  {
    slug: "ilo",
    name: "ilo",
    description:
      "X performance reports for agents, scripts, and product integrations.",
    pageUrl: "https://ian.is/ilo",
    interfaces: ["MCP", "CLI", "API"],
    links: [
      { type: "documentation", url: "https://ian.is/ilo" },
      { type: "website", url: "https://ilo.so" },
      { type: "source", url: "https://github.com/iannuttall/ilo" },
    ],
  },
  {
    slug: "mailroom",
    name: "Mailroom",
    description:
      "Agent-assisted email reading, drafting, replies, and inbox operations.",
    pageUrl: "https://ian.is/mailroom",
    interfaces: ["MCP", "CLI", "TypeScript API"],
    links: [
      { type: "documentation", url: "https://ian.is/mailroom" },
      { type: "source", url: "https://github.com/iannuttall/mailroom" },
    ],
  },
  {
    slug: "caffeine",
    name: "Caffeine",
    description:
      "macOS wake controls with a CLI and Agent Watch for coding agents.",
    pageUrl: "https://ian.is/caffeine",
    interfaces: ["CLI", "Releases"],
    links: [
      { type: "documentation", url: "https://ian.is/caffeine" },
      { type: "source", url: "https://github.com/iannuttall/caffeine" },
      {
        type: "package",
        url: "https://github.com/iannuttall/caffeine/releases/latest",
      },
    ],
  },
  {
    slug: "unclaimed",
    name: "Unclaimed",
    description:
      "A published Node.js CLI for finding and tracking available single-word domains.",
    pageUrl: "https://ian.is/unclaimed",
    interfaces: ["CLI"],
    links: [
      { type: "documentation", url: "https://ian.is/unclaimed" },
      { type: "package", url: "https://www.npmjs.com/package/unclaimed" },
      { type: "source", url: "https://github.com/iannuttall/unclaimed" },
    ],
  },
];

export function findDeveloperResources(query?: string) {
  const normalized = query?.trim().toLocaleLowerCase("en-US");
  if (!normalized) return developerResources;

  return developerResources.filter((resource) =>
    [
      resource.slug,
      resource.name,
      resource.description,
      ...resource.interfaces,
    ]
      .join(" ")
      .toLocaleLowerCase("en-US")
      .includes(normalized),
  );
}

export function getDeveloperResource(slug: string) {
  return developerResources.find((resource) => resource.slug === slug);
}
