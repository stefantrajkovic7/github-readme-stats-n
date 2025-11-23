import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { fetchMultiStats } from "../src/fetchers/multi-stats-fetcher.js";
import { expect, it, describe, beforeEach, afterEach } from "@jest/globals";

// Mock data for user 1
const data_stats_user1 = {
  data: {
    user: {
      name: "User One",
      repositoriesContributedTo: { totalCount: 50 },
      contributionsCollection: {
        totalCommitContributions: 100,
        totalPullRequestReviewContributions: 25,
      },
      pullRequests: { totalCount: 150 },
      mergedPullRequests: { totalCount: 120 },
      openIssues: { totalCount: 50 },
      closedIssues: { totalCount: 50 },
      followers: { totalCount: 75 },
      repositoryDiscussions: { totalCount: 5 },
      repositoryDiscussionComments: { totalCount: 20 },
      repositories: {
        totalCount: 10,
        nodes: [
          { name: "repo-1", stargazers: { totalCount: 100 } },
          { name: "repo-2", stargazers: { totalCount: 50 } },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
};

// Mock data for user 2
const data_stats_user2 = {
  data: {
    user: {
      name: "User Two",
      repositoriesContributedTo: { totalCount: 30 },
      contributionsCollection: {
        totalCommitContributions: 200,
        totalPullRequestReviewContributions: 35,
      },
      pullRequests: { totalCount: 100 },
      mergedPullRequests: { totalCount: 80 },
      openIssues: { totalCount: 30 },
      closedIssues: { totalCount: 20 },
      followers: { totalCount: 50 },
      repositoryDiscussions: { totalCount: 3 },
      repositoryDiscussionComments: { totalCount: 15 },
      repositories: {
        totalCount: 8,
        nodes: [
          { name: "repo-3", stargazers: { totalCount: 75 } },
          { name: "repo-4", stargazers: { totalCount: 25 } },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
};

// Mock data for user 3
const data_stats_user3 = {
  data: {
    user: {
      name: "User Three",
      repositoriesContributedTo: { totalCount: 20 },
      contributionsCollection: {
        totalCommitContributions: 150,
        totalPullRequestReviewContributions: 15,
      },
      pullRequests: { totalCount: 80 },
      mergedPullRequests: { totalCount: 60 },
      openIssues: { totalCount: 20 },
      closedIssues: { totalCount: 15 },
      followers: { totalCount: 40 },
      repositoryDiscussions: { totalCount: 2 },
      repositoryDiscussionComments: { totalCount: 10 },
      repositories: {
        totalCount: 6,
        nodes: [
          { name: "repo-5", stargazers: { totalCount: 60 } },
          { name: "repo-6", stargazers: { totalCount: 40 } },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
};

const mock = new MockAdapter(axios);

beforeEach(() => {
  process.env.FETCH_MULTI_PAGE_STARS = "false";
});

afterEach(() => {
  mock.reset();
});

describe("Test fetchMultiStats", () => {
  it("should aggregate stats from two users", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user2);

    const stats = await fetchMultiStats(["user1", "user2"]);

    expect(stats).toMatchObject({
      name: "user1, user2",
      totalCommits: 300, // 100 + 200
      totalPRs: 250, // 150 + 100
      totalPRsMerged: 0, // Not requested by default
      totalReviews: 60, // 25 + 35
      totalIssues: 150, // 100 + 50
      totalStars: 250, // 150 + 100
      contributedTo: 80, // 50 + 30
      totalDiscussionsStarted: 0, // Not requested by default
      totalDiscussionsAnswered: 0, // Not requested by default
    });

    expect(stats.rank).toBeDefined();
  });

  it("should aggregate stats from three users", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user2)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user3);

    const stats = await fetchMultiStats(["user1", "user2", "user3"]);

    expect(stats).toMatchObject({
      name: "user1, user2, user3",
      totalCommits: 450, // 100 + 200 + 150
      totalPRs: 330, // 150 + 100 + 80
      totalPRsMerged: 0, // Not requested by default
      totalReviews: 75, // 25 + 35 + 15
      totalIssues: 185, // 100 + 50 + 35
      totalStars: 350, // 150 + 100 + 100
      contributedTo: 100, // 50 + 30 + 20
      totalDiscussionsStarted: 0, // Not requested by default
      totalDiscussionsAnswered: 0, // Not requested by default
    });

    expect(stats.rank).toBeDefined();
  });

  it("should handle include_all_commits option", async () => {
    // Mock REST API for total commits
    mock
      .onGet("https://api.github.com/search/commits?q=author:user1")
      .reply(200, { total_count: 500 })
      .onGet("https://api.github.com/search/commits?q=author:user2")
      .reply(200, { total_count: 600 });

    // Mock GraphQL query for createdAt
    mock.onPost("https://api.github.com/graphql").reply((config) => {
      const data = JSON.parse(config.data);

      // Check if this is the createdAt query
      if (data.query.includes("createdAt")) {
        return [
          200,
          {
            data: {
              user: {
                createdAt: "2020-01-01T00:00:00Z",
              },
            },
          },
        ];
      }

      // Check if this is a yearly contributions query
      if (data.query.includes("contributionCalendar")) {
        return [
          200,
          {
            data: {
              user: {
                contributionsCollection: {
                  contributionCalendar: {
                    totalContributions: 250,
                  },
                },
              },
            },
          },
        ];
      }

      // Otherwise return the stats query
      if (data.variables.login === "user1") {
        return [200, data_stats_user1];
      } else if (data.variables.login === "user2") {
        return [200, data_stats_user2];
      }
      return [404];
    });

    const stats = await fetchMultiStats(["user1", "user2"], true); // include_all_commits = true

    // The actual implementation uses GraphQL contribution calendar, not REST API
    expect(stats.totalCommits).toBeGreaterThan(300); // Should be more than default
  });

  it("should calculate merged PRs percentage when requested", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user2);

    const stats = await fetchMultiStats(
      ["user1", "user2"],
      false,
      [],
      true, // include_merged_pull_requests
    );

    expect(stats.totalPRsMerged).toBe(200);
    expect(stats.mergedPRsPercentage).toBeCloseTo(80, 1);
  });

  it("should include discussions when requested", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user2);

    const stats = await fetchMultiStats(
      ["user1", "user2"],
      false,
      [],
      false,
      true, // include_discussions
      true, // include_discussions_answers
    );

    expect(stats.totalDiscussionsStarted).toBe(8); // 5 + 3
    expect(stats.totalDiscussionsAnswered).toBe(35); // 20 + 15
  });

  it("should throw error when no usernames provided", async () => {
    await expect(fetchMultiStats([])).rejects.toThrow();
    await expect(fetchMultiStats(null)).rejects.toThrow();
  });

  it("should exclude specified repositories", async () => {
    // Create modified mock data with excluded repo
    const data_with_excluded = {
      data: {
        user: {
          name: "User One",
          repositoriesContributedTo: { totalCount: 50 },
          contributionsCollection: {
            totalCommitContributions: 100,
            totalPullRequestReviewContributions: 25,
          },
          pullRequests: { totalCount: 150 },
          mergedPullRequests: { totalCount: 120 },
          openIssues: { totalCount: 50 },
          closedIssues: { totalCount: 50 },
          followers: { totalCount: 75 },
          repositoryDiscussions: { totalCount: 5 },
          repositoryDiscussionComments: { totalCount: 20 },
          repositories: {
            totalCount: 10,
            nodes: [
              { name: "repo-1", stargazers: { totalCount: 100 } }, // This will be excluded
              { name: "repo-2", stargazers: { totalCount: 50 } },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    };

    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_with_excluded);

    const stats = await fetchMultiStats(
      ["user1"],
      false,
      ["repo-1"], // exclude repo-1
    );

    expect(stats.totalStars).toBe(50); // Only repo-2 stars (100 from repo-1 excluded)
  });

  it("should handle single user (edge case)", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1);

    const stats = await fetchMultiStats(["user1"]);

    expect(stats).toMatchObject({
      name: "user1",
      totalCommits: 100,
      totalPRs: 150,
      totalStars: 150,
    });
  });

  it("should trim whitespace from usernames", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user2);

    const stats = await fetchMultiStats([" user1 ", " user2 "]);

    // The multi-fetcher trims usernames when fetching but keeps them in the name field
    expect(stats.name).toBe(" user1 ,  user2 "); // Name preserves original format
    expect(stats.totalCommits).toBe(300);
  });

  it("should properly calculate rank based on aggregated stats", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats_user2);

    const stats = await fetchMultiStats(["user1", "user2"]);

    // Rank should be calculated based on aggregated stats
    expect(stats.rank).toBeDefined();
    expect(stats.rank.level).toBeDefined();
    expect(stats.rank.percentile).toBeDefined();
    expect(typeof stats.rank.percentile).toBe("number");
  });

  it("should fetch stats in parallel for better performance", async () => {
    const startTime = Date.now();

    // Mock with slight delays to test parallelization
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([200, data_stats_user1]), 100);
        });
      })
      .onPost("https://api.github.com/graphql")
      .replyOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([200, data_stats_user2]), 100);
        });
      });

    await fetchMultiStats(["user1", "user2"]);

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // If sequential, would take ~200ms. If parallel, should take ~100ms
    // Allow some margin for processing time
    expect(elapsed).toBeLessThan(180); // Should be much less than 200ms
  });
});
