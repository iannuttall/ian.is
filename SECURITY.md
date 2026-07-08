# Security

## Reporting

Do not open a public issue for a suspected vulnerability.

Email security reports to Ian Nuttall using the contact details on `https://ian.is`.
Include the affected app/package, reproduction steps, and the impact.

## Public Repo Rules

- Production secrets must never be committed.
- Use ignored local env files for development:
  - `.env`
  - `.env.*`
  - `.dev.vars`
  - `.dev.vars.*`
- Checked-in example env files must contain only empty or placeholder values.
- Production secrets belong in GitHub Actions secrets, Cloudflare Worker
  secrets, VPS `.env.production`, or another managed secret store.
- Cloudflare route/DNS changes are a go-live action. Do not attach `ian.is/*`
  to a Worker without explicit approval.

## Local Checks

Before making the repository public or pushing sensitive changes:

```sh
pnpm security:check
pnpm ian site check
pnpm ian check newsletter
```

`pnpm security:check` runs:

- `pnpm audit`
- `gitleaks detect --source . --redact --no-banner --verbose`

Install `gitleaks` locally if needed:

```sh
brew install gitleaks
```
