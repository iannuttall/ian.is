export type ProjectFaq = {
  question: string;
  answer: string;
};

export type ProjectPage = {
  slug: string;
  name: string;
  repo: string;
  websiteUrl?: string;
  primaryAction: {
    label: string;
    href: string;
    kind: "download" | "website";
  };
  platform: string;
  license: string;
  accent: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  demoLabel: string;
  detailHeading: string;
  details: Array<{ title: string; description: string }>;
  closing: string;
  faqs: ProjectFaq[];
};

export const projectPages: ProjectPage[] = [
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
    demoLabel: "A report that shows its work",
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
    demoLabel: "Good ideas, stripped of the noise",
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
    demoLabel: "Account history turned into a useful brief",
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
    demoLabel: "Awake for the work, released when it stops",
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
    demoLabel: "Speech that understands the awkward technical bits",
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
    demoLabel: "A scheduler you can read at a glance",
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
];

export const projectPageBySlug = new Map(
  projectPages.map((project) => [project.slug, project]),
);

const extraProjectFaqs: Record<string, ProjectFaq[]> = {
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
};

export function projectFaqs(project: ProjectPage): ProjectFaq[] {
  return [...project.faqs, ...(extraProjectFaqs[project.slug] ?? [])];
}
