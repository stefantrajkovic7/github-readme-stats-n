import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { fetchMultiTopLanguages } from "../src/fetchers/multi-top-languages-fetcher.js";
import { expect, it, describe, afterEach } from "@jest/globals";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

// Mock data for user 1 languages
const data_langs_user1 = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "repo-1",
            languages: {
              edges: [
                { size: 1000, node: { color: "#f1e05a", name: "JavaScript" } },
                { size: 500, node: { color: "#e34c26", name: "HTML" } },
              ],
            },
          },
          {
            name: "repo-2",
            languages: {
              edges: [
                { size: 800, node: { color: "#f1e05a", name: "JavaScript" } },
                { size: 200, node: { color: "#563d7c", name: "CSS" } },
              ],
            },
          },
        ],
      },
    },
  },
};

// Mock data for user 2 languages
const data_langs_user2 = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "repo-3",
            languages: {
              edges: [
                { size: 1200, node: { color: "#3572A5", name: "Python" } },
                { size: 300, node: { color: "#f1e05a", name: "JavaScript" } },
              ],
            },
          },
          {
            name: "repo-4",
            languages: {
              edges: [
                { size: 600, node: { color: "#3572A5", name: "Python" } },
                { size: 400, node: { color: "#00ADD8", name: "Go" } },
              ],
            },
          },
        ],
      },
    },
  },
};

// Mock data for user 3 languages
const data_langs_user3 = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "repo-5",
            languages: {
              edges: [
                { size: 900, node: { color: "#00ADD8", name: "Go" } },
                { size: 100, node: { color: "#e34c26", name: "HTML" } },
              ],
            },
          },
          {
            name: "repo-6",
            languages: {
              edges: [
                { size: 700, node: { color: "#b07219", name: "Java" } },
                { size: 300, node: { color: "#563d7c", name: "CSS" } },
              ],
            },
          },
        ],
      },
    },
  },
};

describe("Test fetchMultiTopLanguages", () => {
  it("should aggregate languages from two users", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user2);

    const languages = await fetchMultiTopLanguages(["user1", "user2"]);

    // JavaScript: 1000 + 800 + 300 = 2100
    // Python: 1200 + 600 = 1800
    // HTML: 500
    // CSS: 200
    // Go: 400

    expect(languages).toBeDefined();
    expect(Object.keys(languages)).toContain("JavaScript");
    expect(Object.keys(languages)).toContain("Python");
    expect(Object.keys(languages)).toContain("HTML");
    expect(Object.keys(languages)).toContain("CSS");
    expect(Object.keys(languages)).toContain("Go");

    expect(languages.JavaScript.size).toBe(2100);
    expect(languages.Python.size).toBe(1800);
    expect(languages.HTML.size).toBe(500);
    expect(languages.CSS.size).toBe(200);
    expect(languages.Go.size).toBe(400);
  });

  it("should aggregate languages from three users", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user2)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user3);

    const languages = await fetchMultiTopLanguages(["user1", "user2", "user3"]);

    // JavaScript: 1000 + 800 + 300 = 2100
    // Python: 1200 + 600 = 1800
    // Go: 400 + 900 = 1300
    // Java: 700
    // HTML: 500 + 100 = 600
    // CSS: 200 + 300 = 500

    expect(languages.JavaScript.size).toBe(2100);
    expect(languages.Python.size).toBe(1800);
    expect(languages.Go.size).toBe(1300);
    expect(languages.Java.size).toBe(700);
    expect(languages.HTML.size).toBe(600);
    expect(languages.CSS.size).toBe(500);
  });

  it("should sort languages by aggregated size", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user2);

    const languages = await fetchMultiTopLanguages(["user1", "user2"]);

    const languageNames = Object.keys(languages);
    const languageSizes = Object.values(languages).map((lang) => lang.size);

    // Check that languages are sorted in descending order by size
    for (let i = 0; i < languageSizes.length - 1; i++) {
      expect(languageSizes[i]).toBeGreaterThanOrEqual(languageSizes[i + 1]);
    }

    // JavaScript should be first (largest)
    expect(languageNames[0]).toBe("JavaScript");
  });

  it("should properly merge duplicate languages across users", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user2);

    const languages = await fetchMultiTopLanguages(["user1", "user2"]);

    // JavaScript appears in both users
    expect(languages.JavaScript).toBeDefined();
    expect(languages.JavaScript.size).toBe(2100); // 1800 from user1 + 300 from user2
    expect(languages.JavaScript.count).toBe(3); // 2 repos from user1 + 1 from user2
  });

  it("should preserve language colors", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1);

    const languages = await fetchMultiTopLanguages(["user1"]);

    expect(languages.JavaScript.color).toBe("#f1e05a");
    expect(languages.HTML.color).toBe("#e34c26");
    expect(languages.CSS.color).toBe("#563d7c");
  });

  it("should handle exclude_repo parameter", async () => {
    const data_with_excluded = {
      data: {
        user: {
          repositories: {
            nodes: [
              {
                name: "excluded-repo",
                languages: {
                  edges: [
                    {
                      size: 5000,
                      node: { color: "#f1e05a", name: "JavaScript" },
                    },
                  ],
                },
              },
              {
                name: "included-repo",
                languages: {
                  edges: [
                    { size: 1000, node: { color: "#3572A5", name: "Python" } },
                  ],
                },
              },
            ],
          },
        },
      },
    };

    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_with_excluded);

    const languages = await fetchMultiTopLanguages(
      ["user1"],
      ["excluded-repo"], // exclude this repo
    );

    // JavaScript from excluded-repo should not be counted
    expect(languages.JavaScript).toBeUndefined();
    expect(languages.Python).toBeDefined();
    expect(languages.Python.size).toBe(1000);
  });

  it("should handle size_weight parameter", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1);

    const languages = await fetchMultiTopLanguages(
      ["user1"],
      [],
      2, // size_weight = 2
      0, // count_weight = 0
    );

    // With size_weight = 2: size = Math.pow(size, 2) * Math.pow(count, 0)
    // JavaScript: Math.pow(1000 + 800, 2) * 1 = Math.pow(1800, 2) = 3,240,000
    expect(languages.JavaScript.size).toBe(3240000);
  });

  it("should handle count_weight parameter", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1);

    const languages = await fetchMultiTopLanguages(
      ["user1"],
      [],
      1, // size_weight = 1
      1, // count_weight = 1
    );

    // With size_weight = 1 and count_weight = 1:
    // size = Math.pow(size, 1) * Math.pow(count, 1)
    // JavaScript: Math.pow(1800, 1) * Math.pow(2, 1) = 1800 * 2 = 3600
    expect(languages.JavaScript.size).toBe(3600);
  });

  it("should throw error when no usernames provided", async () => {
    await expect(fetchMultiTopLanguages([])).rejects.toThrow();
    await expect(fetchMultiTopLanguages(null)).rejects.toThrow();
  });

  it("should handle single user (edge case)", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1);

    const languages = await fetchMultiTopLanguages(["user1"]);

    expect(languages.JavaScript.size).toBe(1800); // 1000 + 800
    expect(languages.HTML.size).toBe(500);
    expect(languages.CSS.size).toBe(200);
  });

  it("should trim whitespace from usernames", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user2);

    const languages = await fetchMultiTopLanguages([" user1 ", " user2 "]);

    // Should successfully fetch despite whitespace
    expect(languages).toBeDefined();
    expect(languages.JavaScript).toBeDefined();
  });

  it("should fetch languages in parallel for better performance", async () => {
    const startTime = Date.now();

    // Mock with slight delays to test parallelization
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([200, data_langs_user1]), 100);
        });
      })
      .onPost("https://api.github.com/graphql")
      .replyOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([200, data_langs_user2]), 100);
        });
      });

    await fetchMultiTopLanguages(["user1", "user2"]);

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // If sequential, would take ~200ms. If parallel, should take ~100ms
    // Allow some margin for processing time
    expect(elapsed).toBeLessThan(180);
  });

  it("should handle empty repositories", async () => {
    const data_empty = {
      data: {
        user: {
          repositories: {
            nodes: [],
          },
        },
      },
    };

    mock.onPost("https://api.github.com/graphql").replyOnce(200, data_empty);

    const languages = await fetchMultiTopLanguages(["user1"]);

    expect(Object.keys(languages).length).toBe(0);
  });

  it("should correctly aggregate language counts", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user1)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_langs_user2);

    const languages = await fetchMultiTopLanguages(["user1", "user2"]);

    // JavaScript appears in 3 repos total (2 from user1, 1 from user2)
    expect(languages.JavaScript.count).toBe(3);
    // Python appears in 2 repos (both from user2)
    expect(languages.Python.count).toBe(2);
  });
});
