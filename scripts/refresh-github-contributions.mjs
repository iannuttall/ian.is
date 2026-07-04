import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const username = process.env.GITHUB_CONTRIBUTIONS_USERNAME ?? "iannuttall";
const token = process.env.GITHUB_CONTRIBUTIONS_TOKEN ?? process.env.GITHUB_TOKEN;
const outputPath = path.join(process.cwd(), "src/generated/github-contributions.json");
const now = process.env.GITHUB_CONTRIBUTIONS_NOW
  ? new Date(process.env.GITHUB_CONTRIBUTIONS_NOW)
  : new Date();

if (!token) {
  throw new Error(
    "Missing GitHub token. Set GITHUB_CONTRIBUTIONS_TOKEN or GITHUB_TOKEN.",
  );
}

const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
const startDate = new Date(endDate);
startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
startDate.setUTCHours(0, 0, 0, 0);

const query = /* GraphQL */ `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              weekday
            }
          }
        }
      }
    }
  }
`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
    "user-agent": "ian.is-data-refresh",
  },
  body: JSON.stringify({
    query,
    variables: {
      login: username,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    },
  }),
});

const payload = await response.json();

if (!response.ok || payload.errors?.length) {
  throw new Error(
    `GitHub contributions fetch failed: ${JSON.stringify(payload.errors ?? payload)}`,
  );
}

const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;

if (!calendar) {
  throw new Error(`GitHub user not found or contribution calendar unavailable: ${username}`);
}

const days = calendar.weeks.flatMap((week) => week.contributionDays);
const data = {
  username: payload.data.user.login,
  range: {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10),
  },
  totalContributions: calendar.totalContributions,
  weeks: calendar.weeks,
  days,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(`${outputPath}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
await rename(`${outputPath}.tmp`, outputPath);

console.log(
  `Wrote ${days.length} GitHub contribution days for ${username} (${data.totalContributions.toLocaleString("en-US")} total) to ${outputPath}`,
);
