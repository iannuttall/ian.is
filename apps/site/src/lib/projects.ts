export type ProjectFaq = {
  question: string;
  answer: string;
};

export type ProjectPage = {
  slug: string;
  name: string;
  repo?: string;
  websiteUrl?: string;
  primaryAction: {
    label: string;
    href: string;
    kind: "download" | "website";
  };
  primaryDetail?: string;
  platform: string;
  license: string;
  accent: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  detailHeading: string;
  details: Array<{ title: string; description: string }>;
  closing: string;
  faqs: ProjectFaq[];
};

export const projectPages: ProjectPage[] = [
  {
    slug: "keep",
    name: "Keep",
    websiteUrl: "https://keep.md",
    primaryAction: {
      label: "Open Keep",
      href: "https://keep.md",
      kind: "website",
    },
    primaryDetail: "Web, MCP and CLI",
    platform: "Web, MCP and CLI",
    license: "Starter and Pro",
    accent: "#f97316",
    title: "Keep anything as Markdown",
    description:
      "Keep puts decisions, handoffs, plans, context, and saved source material in one shared library that local and cloud agents can search.",
    metaTitle: "Keep: shared memory for Claude Code, Codex and AI agents",
    metaDescription:
      "Keep gives Claude Code, Codex and other AI agents shared project notes, session handoffs, source material, semantic search, MCP access and a CLI.",
    detailHeading: "Shared context that survives the end of a session",
    details: [
      {
        title: "Memory follows the project",
        description:
          "Session hooks load the latest project notes when work starts, even when you switch agent, machine, or repository.",
      },
      {
        title: "Every change has a history",
        description:
          "Notes keep named revisions from people and agents, so you can inspect a change, compare versions, or restore an earlier one.",
      },
      {
        title: "Saved sources stay attached",
        description:
          "Articles, videos, threads, feeds, repositories, and uploads arrive as searchable markdown that an agent can cite in its answer.",
      },
      {
        title: "Your library can leave with you",
        description:
          "A full markdown export turns the library into ordinary files you can keep, search, and move wherever you want.",
      },
    ],
    closing: "Give every agent the context the last one left behind.",
    faqs: [
      {
        question: "What does Keep remember?",
        answer:
          "Keep stores project notes, decisions, plans, todos, and session handoffs beside the articles, videos, threads, feeds, repositories, and files you save.",
      },
      {
        question: "Which AI agents work with Keep?",
        answer:
          "Keep connects to Claude Code, Codex, Cursor, OpenCode, Pi, and other MCP clients. The CLI gives terminals and scripts access to the same library.",
      },
      {
        question: "Can I export everything?",
        answer:
          "Yes. Keep exports the whole library as plain markdown files, including the source material and notes you created around it.",
      },
    ],
  },
  {
    slug: "seo-skill",
    name: "SEO Skill",
    repo: "iannuttall/seo",
    websiteUrl: "https://seoskill.dev",
    primaryAction: {
      label: "Open SEO Skill",
      href: "https://seoskill.dev",
      kind: "website",
    },
    platform: "Node 22+",
    license: "Apache 2.0",
    accent: "#356ae6",
    title: "Run SEO audits your agent can actually act on",
    description:
      "One local command turns crawl data, Search Console, Analytics, and keyword research into clear work with evidence behind it.",
    metaTitle: "SEO Skill for AI agents and local SEO audits",
    metaDescription:
      "A local SEO CLI, MCP server, and agent skill for technical audits, Search Console analysis, competitor research, and evidence-backed fixes.",
    detailHeading: "Local-first SEO work without another dashboard",
    details: [
      {
        title: "Research is optional",
        description:
          "DataForSEO, Semrush, and Ahrefs can add market estimates when they would change a decision. The main audit works without them.",
      },
      {
        title: "Agents discover tools as needed",
        description:
          "One short skill routes an agent to the right report instead of loading a long catalog into every context window.",
      },
      {
        title: "Profiles and tokens stay local",
        description:
          "Project profiles, connected-service tokens, reports, and caches live on your machine, not in someone else's dashboard.",
      },
      {
        title: "Limits travel with the result",
        description:
          "When a source is rate-limited or partially available, the report records that beside the data it did return.",
      },
    ],
    closing:
      "Audit the site, rank the work, and give your agent evidence it can use.",
    faqs: [
      {
        question: "Do I need Search Console to start?",
        answer:
          "No. <code>seo report --url</code> starts with a local technical crawl. Connect Search Console when you want query, position, and landing-page evidence.",
      },
      {
        question: "Can I use it without an AI agent?",
        answer:
          "Yes. The normal CLI path gives people the same reports. MCP and JSON output expose that engine to agents and scripts.",
      },
      {
        question: "Where does the data go?",
        answer:
          "Project profiles, tokens, reports, and caches stay on your machine. The tool only calls the services you connect and records their limits with the result.",
      },
    ],
  },
  {
    slug: "swipe",
    name: "Swipe",
    repo: "iannuttall/swipe",
    websiteUrl: "https://swipe.md",
    primaryAction: {
      label: "Open Swipe",
      href: "https://swipe.md",
      kind: "website",
    },
    platform: "Web and email",
    license: "MIT",
    accent: "#8b5cf6",
    title: "Steal the AI ideas that are actually worth using",
    description:
      "A weekly collection of useful AI skills, prompts, tools, and workflows, with enough context to put each one to work.",
    metaTitle: "Swipe: useful AI skills, prompts, tools, and workflows",
    metaDescription:
      "A curated weekly collection of AI skills, prompts, tools, and workflows, with a searchable catalog and public issue archive.",
    detailHeading: "Curation for people who would rather build than scroll",
    details: [
      {
        title: "Selected by hand",
        description:
          "Items earn their place because they are useful, interesting, or teach a reusable way of working.",
      },
      {
        title: "Written for doing",
        description:
          "The note around each link tells you what it is and where it might save time. No breathless trend summary required.",
      },
      {
        title: "Tools remain discoverable",
        description:
          "The public catalog and issue archive make an old recommendation easy to find after the original email is gone.",
      },
      {
        title: "The publishing stack is open",
        description:
          "The site, archive, newsletter system, and operator tools are available in the public repository.",
      },
    ],
    closing: "One useful email a week beats another endless AI feed.",
    faqs: [
      {
        question: "How often does Swipe arrive?",
        answer:
          "Swipe is a weekly email. Published issues also stay in the public archive, so subscribing is useful but not required to read them.",
      },
      {
        question: "What gets included?",
        answer:
          "AI skills, prompts, tools, and workflows with a practical reason to use them. The goal is a short useful selection rather than a complete news digest.",
      },
      {
        question: "Can I browse without subscribing?",
        answer:
          'Yes. The tool catalog and published issue archive are public on <a href="https://swipe.md" target="_blank" rel="noreferrer">Swipe</a>.',
      },
    ],
  },
  {
    slug: "ilo",
    name: "ilo",
    repo: "iannuttall/ilo",
    websiteUrl: "https://ilo.so",
    primaryAction: {
      label: "Open ilo",
      href: "https://ilo.so",
      kind: "website",
    },
    platform: "MCP, CLI, API",
    license: "Open source",
    accent: "#ec4899",
    title: "Give your agent the context behind your best posts",
    description:
      "ilo studies public X account history and turns the patterns behind strong and weak posts into evidence your agent can use.",
    metaTitle: "ilo: X performance reports for AI agents",
    metaDescription:
      "Agent-first X performance reports across posts, topics, hooks, formats, timing, and audience response through MCP, CLI, and API.",
    detailHeading: "Performance context without another publishing tool",
    details: [
      {
        title: "ilo does not post for you",
        description:
          "It analyses account history. Publishing, scheduling, and rewriting remain in the tools you already use.",
      },
      {
        title: "Public data is enough",
        description:
          "Add the public handle you want to study. ilo does not need permission to take over the account.",
      },
      {
        title: "Reports carry the evidence",
        description:
          "Your agent gets the posts and patterns behind each finding instead of generic advice about posting more often.",
      },
      {
        title: "The web app stays small",
        description:
          "Account setup, billing, access, and status live on the web. The product work happens through MCP, CLI, and API.",
      },
    ],
    closing:
      "Let your next post start with the account history, not generic advice.",
    faqs: [
      {
        question: "Does ilo publish posts?",
        answer:
          "No. ilo analyses performance and gives your agent context. It does not publish, schedule, rewrite, or queue posts.",
      },
      {
        question: "Does ilo need access to my X account?",
        answer:
          "No. It works from public account and post data for the handle you choose to study.",
      },
      {
        question: "Can I track competitors or clients?",
        answer:
          "Yes. Any public handle can have its own performance profile, which works for client research and competitor monitoring as well as your own account.",
      },
    ],
  },
  {
    slug: "caffeine",
    name: "Caffeine",
    repo: "iannuttall/caffeine",
    primaryAction: {
      label: "Download for macOS",
      href: "https://github.com/iannuttall/caffeine/releases/latest",
      kind: "download",
    },
    platform: "macOS 14+",
    license: "MIT",
    accent: "#0ea5e9",
    title: "Keep your Mac awake while your coding agent is working",
    description:
      "Caffeine keeps the one-click cup, then releases your Mac to sleep when Claude Code or Codex finishes a turn and waits for you.",
    metaTitle: "Caffeine for Mac with Claude Code and Codex Agent Watch",
    metaDescription:
      "A native macOS menu bar app with one-click wake sessions, timers, battery controls, a CLI, and Agent Watch for Claude Code and Codex.",
    detailHeading: "Native power control that stays on your Mac",
    details: [
      {
        title: "No administrator access",
        description:
          "The app uses normal macOS power assertions and does not install a privileged helper.",
      },
      {
        title: "Signed and notarised by Apple",
        description:
          "Public builds are signed with a Developer ID and notarised, so macOS can verify nothing changed since the build.",
      },
      {
        title: "Process watching is separate",
        description:
          "A fallback can watch several coding-agent processes, but it stays off until you choose the broader behaviour.",
      },
      {
        title: "Closed-lid mode is best effort",
        description:
          "Caffeine can request it, but macOS and the hardware make the final decision. System power settings are never rewritten.",
      },
    ],
    closing: "Let the Mac sleep when the agent has stopped doing useful work.",
    faqs: [
      {
        question: "Which agents can Caffeine follow?",
        answer:
          "Lifecycle hooks follow Claude Code and Codex turns. Optional process watching also supports OpenCode, Aider, Amp, Gemini CLI, Cursor Agent, and Goose.",
      },
      {
        question: "Does Caffeine change pmset?",
        answer:
          "No. It uses macOS power assertions. Closed-lid mode is a best-effort request, and macOS still decides what the hardware allows.",
      },
      {
        question: "Does anything leave my Mac?",
        answer:
          "No work data does. Preferences and session markers stay local, and Caffeine does not upload prompts, hook payloads, process details, or usage data.",
      },
      {
        question: "Is this the original Caffeine app?",
        answer:
          'It is an independent Swift rewrite of it. Tomas Franzén of Lighthead Software created Caffeine in 2006, and Michael Jones at IntelliScape Computer Solutions carried it forward from 2018 once the source was opened up. This version keeps the one-click cup and the MIT-licensed menu bar artwork, then adds Agent Watch for coding agents. The <a href="https://www.caffeine-app.net/en/" target="_blank" rel="noreferrer">official Caffeine FAQ</a> tells the full story.',
      },
    ],
  },
  {
    slug: "natter",
    name: "Natter",
    repo: "iannuttall/natter",
    primaryAction: {
      label: "Download for macOS",
      href: "https://github.com/iannuttall/natter/releases/latest",
      kind: "download",
    },
    platform: "Apple silicon, macOS 15+",
    license: "Apache 2.0",
    accent: "#06b6d4",
    title: "Dictate code, commands, and half-finished thoughts on your Mac",
    description:
      "Natter transcribes speech locally, fixes technical terms and sentence boundaries, then types into the app you were already using.",
    metaTitle: "Natter: local macOS dictation for code and technical work",
    metaDescription:
      "A native local dictation app for macOS that handles code, commands, file paths, technical terms, and optional on-device writing cleanup.",
    detailHeading: "Your voice and transcript stay on the machine",
    details: [
      {
        title: "Models install only when chosen",
        description:
          "The required speech model and optional writing models download after you approve them and remain under Application Support.",
      },
      {
        title: "Permissions have narrow jobs",
        description:
          "Microphone captures speech, Accessibility finds the focused field, and Input Monitoring handles the global shortcut.",
      },
      {
        title: "Signed and notarised by Apple",
        description:
          "Public builds are signed with a Developer ID and notarised, so macOS can verify nothing changed since the build.",
      },
      {
        title: "No account, no telemetry",
        description:
          "There is no sign-up, usage tracking, localhost service, or Ollama dependency. The app is complete on its own.",
      },
    ],
    closing:
      "Say the messy version. Get useful text in the field you were already using.",
    faqs: [
      {
        question: "Does Natter send audio to the cloud?",
        answer:
          "No. Speech recognition and optional writing cleanup run on the Mac. Audio and transcripts are not uploaded.",
      },
      {
        question: "Which Macs can run it?",
        answer: "Natter supports Apple silicon Macs running macOS 15 or later.",
      },
      {
        question: "Do I need the large writing models?",
        answer:
          "No. The speech model is required. Raw and Clean modes do not need a writing model, and Agent has a deterministic fallback when its optional model is unavailable.",
      },
    ],
  },
  {
    slug: "clockwork",
    name: "Clockwork",
    repo: "iannuttall/clockwork",
    primaryAction: {
      label: "Download for macOS",
      href: "https://github.com/iannuttall/clockwork/releases/latest",
      kind: "download",
    },
    platform: "macOS 14+",
    license: "MIT",
    accent: "#f59e0b",
    title: "Run recurring commands on your Mac without learning crontab",
    description:
      "Clockwork gives scheduled commands a native menu bar, clear run history, and launchd reliability even after the app closes.",
    metaTitle: "Clockwork: schedule recurring commands on macOS",
    metaDescription:
      "A native macOS menu bar app for recurring commands with launchd schedules, run history, stdout and stderr, attention events, and a JSON CLI.",
    detailHeading: "A readable front end for the scheduler already in macOS",
    details: [
      {
        title: "No root or helper process",
        description:
          "Clockwork writes jobs into your user launchd session and does not need Full Disk Access or a privileged helper.",
      },
      {
        title: "Signed and notarised by Apple",
        description:
          "Public builds are signed with a Developer ID and notarised, so macOS can verify nothing changed since the build.",
      },
      {
        title: "Common cron can be translated",
        description:
          "The CLI explains common cron expressions with clockwork explain-cron, while schedules stay native intervals, daily times, or weekdays.",
      },
      {
        title: "Disabled tasks keep their history",
        description:
          "Disabling a task unregisters its launch agent but keeps the definition and run history for when you switch it back on.",
      },
    ],
    closing:
      "Schedule the command, close the app, and check the result when it matters.",
    faqs: [
      {
        question: "Does Clockwork need to stay open?",
        answer:
          "No. Enabled tasks run through your macOS launchd session after the app closes.",
      },
      {
        question: "Is it a cron replacement?",
        answer:
          "For recurring commands on one Mac, yes. Clockwork supports intervals, daily times, and selected weekdays through launchd rather than arbitrary cron syntax.",
      },
      {
        question: "Where are tasks and logs stored?",
        answer:
          "Task definitions, run history, stdout, and stderr stay under <code>~/Library/Application Support/Clockwork/</code>. Nothing is uploaded.",
      },
    ],
  },
  {
    slug: "barkeep",
    name: "Barkeep",
    repo: "iannuttall/barkeep",
    primaryAction: {
      label: "Download for macOS",
      href: "https://github.com/iannuttall/barkeep/releases/latest",
      kind: "download",
    },
    platform: "macOS 14+",
    license: "MIT",
    accent: "#0d9488",
    title: "Decide which menu bar icons your Mac shows",
    description:
      "Barkeep sorts every menu bar item into always visible, hidden, or always hidden, then brings the hidden ones back with one click.",
    metaTitle: "Barkeep: free menu bar manager for macOS",
    metaDescription:
      "A free, open source macOS menu bar manager. Hide, reveal, and rearrange menu bar icons with three sections, search, and global hotkeys. A Bartender alternative.",
    detailHeading: "A menu bar manager with one rule you can remember",
    details: [
      {
        title: "Three sections, nothing implicit",
        description:
          "Every item is always visible, hidden, or always hidden. The Items screen shows all three at once, so no icon sits in a state you cannot see.",
      },
      {
        title: "Accessibility access, no helper process",
        description:
          "macOS only exposes other apps' menu bar items through the Accessibility API. Barkeep uses it and runs no privileged helper of its own.",
      },
      {
        title: "It reads the menu bar when you ask",
        description:
          "There is no continuous Accessibility scan in the background. Barkeep rescans on demand, so an idle Mac stays idle.",
      },
      {
        title: "Signed, notarised, and quiet to update",
        description:
          "Public builds carry a Developer ID signature and Apple notarisation. Sparkle checks for updates in the background and installs signed releases only.",
      },
    ],
    closing: "Keep the icons you use and put the rest behind one dot.",
    faqs: [
      {
        question: "How does Barkeep hide menu bar icons?",
        answer:
          "Assign each item to Always visible, Hidden, or Always hidden. Click the Barkeep dot to show or hide the Hidden section, and Option-click it to show every section.",
      },
      {
        question: "Why does Barkeep need Accessibility access?",
        answer:
          "macOS only lets an app list, open, and move another app's menu bar items through the Accessibility API. Barkeep registers the request, opens the exact Settings page, and shows a short switch guide over it.",
      },
      {
        question: "Does Barkeep need to stay open?",
        answer:
          "Yes. Barkeep is the menu bar item that holds the hidden sections, so quitting it returns every icon to the normal macOS menu bar.",
      },
    ],
  },
  {
    slug: "unclaimed",
    name: "Unclaimed",
    repo: "iannuttall/unclaimed",
    websiteUrl: "https://www.npmjs.com/package/unclaimed",
    primaryAction: {
      label: "Open on npm",
      href: "https://www.npmjs.com/package/unclaimed",
      kind: "website",
    },
    platform: "Node 24+",
    license: "MIT",
    accent: "#10b981",
    title: "Find a single-word domain before someone else does",
    description:
      "Check one word across any set of TLDs, save the answers locally, and keep large searches moving without starting over.",
    metaTitle: "Unclaimed: single-word domain availability from the terminal",
    metaDescription:
      "A local Node.js CLI for checking single-word domains through RDAP and WHOIS, browsing saved results, comparing prices, and running resumable searches.",
    detailHeading: "Registry checks and a local catalogue, without a hosted service",
    details: [
      {
        title: "Unknown stays unknown",
        description:
          "A timeout, rate limit, or response Unclaimed cannot classify is never turned into an available domain.",
      },
      {
        title: "The database stays local",
        description:
          "Words, results, prices, and check history live in SQLite on your machine. There is no account or hosted API.",
      },
      {
        title: "Registrar access is optional",
        description:
          "Normal checks use registry RDAP and WHOIS. Add registrar credentials only when bulk checks or exact prices are useful.",
      },
      {
        title: "Humans and agents get separate paths",
        description:
          "The bare command opens an interactive browser. Explicit commands stay headless for agents, scripts, pipes, and CI.",
      },
    ],
    closing: "Check the word, keep the evidence, and confirm it before you buy.",
    faqs: [
      {
        question: "How does Unclaimed check a domain?",
        answer:
          "It asks RDAP first when the registry supports it, then falls back to WHOIS. An available RDAP response is checked against WHOIS before Unclaimed trusts it.",
      },
      {
        question: "Can I search TLDs that are not built in?",
        answer:
          "Yes. Pass any delegated suffix with <code>--tlds</code> or load a list with <code>--tlds-file</code>. Registry overrides can be saved in the local config for unusual TLDs.",
      },
      {
        question: "Where are results stored?",
        answer:
          "The default SQLite database is under your local data directory. Use <code>unclaimed config</code> to see the exact path or <code>--db</code> to choose another one.",
      },
    ],
  },
  {
    slug: "mailroom",
    name: "Mailroom",
    repo: "iannuttall/mailroom",
    primaryAction: {
      label: "Read the setup guide",
      href: "https://github.com/iannuttall/mailroom/blob/main/docs/deploy.md",
      kind: "website",
    },
    platform: "Node 22+ and Cloudflare",
    license: "Apache 2.0",
    accent: "#ef5b4c",
    title: "Give project email one private home your agent can use",
    description:
      "Mailroom receives email through Cloudflare and exposes bounded tools for reading, searching, drafting, and replying with approval before send.",
    metaTitle: "Mailroom: private Cloudflare email for AI agents",
    metaDescription:
      "A self-hosted Cloudflare email service with a CLI, TypeScript API, and three-tool MCP server for safe agent-assisted reading, drafting, and replies.",
    detailHeading: "Email infrastructure that keeps storage, search, and sending explicit",
    details: [
      {
        title: "You own the Cloudflare account",
        description:
          "The Worker, D1 database, R2 bucket, routes, and sending configuration deploy into infrastructure you control.",
      },
      {
        title: "Original email stays inspectable",
        description:
          "R2 keeps raw MIME and attachments while D1 stores bounded parsed messages, threads, drafts, and delivery history.",
      },
      {
        title: "Agents discover before they read",
        description:
          "Three MCP tools list operations, describe one schema, and run it. Full bodies and attachments remain opt-in.",
      },
      {
        title: "Drafting and sending are separate",
        description:
          "A draft cannot silently become an outbound message. Approval, permissions, audit records, and idempotency guard the send path.",
      },
    ],
    closing: "Let the agent help with the inbox without handing it an unlimited send button.",
    faqs: [
      {
        question: "Does Mailroom include a web inbox?",
        answer:
          "No. The first release uses a CLI, TypeScript API, private HTTP API, and MCP server. Gmail can remain the human inbox through optional forwarding and Sent-mail sync.",
      },
      {
        question: "Can an agent send email by itself?",
        answer:
          "Not by default. Creating, approving, and sending a draft are separate operations. Automation ships disabled and cannot silently send mail.",
      },
      {
        question: "What Cloudflare services does it need?",
        answer:
          "The central installation uses Workers, Email Routing and Email Service, D1, R2, Queues, Workers AI, and AI Search. Email Sending to arbitrary recipients currently needs Workers Paid.",
      },
    ],
  },
];

export const projectPageBySlug = new Map(
  projectPages.map((project) => [project.slug, project]),
);

const extraProjectFaqs: Record<string, ProjectFaq[]> = {
  barkeep: [
    { question: "Is Barkeep a Bartender alternative for Mac?", answer: "Yes. Barkeep is a free, open source menu bar manager that covers the same core job: choosing which menu bar icons stay visible and which sit behind one icon. It is a clean-room implementation and shares no code with Bartender." },
    { question: "Is Barkeep free and open source?", answer: "Yes. Barkeep uses the MIT licence and the full Swift source is on GitHub. There is no paid tier, licence key, or account." },
    { question: "How is Barkeep different from Ice?", answer: "Both are free and open source. Barkeep keeps one three-section model with a second menu bar off by default, ships Developer ID signed and notarised builds, and installs updates quietly through Sparkle." },
    { question: "Can Barkeep stop menu bar icons hiding behind the notch?", answer: "Yes, indirectly. Moving items you rarely need into Hidden or Always hidden shortens the visible row, so the icons you kept stay clear of the notch." },
    { question: "How do I rearrange menu bar icons on a Mac?", answer: "macOS lets you Command-drag icons along the bar. Barkeep adds a section menu on every item plus drag and drop between sections, so both the order and the visibility stay put." },
  ],
  keep: [
    { question: "How do session handoffs work?", answer: "Claude Code, Codex, and Pi can load current project notes at the start of a session and save a handoff when the session ends. The handoff records what changed, what remains open, and what the next agent needs." },
    { question: "Do I need MCP to use Keep?", answer: "No. MCP works well inside compatible AI clients, while the Keep CLI covers terminals, scripts, and agents that prefer commands. Both use the same account and library." },
    { question: "Can Keep search by meaning?", answer: "Yes. Semantic search can find relevant notes and saved material even when your question does not repeat the exact words in the source." },
    { question: "Is there a free plan?", answer: "Yes. Starter includes unlimited saved links, RSS and YouTube feeds, feed search, and a one-time allowance for trying Notes. Pro adds unlimited Notes, handoffs, semantic search, and AI processing." },
  ],
  "seo-skill": [
    { question: "What is a technical SEO audit?", answer: "A technical SEO audit checks whether search engines can crawl, understand, index, and serve the useful pages on a site. SEO Skill combines those checks with search data so the report can rank what matters." },
    { question: "Can an AI agent run the SEO audit?", answer: "Yes. The packaged skill, MCP server, CLI, and JSON output expose the same report engine. An agent gets stable finding IDs and the evidence behind each recommendation." },
    { question: "Does it replace Ahrefs or Semrush?", answer: "No. SEO Skill can use third-party keyword and competitor data when it changes a decision, but its main job is combining your crawl, Search Console, Analytics, and local evidence." },
    { question: "How do I verify an SEO fix?", answer: "Run the relevant report again and compare matching time windows where the source supports it. The report keeps observed data separate from conclusions so the before and after remain inspectable." },
  ],
  swipe: [
    { question: "Is Swipe an AI news newsletter?", answer: "Not really. It skips most news and keeps practical skills, prompts, tools, and workflows that are worth trying in real work." },
    { question: "Who writes Swipe?", answer: "Ian Nuttall researches and writes each issue. The selections are made by hand, with a short explanation of why each one is useful." },
    { question: "Can I unsubscribe at any time?", answer: "Yes. Every email includes an unsubscribe link and public issues remain available without an account." },
    { question: "Is the Swipe newsletter code open source?", answer: "Yes. The site, public archive, newsletter system, and operator tools are available in the GitHub repository." },
  ],
  ilo: [
    { question: "What X data does ilo analyse?", answer: "ilo studies public posts and their public performance signals, then compares topics, openings, length, format, timing, media, links, and structure." },
    { question: "Can ilo analyse an account I do not own?", answer: "Yes. Add any public handle to build a profile for competitor research, client work, or learning from another account." },
    { question: "How does an agent use the report?", answer: "MCP, CLI, and API return structured findings with the posts behind them, so an agent can use account-specific evidence while planning content." },
    { question: "Does ilo need my X password?", answer: "No. ilo works from public account and post data and does not take control of the account." },
  ],
  caffeine: [
    { question: "How do I prevent my Mac from sleeping?", answer: "Click the Caffeine cup to start a wake session. Click it again to release the power assertion and let macOS use its normal sleep settings." },
    { question: "Can Caffeine keep a Mac awake with the screen off?", answer: "You can choose whether a session keeps only the system awake or also keeps the display awake. macOS still controls what the hardware permits." },
    { question: "Can Caffeine keep a Mac awake with the lid closed?", answer: "Caffeine can make a best-effort closed-lid request, but macOS and the Mac hardware make the final decision. It does not rewrite system power settings." },
    { question: "Will Caffeine stop when Codex or Claude Code finishes?", answer: "Yes, when Agent Watch is enabled. Lifecycle hooks hold the wake session during a turn and release it when the agent finishes or waits for input." },
  ],
  natter: [
    { question: "How do I start voice typing with Natter?", answer: "Double-tap Right Option while a text field is focused. Natter shows the live transcript and types the result back into that field when you stop." },
    { question: "Can Natter dictate terminal commands and file paths?", answer: "Yes. Its technical cleanup is built for commands, flags, paths, package names, version numbers, and preferred spellings from your personal dictionary." },
    { question: "What happens if the target app loses focus?", answer: "Natter keeps a local recovery record and copies the intended text when it cannot safely type into the original field." },
    { question: "Can I use raw transcription without rewriting?", answer: "Yes. Raw mode returns direct speech recognition. Clean, Agent, Email, and Article modes add different levels of local cleanup." },
  ],
  clockwork: [
    { question: "How do I schedule a command on a Mac?", answer: "In Clockwork, add the command and choose an interval, daily time, or selected weekdays. It registers the task with your user launchd session." },
    { question: "Can I run a scheduled command immediately?", answer: "Yes. Run Now starts the same saved task on demand, and the result appears in its normal run history." },
    { question: "Can I see stdout and stderr?", answer: "Yes. Clockwork stores the exit code, stdout, stderr, and duration for the latest 50 runs of each task." },
    { question: "Does Clockwork require administrator access?", answer: "No. Tasks run in your user launchd session. Clockwork does not install a privileged helper or require Full Disk Access." },
  ],
  unclaimed: [
    { question: "How do I install Unclaimed?", answer: "Install the npm package globally with <code>npm i -g unclaimed</code>, or run a focused check without installing it using <code>npx unclaimed check orbit --tlds io,ai,dev</code>." },
    { question: "Can I stop and resume a large domain search?", answer: "Yes. <code>sweep</code> saves each result to SQLite and skips confident existing rows when it runs again. <code>refresh</code> deliberately rechecks older answers." },
    { question: "Does available mean I can definitely register the domain?", answer: "No. It is a strong registry signal, but registrars can reserve a name, apply premium pricing, or receive another registration first. Confirm the domain at a registrar before buying." },
    { question: "Can an AI agent use Unclaimed?", answer: "Yes. The repository includes an installable agent skill, and explicit CLI commands stay headless. Install the skill with <code>npx skills add iannuttall/unclaimed</code>." },
  ],
  mailroom: [
    { question: "Is Mailroom a hosted email provider?", answer: "No. It is self-hosted software for Cloudflare. The mailbox state, raw email, routes, and sending configuration remain in the Cloudflare account you choose." },
    { question: "How does Mailroom keep email content bounded for agents?", answer: "Search and discovery return compact metadata first. Complete bodies, threads, raw MIME, attachment metadata, and prompt content require explicit operation inputs." },
    { question: "Can Mailroom receive email for several domains?", answer: "Yes. One central Worker can serve domains in the same Cloudflare account. Small signed ingress Workers relay domains that must stay in other accounts." },
    { question: "Can I keep using Gmail?", answer: "Yes. Mailroom can forward stored inbound messages to a verified Gmail address, and its optional Apps Script can return manual Gmail Sent messages to the correct Mailroom thread." },
  ],
};

export function projectFaqs(project: ProjectPage): ProjectFaq[] {
  return [...project.faqs, ...(extraProjectFaqs[project.slug] ?? [])];
}
