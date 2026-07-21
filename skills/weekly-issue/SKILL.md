---
name: weekly-issue
description: Draft this week's Ian's List newsletter issue from real work signals — personal research findings, Hacker News, and GitHub — then render it and stage it as a prod draft with a test send to Ian only. Use when Ian asks to draft the weekly issue, run the Saturday pipeline, or prep the newsletter.
---

# Weekly Issue Pipeline

Turn a week of real work into a drafted newsletter issue. The output is a
draft in Ian's inbox, not a task on his list.

## Editorial contract (non-negotiable)

The issue is a **1-3-5**, roughly a 5-minute read, with one main ad slot and
a handful of classifieds:

1. **One main thing** — the single most impactful share of the week. Ian
   writes this section himself as a human. The pipeline's job is to propose
   2–3 candidate angles with supporting material, never to ghost-write it.
2. **Three cool things** — each backed by an agent-created demo or insight
   plus Ian's personal comment. A featured tool must HELP the reader and be
   shown in real use: actually build something small with it (cut a real
   video with the video tool, run the real audit against ian.is), ideally
   written up as a post on ian.is so traffic/SEO/backlinks accrue there.
   Never a bare link. The demos are the differentiator.
3. **Five quick tips** — from Ian's real AI chats this week. Each gets a
   tagline plus a description with enough context to be genuinely helpful,
   and must name a concrete benefit (faster, better output, security, time
   saved). Run an obviousness filter: kill anything a regular AI user
   already knows.

Hard rules:

- **The five-criteria test.** Every item needs: concrete problem, failed
  standard approach, non-obvious move, reusable recipe, evidence it worked.
  If a tip could be written without having done the work, kill it. Fewer,
  stronger items beat coverage — a 2-item issue that passes beats a 9-item
  issue that doesn't. Calibration examples are the "good" verdicts in
  `notes/newsletter/feedback.jsonl` (read them fresh each run; they
  accumulate). png-to-svg is one example that passes, not a template.
- **Pluck, don't link.** For HN/GitHub/reddit finds: read the actual README
  or post and extract the actionable idea, fleshed into a tip grounded in
  Ian's world (AI coding + SEO/marketing). The link is a citation, not the
  content.
- The reader must LEARN something actionable from the email itself, even
  with zero clicks. This is not a link roundup.
- Lean on practical tips for working with AI, NOT on tools — and especially
  not AI agent tools/orchestrators/harness add-ons.
- Links are sparse and preferably point to ian.is (demos, longer writeups).
- NO news, NO model-release coverage, NO funding/announcement items.
- Audience: the intersection of AI, coding, and marketing/SEO.
- Novelty matters: prefer things most readers haven't seen yet.
- Voice: follow the `writing-tips` skill. First person, plain sentences,
  no AI smell.

## Config

- Research CLI: `RESEARCH_CLI` env var if set, else
  `node /Users/iannuttall/dev/cli/research/packages/cli/dist/index.js`
- Hacker News: `npx -y hn-get`
- GitHub: `gh` CLI
- Working dir: `notes/newsletter/<YYYY-MM-DD>/` at the repo root (gitignored)
- Feedback log: `notes/newsletter/feedback.jsonl` (gitignored, append-only)

## Phase 1 — Personal signals (the core of the issue)

Run the research pipeline for the past 7 days (always pass `--json`):

```bash
$RESEARCH_CLI me apps --days 7 --json
$RESEARCH_CLI me history --days 7 --json
$RESEARCH_CLI me transcripts index --provider claude --limit 50 --json
$RESEARCH_CLI me transcripts index --provider codex --limit 50 --json
$RESEARCH_CLI me transcripts parse --limit 50 --maxTokens 2500 --json
$RESEARCH_CLI me transcripts audit --limit 15 --timeoutSeconds 180 --json
$RESEARCH_CLI findings review --markdown --limit 30
```

Present unreviewed findings to Ian in a compact list and let him
approve/reject in one pass (batch the IDs; don't ask one by one). Merge
near-duplicate findings before presenting. Then:

```bash
$RESEARCH_CLI findings approve --id <id>   # for each approved
$RESEARCH_CLI candidates promote --minConfidence 0.7 --limit 25
$RESEARCH_CLI candidates export --format markdown --limit 25
```

Save the export to the working dir. These personal lessons are the anchor —
an issue with zero personal items is not worth sending.

For the **quick tips** section, raw findings are not publishable: rewrite
each survivor with a tagline + 2–3 sentence description grounded in the real
moment it came from, and drop any tip whose benefit you cannot name in one
clause.

## Phase 2 — Public signals

Run these in parallel subagents (one per source). Each subagent returns a
scored shortlist, not raw dumps. Remember the contract: these feed the
"three cool things" only if a real demo can be built with them, or they
carry a lesson worth teaching inline.

**Hacker News** (retroactive, no collectors needed):

```bash
npx -y hn-get search "<query>" --since 7d --sort points --limit 30
```

Queries: `claude code`, `ai agents`, `mcp`, `ai seo`, `llm marketing`,
plus a pass over Show HN (`show_hn` tag in results). Skip news coverage.
Filter to `type: "story"` — search mixes in comment hits. Read comments on
finalists (`hn-get item <id> --comments --depth 1`); commenters catching
real flaws is disqualifying, and note field names differ between search
(`points`/`comments`) and item (`score`/`descendants`).

**GitHub** (three lenses, not just brand-new):

```bash
gh search repos --created ">$(date -v-7d +%Y-%m-%d)" --sort stars --limit 30 --json fullName,description,stargazersCount,createdAt,url
gh search repos --topic <topic> --updated ">$(date -v-14d +%Y-%m-%d)" --stars "100..3000" --sort stars --limit 20 --json fullName,description,stargazersCount,createdAt,pushedAt,url
```

Topics: `claude`, `mcp`, `ai-agents`, `seo` (one `--topic` per call). The
star-band query clusters at the top of the band, so also run a supplementary
`--created ">2 weeks ago" --stars ">100"` pass to surface velocity plays.
Fetch https://github.com/trending?since=weekly and parse the `<article>`
blocks (grep on the raw HTML only matches nav noise); the +stars-this-week
counts there are the best velocity signal. Score by star velocity over
absolute stars; above ~3,000 stars everyone has seen it. Exclude
awesome-lists and star-inflated spam clusters (check for bot-like star
patterns on too-fast risers). Read the README of finalists.

**Keep saves** (Ian's manual capture, pre-approved candidates):

```bash
keep list --since 14d --limit 60 --json
keep content <id>   # full extracted markdown, survives dead links
```

Items tagged `ianslist` are saves Ian made FOR the newsletter; `pluck` marks
extracted lessons to reuse as no-link tips. Keep stores the extracted content,
so an original that has since been deleted (removed Reddit post, dead page) is
not disqualifying. Pluck the lesson from `keep content` and drop the link.
When a linked item is cut from an issue for a dead source, tag it `pluck` and
note the lesson in keep so it resurfaces here.

**Crossover boosts** (strongest novelty signals):
- Repos linked from this week's Show HN posts.
- GitHub repos Ian actually visited this week (from the Phase 1 Chrome
  history output) — "Ian cared" beats any heuristic. Ignore bare
  github.com and issue/PR pages of repos he maintains.
- Chrome bookmarks in a folder named `newsletter` (read
  `~/Library/Application Support/Google/Chrome/Default/Bookmarks` JSON) —
  Ian's manual saves (Reddit finds, articles) are pre-approved candidates.

## Phase 3 — Score with memory, slot into 1-3-5

Before ranking, read the ENTIRE `notes/newsletter/feedback.jsonl`. Each line:

```json
{"date":"2026-07-12","item":"<name or url>","verdict":"good|bad","reason":"<Ian's words>"}
```

Past verdicts are few-shot guidance for Ian's taste — `format:*` and
`editorial:*` entries are standing rules, item entries are precedents.

Then propose the issue skeleton to Ian BEFORE writing or building anything:

- **1**: 2–3 candidate angles for the main thing (Ian picks and writes it).
- **3**: 3 cool things, each with the demo you propose to build and where
  it would live (ian.is post, GIF, rendered output).
- **5**: 5 quick tips with taglines.

Capture his keeps/kills and reasons verbatim-ish, and append them to the
feedback log.

## Phase 4 — Demos, draft, render, stage

1. Build the approved demos for the "three cool things" (subagents; save
   artifacts under the working dir). Each demo yields: what I built, what
   surprised me, one practical takeaway — that's the section content.
2. Write the issue into the Astro collection as
   `apps/site/src/content/issues/<slug>.md` — the slug is a slugified
   subject (it's the archive URL, so SEO matters), never an issue number;
   numbering lives only in the `::: header name="Issue NNN"` label — with
   frontmatter
   (`subject`, `preheader`, `pubDate`, `draft: true`) and the newsletter's
   section blocks in the body (`links`, `box`, etc. — see
   `apps/newsletter/README.md` template rules; `---` between multi-item
   blocks, never bullets). Leave a clearly marked `[IAN WRITES THIS]`
   placeholder for the main thing, with the supporting material below it as
   comments. Include the sponsor slot placeholder.
3. Render and check both surfaces:
   ```bash
   pnpm ian issue preview <slug>   # email HTML into apps/newsletter/rendered
   # web version: pnpm ian site dev -> /issues/<slug>
   ```
4. Show Ian the draft text for review. Iterate until he approves.
5. On approval only: send a test to Ian's address ONLY (never create a
   broadcast in this skill):
   ```bash
   pnpm ian issue test <slug>
   ```
   The real send is `pnpm ian issue send <slug> --yes` and is Ian's command
   to run, not this skill's.

## Boundaries

- This skill never creates or promotes a real broadcast. Sending to the
  list stays a deliberate human step (see
  `apps/newsletter/agents/production-readiness.md`).
- Personal signal data stays on this machine. Only the finished draft text
  goes to the newsletter server.
- If a phase produces nothing (quiet week on HN, no findings), say so and
  continue with what exists — a shorter honest issue beats padding.

## Known wrinkles

- `me apps` (Screen Time) can return zero signals — likely needs Full Disk
  Access for the terminal. Not blocking; note it and continue.
- `me transcripts audit` shells out to `codex exec` and prints nothing until
  it finishes — run it in the background and don't mistake silence for a
  hang. It also audits most-recent chunks first, so the current session
  dominates; consider spreading `--limit` across providers/projects.
- `findings review --json` omits titles; parse the `--markdown` output for
  human-readable lists.
- Chrome history can contain machine noise (auto-refreshing zombie tabs
  produce thousands of "visits"); sanity-check top history signals before
  treating them as interest.
