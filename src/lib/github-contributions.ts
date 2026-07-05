import contributions from "@/generated/github-contributions.json";

export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: string;
  weekday: number;
};

export const githubContributions = contributions;

export const contributionLevelClass: Record<ContributionLevel, string> = {
  NONE: "bg-[var(--github-contribution-none)]",
  FIRST_QUARTILE: "bg-[var(--github-contribution-first)]",
  SECOND_QUARTILE: "bg-[var(--github-contribution-second)]",
  THIRD_QUARTILE: "bg-[var(--github-contribution-third)]",
  FOURTH_QUARTILE: "bg-[var(--github-contribution-fourth)]",
};

export const contributionNumberFormatter = new Intl.NumberFormat("en-US");

export const contributionDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const contributionMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

export const contributionDays = contributions.weeks.flatMap((week) => week.contributionDays) as ContributionDay[];

export function formatContributionCount(count: number) {
  return `${contributionNumberFormatter.format(count)} ${count === 1 ? "contribution" : "contributions"}`;
}

export function formatContributionDate(date: string) {
  return contributionDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function getRecentContributionDays(count: number) {
  return contributionDays.slice(-count);
}
