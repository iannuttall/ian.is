# email

Agent-first newsletter and email platform for broadcasts, tracking,
suppressions, and marketing analytics.

This is a Node 24 + pnpm app inside the `ian.is` monorepo, with a shared core
and thin interfaces:

- `packages/core`: business logic, config, Postgres store, rendering, tracking,
  delivery planning, provider abstraction, migrations, and readiness checks.
- `packages/cli`: operator and agent-friendly CLI.
- `packages/api`: Hono HTTP API for sites, webhooks, tracking, unsubscribe, and
  admin calls.
- `packages/web`: tiny Astro SSR app for human-facing public pages.
- `packages/mcp`: stdio MCP server for agent tools.
- `skills/email-newsletter`: installable instructions for agents operating the
  platform.
- `migrations`: SQL migrations run by `email db migrate`.

There is no dashboard on purpose. The product surface is CLI, API, MCP, and
data that agents can query.

## Requirements

- Node 24
- pnpm 11
- Postgres 17 or compatible
- Amazon SES for production sending

## Install

```bash
pnpm install
pnpm newsletter:build
```

## Configuration

Runtime defaults live in code. `.env` is for deployment-specific values:

```bash
APP_NAME=email
EMAIL_APP_NAME="My Newsletter"
MAIN_SITE_NAME="Example"
MAIN_SITE_URL=https://example.com
DATABASE_URL=postgresql://email:email@localhost:5432/email
BASE_URL=https://newsletter.example.com
EMAIL_API_INTERNAL_URL=http://app:3000
API_TOKEN=change-me
UNSUBSCRIBE_SECRET=change-me
TRACKING_SECRET=change-me
EMAIL_PROVIDER=ses
EMAIL_FROM_EMAIL=newsletter@example.com
EMAIL_FROM_NAME="My Newsletter"
```

`APP_NAME` is the infrastructure/app id. `EMAIL_APP_NAME` is the public display
name used by health responses, CLI help, MCP metadata, and public unsubscribe
pages. The `email` CLI binary and MCP tool names stay stable by design.

`MAIN_SITE_NAME` and `MAIN_SITE_URL` are used by `packages/web` for the header
breadcrumb back to the parent site. If omitted, the web pages fall back to
`Ian Nuttall` and `https://ian.is`.

`BASE_URL` is the public origin used in generated email links.
`EMAIL_API_INTERNAL_URL` is only used by `packages/web` so public pages can
forward mutations to the API service without duplicating platform logic.

Open pixel tracking is enabled by default. Disable it while keeping click
tracking:

```bash
EMAIL_TRACK_OPENS=false
```

Provider sends are throttled in core so every interface shares the same guard.
The default is 14 provider send attempts per second:

```bash
EMAIL_SEND_RATE_PER_SECOND=14
```

SES config:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SNS_WEBHOOK_SECRET=...
AWS_SNS_ALLOWED_TOPICS=arn:aws:sns:us-east-1:123456789012:topic-name
```

`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` can be omitted when the runtime
has AWS credentials through the normal AWS SDK provider chain.

## Development

Commands in this README assume you are running them from the monorepo root.

```bash
pnpm ian check newsletter-web
pnpm ian build newsletter-web
pnpm ian check newsletter
pnpm newsletter:lint:fix
pnpm newsletter:typecheck
pnpm newsletter:test
pnpm newsletter:build
pnpm newsletter:lint
```

Prefer the `pnpm ian ...` helpers for routine checks. Use the raw newsletter
scripts when you need the lower-level package output.

Postgres integration tests are opt-in:

```bash
INTEGRATION_DATABASE_URL=postgresql://email:email@127.0.0.1:5432/email_test pnpm --filter @email/core test
```

## Local Smoke Test

Create `.env.local` from `.env.example`, then run a local database:

```bash
docker compose --env-file apps/newsletter/.env.local -f apps/newsletter/docker-compose.yml -p email-localtest down -v
docker compose --env-file apps/newsletter/.env.local -f apps/newsletter/docker-compose.yml -p email-localtest up -d postgres
pnpm ian newsletter migrate
```

Seed aliases for a local inbox you control:

```bash
pnpm ian newsletter seed-aliases --email user@gmail.com --count 20
pnpm ian newsletter seed-intelligence --email user@gmail.com --count 20
```

Render and create a draft:

```bash
pnpm ian newsletter render --subject "Local email platform test" --body-file apps/newsletter/draft.md
pnpm ian newsletter draft --subject "Local email platform test" --body-file apps/newsletter/draft.md
```

Preview the React Email templates locally:

```bash
pnpm newsletter:email:preview
```

This runs the official React Email preview app against `emails/`, which imports
the real core template components rather than a copied preview-only version.

Send a real demo email only after `.env.local` points at the provider you mean
to use:

```bash
pnpm ian newsletter draft --subject "Local email platform test" --body-file apps/newsletter/local-test/draft.md --preview "A local test of Ian's List"
pnpm ian newsletter test-send --draft-id <draft_id> --to you@example.com
```

Run the API locally for subscribe, click, and unsubscribe routes:

```bash
pnpm ian newsletter api --port 3000
```

Run the public Astro pages locally:

```bash
pnpm ian newsletter web
```

Only run the worker when you are ready to send real provider mail:

```bash
pnpm ian newsletter worker
```

## CLI

After building:

```bash
node apps/newsletter/packages/cli/dist/index.js help
```

Common commands:

```bash
email doctor --json
email ops checklist --json
email db migrate --json
email subscribe person@example.com --source site --json
email contact export --out contacts.json --json
email contact import --file contacts.json --json
email contact tag person@example.com --tag high-value --json
email contact external-id person@example.com --provider stripe --external-id cus_123 --json
email purchase record --email person@example.com --provider stripe --external-id pi_123 --idempotency-key stripe:pi_123 --product-key course --amount-cents 50000 --currency USD --json
email audience preview --contact-tag high-value --json
email template list --json
email template render --subject "Hello" --body-file draft.md --out-dir rendered --json
email draft create --subject "Hello" --body-file draft.md --json
email broadcast preview-plan --sample-limit 25 --json
email broadcast create --draft-id <draft_id> --scheduled-at 2026-06-20T12:00:00.000Z --json
email canary create --draft-id <draft_id> --steps 50,500,2000,all --json
email canary promote <canary_id> --json
email broadcast pause <broadcast_id> --json
email broadcast cancel <broadcast_id> --json
email broadcast test --yes --draft-id <draft_id> --to person@example.com --json
email send due --yes --limit 100 --json
email worker send --yes --batch-size 100 --interval-ms 10000
email api serve --port 3000
email mcp serve
```

Commands that send mail or mutate queues require explicit confirmation flags.
Use `--json` for scripts and agents.

## Templates

Markdown is the authoring format. The default template is the normal Ian's List
React Email shell. It also accepts section blocks like `links`, `sponsor`, `box`,
`classifieds`, `quote`, and `poll`.

Use `::: header name="Issue 001"` to override the small top-right label.

Campaigns should be plain Markdown plus those shared section blocks. Avoid
one-off React email files for individual sends. Add new reusable section
components in `packages/core` when the design needs a new pattern.

Multi-item email blocks use `---` between items, not Markdown bullets:

```md
::: links title="Worth a Click"
[Passport Index](https://example.com)
Explore the power of passports

Ranks each passport by a mobility score.
---
[Paku](https://example.com)
Air quality monitor

Configure alerts for nearby sensors.
:::

::: classifieds title="Classifieds" button="Book yours ↗︎" button-url="https://ian.is/advertise"
[MicroSponsor](https://example.com) is a tiny classified placement for builders.
---
[Toolmaker Jobs](https://example.com) lists small teams hiring practical software people.
:::
```

Render the selected template before real sends:

```bash
email template render --subject "Subject" --body-file draft.md --out-dir rendered --json
```

Preview the React Email templates while editing:

```bash
pnpm newsletter:email:preview
```

## HTTP API

Admin API routes require either:

```http
Authorization: Bearer $API_TOKEN
```

or:

```http
x-api-token: $API_TOKEN
```

Public routes:

- `GET /health`
- `GET /healthz`
- `GET /readyz`
- `GET /t/open/:token`
- `GET /t/click/:token`
- `GET /unsubscribe/:token` via `packages/web`
- `POST /unsubscribe/:token` via `packages/web`, forwarded to the API
- `POST /webhooks/ses/:secret`

Protected routes:

- `POST /api/subscribe`
- `GET /api/doctor`
- `GET /api/ops/checklist`
- `POST /api/ops/recover-stuck`
- `GET /api/contacts/export`
- `POST /api/contacts/import`
- `POST /api/drafts`
- `GET /api/templates`
- `POST /api/templates/render`
- `POST /api/broadcasts`
- `POST /api/broadcasts/preview-plan`
- `POST /api/canaries`
- `GET /api/canaries/:id`
- `POST /api/canaries/:id/promote`
- `GET /api/broadcasts`
- `GET /api/broadcasts/:id`
- `GET /api/broadcasts/:id/stats`
- `GET /api/broadcasts/:id/links`
- `GET /api/broadcasts/:id/events`
- `POST /api/broadcasts/:id/pause`
- `POST /api/broadcasts/:id/resume`
- `POST /api/broadcasts/:id/cancel`
- `GET /api/contacts/:identity/analytics`
- `POST /api/contacts/:identity/tags`
- `GET /api/contacts/:identity/tags`
- `DELETE /api/contacts/:identity/tags/:tag`
- `POST /api/contacts/:identity/external-ids`
- `GET /api/external-ids/:provider/:externalId/contact`
- `GET /api/contacts/:identity/value`
- `POST /api/purchases`
- `POST /api/audience/preview`
- `GET /api/contacts/:identity/links`
- `GET /api/contacts/:identity/topics`
- `GET /api/analytics/links`
- `GET /api/analytics/link-summary`
- `POST /api/analytics/rebuild-rollups`
- `POST /api/tests`
- `POST /api/tests/ses-simulator`
- `POST /api/messages/retry-failed`
- `POST /api/send-due`

## MCP

Run:

```bash
email mcp serve
```

The MCP server exposes contact, draft, broadcast, canary, template, analytics,
and operations tools over the same core logic as the CLI/API.

## Delivery

Default delivery is warm-first and spread over time:

1. Previous clickers.
2. Previous openers.
3. Recent subscribers.
4. Cold contacts.

Messages are claimed in Postgres before sending. The Postgres store uses
`FOR UPDATE SKIP LOCKED`, so multiple workers can run without claiming the same
message.

Use canary cohorts before full-list sends:

```bash
email canary create --draft-id <draft_id> --steps 50,500,2000,all --json
email canary promote <canary_id> --json
```

Canary steps are cumulative. `50,500,2000` means add the next 450, then the next
1,500, not resend earlier cohorts.

## Tracking And Analytics

Raw events are preserved. Rollups are maintained for fast agent queries:

- human clicks
- bot/scanner clicks
- repeated clicks on the same link
- unique human contacts per link
- contact-level link interests
- topic/tag/sponsor rollups
- URL host and UTM metadata where present
- opens, if open tracking is enabled

Scanner traffic is recorded separately as bot engagement and does not affect
human open/click stats or warm-first ordering.

Draft link metadata can attach topics, tags, and sponsor data:

```json
{
  "links": [
    {
      "index": 0,
      "topics": ["ai-agents", "developer-tools"],
      "tags": ["advertiser"],
      "sponsor": "acme"
    }
  ]
}
```

## Unsubscribes And Suppressions

Unsubscribe links require a confirming `POST`; a scanner `GET` only gets the
confirmation page. Unsubscribes set contact consent state to `unsubscribed`.
They are allowed to explicitly resubscribe later.

Suppressions are hard safety blocks for provider hard bounces, complaints,
manual blocks, invalid emails, and blocked domains. Sending checks both contact
status and active suppressions.

## SES SNS Webhooks

SES SNS webhooks:

- require the path secret: `/webhooks/ses/:secret`
- verify AWS SNS signatures
- enforce the optional topic allowlist
- confirm SNS subscription requests through allowed HTTPS hosts
- normalize bounces and complaints into provider events

## Docker

```bash
docker compose -f apps/newsletter/docker-compose.yml up --build
```

The default compose stack runs Postgres, the Hono API, and the Astro public web
service. The sender worker is behind an explicit profile so a normal deploy does
not start sending mail:

```bash
docker compose -f apps/newsletter/docker-compose.yml --profile sender up --build worker
```

Only start the `sender` profile after `doctor`, `ops checklist`, preview-plan,
SNS/webhook checks, and canary setup are complete.

## Public Web Customization

The open-source surface is deliberately simple: edit or replace `packages/web`.
There is no template engine yet. The shipped Astro app is the override surface:

- `src/styles/globals.css`: design tokens, fonts, and Tailwind theme values.
- `src/layouts/Layout.astro`: metadata and outer page chrome.
- `src/pages/unsubscribe/[token].astro`: unsubscribe confirmation UI.
- `public/fonts`: local font assets.

Keep the API as the source of truth. If a public page needs to mutate state,
have it call `EMAIL_API_INTERNAL_URL` instead of importing store/core logic into
Astro.
