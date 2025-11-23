# Multi-Profile GitHub Stats Guide

## Overview

This project now supports aggregating statistics from multiple GitHub profiles into a single card! This is perfect for developers who maintain multiple GitHub accounts (personal, work, freelance, etc.).

## Setup Instructions

### 1. Create Personal Access Tokens (PATs)

For each GitHub account you want to track, create a Personal Access Token:

1. Log into each GitHub account
2. Go to [GitHub Token Settings](https://github.com/settings/tokens/new)
3. Create a new token with the following scopes:
   - `public_repo` (for public repository data)
   - `read:user` (for user profile data)
4. Copy each token immediately (you won't be able to see it again!)

### 2. Configure Environment Variables

In your Vercel deployment or local `.env` file, add your tokens as:

```env
PAT_1=ghp_your_first_token_here
PAT_2=ghp_your_second_token_here
PAT_3=ghp_your_third_token_here
```

**Note:** The system automatically detects all `PAT_*` environment variables and rotates through them to handle rate limiting.

## Usage

### Multi-Profile Stats Card

To display combined stats from all your GitHub profiles:

```markdown
![Multi Profile Stats](https://your-vercel-domain.vercel.app/api/multi-stats?usernames=username1,username2,username3&include_all_commits=true&count_private=true&theme=tokyonight)
```

#### Parameters:
- `usernames` (required): Comma-separated list of GitHub usernames
- `include_all_commits`: Include all commits (default: false)
- `count_private`: Count private contributions (default: false)
- `theme`: Card theme (default: default)
- All other parameters from the standard stats card are supported

### Multi-Profile Top Languages Card

To display combined top languages from all your profiles:

```markdown
![Multi Profile Top Langs](https://your-vercel-domain.vercel.app/api/multi-top-langs?usernames=username1,username2,username3&layout=compact&langs_count=8&theme=tokyonight)
```

#### Parameters:
- `usernames` (required): Comma-separated list of GitHub usernames
- `layout`: Layout style (compact, normal, donut, donut-vertical, pie)
- `langs_count`: Number of languages to display (default: 5)
- `theme`: Card theme (default: default)
- All other parameters from the standard top languages card are supported

## Example: Your 3 Profiles

Replace `username1`, `username2`, and `username3` with your actual GitHub usernames:

```markdown
# Combined GitHub Stats

![GitHub Stats](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-stats?usernames=aleksaToljic,yourSecondProfile,yourThirdProfile&include_all_commits=true&count_private=true&theme=tokyonight)

![Top Langs](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-top-langs?usernames=aleksaToljic,yourSecondProfile,yourThirdProfile&layout=compact&langs_count=8&theme=tokyonight)
```

## Features

### Automatic Stats Aggregation
The system automatically aggregates:
- ✅ Total commits across all profiles
- ✅ Total PRs and merged PRs
- ✅ Total issues (open + closed)
- ✅ Total stars across all repositories
- ✅ Total reviews
- ✅ Repositories contributed to
- ✅ Total repositories
- ✅ Total followers
- ✅ Combined rank based on aggregated stats

### Language Statistics Aggregation
For top languages, the system:
- ✅ Combines all languages from all profiles
- ✅ Merges duplicate languages
- ✅ Calculates weighted totals based on code size and count

### Rate Limit Handling
The system intelligently:
- 🔄 Rotates through all available PATs (PAT_1, PAT_2, PAT_3, etc.)
- 🔄 Automatically switches to next PAT if one hits rate limit
- 🔄 Handles bad credentials gracefully

## Local Testing

To test locally:

1. Create a `.env` file in the project root:
```env
PAT_1=your_first_token
PAT_2=your_second_token
PAT_3=your_third_token
```

2. Start the Express server:
```bash
npm install
node express.js
```

3. Access your multi-profile stats at:
   - `http://localhost:9000/multi-stats?usernames=user1,user2,user3`
   - `http://localhost:9000/multi-top-langs?usernames=user1,user2,user3`

## Available Themes

You can use any of the built-in themes:
- `default`, `dark`, `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`, and many more!

See all themes in the main README or [themes documentation](./themes/README.md).

## Tips

1. **Privacy**: Each GitHub account needs its own PAT. Don't share PATs between accounts.

2. **Token Security**: Never commit your `.env` file or expose your PATs in public repositories.

3. **Vercel Setup**: In Vercel, add environment variables in Project Settings → Environment Variables.

4. **Rate Limits**: With 3 PATs, you get 3x the API rate limit (15,000 requests/hour total with authenticated requests).

5. **Custom Titles**: Use `custom_title` parameter to customize the card title:
   ```markdown
   ![Stats](https://your-domain.vercel.app/api/multi-stats?usernames=user1,user2,user3&custom_title=My%20Combined%20Stats)
   ```

## Troubleshooting

### "No GitHub API tokens found"
- Make sure you have at least `PAT_1` set in your environment variables

### "Username is blacklisted"
- One of your usernames might be in the blacklist
- Check `src/common/blacklist.js`

### Stats not updating
- GitHub caches the cards for 1 day by default
- You can adjust `cache_seconds` parameter
- Clear your browser cache to see immediate updates

## Support

If you encounter issues:
1. Check the Express server logs
2. Verify all PATs are valid and have correct permissions
3. Ensure usernames are spelled correctly (comma-separated, no spaces)

---

Happy coding! 🚀

