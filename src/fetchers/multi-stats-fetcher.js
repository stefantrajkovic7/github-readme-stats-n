// @ts-check
import { fetchStats } from "./stats-fetcher.js";
import { MissingParamError } from "../common/utils.js";

/**
 * @typedef {import("./types").StatsData} StatsData Stats data.
 */

/**
 * Fetch and aggregate stats for multiple GitHub usernames.
 *
 * @param {string[]} usernames Array of GitHub usernames.
 * @param {boolean} include_all_commits Include all commits.
 * @param {string[]} exclude_repo Repositories to exclude.
 * @param {boolean} include_merged_pull_requests Include merged pull requests.
 * @param {boolean} include_discussions Include discussions.
 * @param {boolean} include_discussions_answers Include discussions answers.
 * @returns {Promise<StatsData>} Aggregated stats data.
 */
const fetchMultiStats = async (
  usernames,
  include_all_commits = false,
  exclude_repo = [],
  include_merged_pull_requests = false,
  include_discussions = false,
  include_discussions_answers = false,
) => {
  if (!usernames || usernames.length === 0) {
    throw new MissingParamError(["usernames"]);
  }

  // Fetch stats for all usernames in parallel
  const statsPromises = usernames.map((username) =>
    fetchStats(
      username.trim(),
      include_all_commits,
      exclude_repo,
      include_merged_pull_requests,
      include_discussions,
      include_discussions_answers,
    ),
  );

  const allStats = await Promise.all(statsPromises);

  // Aggregate all stats
  const aggregatedStats = {
    name: usernames.join(", "),
    totalPRs: 0,
    totalPRsMerged: 0,
    mergedPRsPercentage: 0,
    totalReviews: 0,
    totalCommits: 0,
    totalIssues: 0,
    totalStars: 0,
    totalDiscussionsStarted: 0,
    totalDiscussionsAnswered: 0,
    contributedTo: 0,
    rank: { level: "C", percentile: 100 },
  };

  // Sum up all the stats
  allStats.forEach((stats) => {
    aggregatedStats.totalPRs += stats.totalPRs;
    aggregatedStats.totalPRsMerged += stats.totalPRsMerged;
    aggregatedStats.totalReviews += stats.totalReviews;
    aggregatedStats.totalCommits += stats.totalCommits;
    aggregatedStats.totalIssues += stats.totalIssues;
    aggregatedStats.totalStars += stats.totalStars;
    aggregatedStats.totalDiscussionsStarted += stats.totalDiscussionsStarted;
    aggregatedStats.totalDiscussionsAnswered += stats.totalDiscussionsAnswered;
    aggregatedStats.contributedTo += stats.contributedTo;
  });

  // Calculate merged PRs percentage
  if (include_merged_pull_requests && aggregatedStats.totalPRs > 0) {
    aggregatedStats.mergedPRsPercentage =
      (aggregatedStats.totalPRsMerged / aggregatedStats.totalPRs) * 100;
  }

  // Calculate aggregate rank based on total stats
  // We'll use the best rank among all accounts or calculate based on aggregated stats
  const { calculateRank } = await import("../calculateRank.js");

  // For rank calculation, we'll use aggregated values
  aggregatedStats.rank = calculateRank({
    all_commits: include_all_commits,
    commits: aggregatedStats.totalCommits,
    prs: aggregatedStats.totalPRs,
    reviews: aggregatedStats.totalReviews,
    issues: aggregatedStats.totalIssues,
    repos: allStats.reduce((sum, stats) => sum + (stats.totalRepos || 0), 0),
    stars: aggregatedStats.totalStars,
    followers: allStats.reduce(
      (sum, stats) => sum + (stats.totalFollowers || 0),
      0,
    ),
  });

  return aggregatedStats;
};

export { fetchMultiStats };
export default fetchMultiStats;
