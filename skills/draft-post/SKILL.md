---
name: draft-post
description: Write a complete draft blog post for ian.is from Ian's real week of work, with the topic chosen deterministically via work signals + Ahrefs keyword/AI-search opportunity. Ian reacts to a finished draft; he never picks from menus or writes from scratch. Use when Ian asks to draft a post, run the post pipeline, or get this week's post going.
---

# Draft Post Pipeline

Produce one finished draft post in `notes/drafts/` (the gitignored vault).
Drafts never live in the Astro app; a post only moves to
`apps/site/src/content/posts/` when Ian says publish. His only job is to
react: edit, publish, or veto. Never hand him a topic menu, a blank
outline, or a section "for him to write".

## The quality bar (five criteria)

Every topic must have all five: (a) a concrete problem someone recognizably
has, (b) standard approaches that fail, (c) a non-obvious move, (d) a
reusable recipe, (e) evidence it worked. Fewer, stronger items beat
coverage. REJECT meta-prompting platitudes ("make the AI verify", "fence off
the spec") — if the tip could be written without having done the work, it
does not ship. Clear, defined, common AI problems (e.g. a model version
massively overengineering) are also in scope when grounded in real chats.

Calibration examples live in `notes/newsletter/feedback.jsonl` (verdict
"good" entries) — read them fresh each run; they accumulate and rotate.
One example that passes: the png-to-svg reconstruction skill
(`~/dev/sandbox/png-to-svg`). It is an example, not a template — stories do
not need to look like "built a Python tool with metrics".

## Design rules (why this skill is shaped this way)

- No step may RELY on Ian. The pipeline picks the topic itself and writes
  the whole post. His input is optional enrichment.
- One post per run. Depth beats volume.
- The post must come from work Ian actually did — real lessons, real
  numbers, real evidence from this week. Never generic advice.
- Voice is minimalist and impersonal-but-first-person: facts about what he
  built and learned, no life narrative, no confessions. Follow the
  `writing-tips` skill for every prose rule (bans, headings, titles, links).

## Step 1 — Gather the week

```bash
RESEARCH_CLI="${RESEARCH_CLI:-node /Users/iannuttall/dev/cli/research/packages/cli/dist/index.js}"
$RESEARCH_CLI me history --days 7 --json
$RESEARCH_CLI me transcripts index --provider claude --limit 50 --json
$RESEARCH_CLI me transcripts index --provider codex --limit 50 --json
$RESEARCH_CLI me transcripts parse --limit 50 --maxTokens 2500 --json
$RESEARCH_CLI me transcripts audit --limit 15 --timeoutSeconds 180 --json   # background; silent until done
$RESEARCH_CLI candidates export --format markdown --limit 25
```

From candidates + this week's sessions, derive 5–8 topic candidates. Each
must be anchored in something Ian did (built, fixed, measured, learned),
with the evidence noted.

## Step 2 — Score and pick (deterministic, no menu)

For each candidate derive 2–3 seed keywords/questions a searcher or an AI
assistant would use. Check them with the Ahrefs MCP tools (load via
ToolSearch): `keywords-explorer-overview` for volume/difficulty,
`keywords-explorer-matching-terms` for the long tail. Read `doc` first the
first time.

Score each candidate 1–10 on: search/AI-search opportunity (volume vs
difficulty), authenticity (how much real evidence Ian has), and evergreen
value. Weight authenticity highest — a post with real numbers from real
work beats a bigger keyword Ian can't speak to. Pick the single top scorer.
Log the runners-up and scores to the working notes; do not present them as
a choice.

## Step 3 — Voice reference

1. Read the `writing-tips` skill in full. It is the law for prose.
2. Read every non-draft post in `apps/site/src/content/posts/`.
3. Read `notes/newsletter/legacy-issues.md` if it exists. If it does not, build
   it once by exporting Ian's old newsletter bodies from prod:
   `vps ssh email` → query the `drafts` table `body_markdown` column for
   the 8 legacy issues, save locally. They are the largest corpus of Ian's
   published voice.
4. Check `notes/newsletter/feedback.jsonl` for `editorial:*` entries —
   standing voice rules (e.g. minimal, not personal/confessional).

## Step 4 — Write

- Frontmatter per `apps/site/src/content.config.ts`: `title`,
  `description`, `pubDate` (today), `tags`, `draft: true`. Title and
  description follow writing-tips SERP rules (withhold the payoff, 55–70
  char title).
- Body: the real story of the work with the lesson extractable by a
  skimmer. Real commands, real numbers, real failures. Code blocks where
  they teach. 800–1,500 words unless the material demands otherwise.
- Save to `notes/drafts/<slug>.md`. Do NOT put it in the Astro app.

## Step 5 — Deliver

Tell Ian the draft exists, with the title, the one-line reason this topic
won, and the file path. He edits or says "publish" or vetoes. On publish:
move the file to `apps/site/src/content/posts/<slug>.md`, set
`draft: false`, run `pnpm ian check site`, commit, push — pushing to main
deploys the site.

Never auto-publish: pushing to the public site is the one deliberately
human step. But the ask must stay one word, never a review checklist.

## Boundaries

- Never fabricate experience, metrics, or "I tested this" claims. Only
  what the transcripts/evidence support.
- No personal/confessional content (see feedback log). Facts, not feelings.
- One Ahrefs pass per run — don't burn API rows iterating on keywords.
- Personal signal data stays local; only the finished post text enters the
  repo.
