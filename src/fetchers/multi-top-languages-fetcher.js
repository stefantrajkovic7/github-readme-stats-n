// @ts-check
import { fetchTopLanguages } from "./top-languages-fetcher.js";
import { MissingParamError } from "../common/utils.js";

/**
 * @typedef {import("./types").TopLangData} TopLangData Top languages data.
 */

/**
 * Fetch and aggregate top languages for multiple GitHub usernames.
 *
 * @param {string[]} usernames Array of GitHub usernames.
 * @param {string[]} exclude_repo List of repositories to exclude.
 * @param {number} size_weight Weightage to be given to size.
 * @param {number} count_weight Weightage to be given to count.
 * @returns {Promise<TopLangData>} Aggregated top languages data.
 */
const fetchMultiTopLanguages = async (
  usernames,
  exclude_repo = [],
  size_weight = 1,
  count_weight = 0,
) => {
  if (!usernames || usernames.length === 0) {
    throw new MissingParamError(["usernames"]);
  }

  // Fetch top languages for all usernames in parallel
  const languagesPromises = usernames.map((username) =>
    fetchTopLanguages(username.trim(), exclude_repo, size_weight, count_weight),
  );

  const allLanguages = await Promise.all(languagesPromises);

  // Aggregate all languages
  const aggregatedLanguages = {};

  allLanguages.forEach((languages) => {
    Object.keys(languages).forEach((langName) => {
      const lang = languages[langName];

      if (aggregatedLanguages[langName]) {
        // Language already exists, add the size and count
        // Note: size is already weighted by fetchTopLanguages, so we just sum
        aggregatedLanguages[langName].size += lang.size;
        aggregatedLanguages[langName].count += lang.count;
      } else {
        // New language, add it
        aggregatedLanguages[langName] = {
          name: lang.name,
          color: lang.color,
          size: lang.size,
          count: lang.count,
        };
      }
    });
  });

  // Note: We don't reapply weights here because fetchTopLanguages already applies them.
  // The sizes are already weighted, so we just sort by the aggregated weighted sizes.

  // Sort by size
  const sortedLanguages = Object.keys(aggregatedLanguages)
    .sort((a, b) => aggregatedLanguages[b].size - aggregatedLanguages[a].size)
    .reduce((result, key) => {
      result[key] = aggregatedLanguages[key];
      return result;
    }, {});

  return sortedLanguages;
};

export { fetchMultiTopLanguages };
export default fetchMultiTopLanguages;
