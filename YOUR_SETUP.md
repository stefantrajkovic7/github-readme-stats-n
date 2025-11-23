# Your Personal Multi-Profile Setup

## Quick Start for Your 3 GitHub Accounts

### Step 1: Get Your PATs Ready

You need to create 3 Personal Access Tokens (one for each GitHub account):

1. **First GitHub Account**
   - Go to: https://github.com/settings/tokens/new
   - Name: "GitHub Stats - Account 1"
   - Scopes: `public_repo`, `read:user`
   - Generate and copy: `PAT_1=ghp_xxxxxxxxxxxxx`

2. **Second GitHub Account**
   - Switch to your second account
   - Go to: https://github.com/settings/tokens/new
   - Name: "GitHub Stats - Account 2"
   - Scopes: `public_repo`, `read:user`
   - Generate and copy: `PAT_2=ghp_xxxxxxxxxxxxx`

3. **Third GitHub Account**
   - Switch to your third account
   - Go to: https://github.com/settings/tokens/new
   - Name: "GitHub Stats - Account 3"
   - Scopes: `public_repo`, `read:user`
   - Generate and copy: `PAT_3=ghp_xxxxxxxxxxxxx`

### Step 2: Add PATs to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your `github-readme-stats` project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:
   ```
   Name: PAT_1
   Value: ghp_your_first_token

   Name: PAT_2
   Value: ghp_your_second_token

   Name: PAT_3
   Value: ghp_your_third_token
   ```
5. Click **Save**
6. Redeploy your project

### Step 3: Update Your GitHub Profile README

Replace your current stats badges with these:

```markdown
## 📊 Combined GitHub Statistics

![GitHub Stats](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-stats?usernames=yourUsername1,yourUsername2,yourUsername3&include_all_commits=true&count_private=true&theme=tokyonight&show_icons=true)

![Top Languages](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-top-langs?usernames=yourUsername1,yourUsername2,yourUsername3&layout=compact&langs_count=8&theme=tokyonight)
```

**Important:** Replace `yourUsername1,yourUsername2,yourUsername3` with your actual GitHub usernames!

For example, if your usernames are `aleksaToljic`, `workAccount`, and `freelanceAccount`:

```markdown
![GitHub Stats](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-stats?usernames=aleksaToljic,workAccount,freelanceAccount&include_all_commits=true&count_private=true&theme=tokyonight&show_icons=true)

![Top Languages](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-top-langs?usernames=aleksaToljic,workAccount,freelanceAccount&layout=compact&langs_count=8&theme=tokyonight)
```

## Single Profile Stats (if you still want individual ones)

You can also keep showing individual account stats:

### Account 1 (aleksaToljic)
```markdown
![GitHub Stats](https://github-readme-stats-brown-theta-64.vercel.app/api?username=aleksaToljic&include_all_commits=true&count_private=true&theme=tokyonight)
![Top Langs](https://github-readme-stats-brown-theta-64.vercel.app/api/top-langs/?username=aleksaToljic&layout=compact&langs_count=8&theme=tokyonight)
```

### Account 2
```markdown
![GitHub Stats](https://github-readme-stats-brown-theta-64.vercel.app/api?username=yourSecondUsername&include_all_commits=true&count_private=true&theme=tokyonight)
![Top Langs](https://github-readme-stats-brown-theta-64.vercel.app/api/top-langs/?username=yourSecondUsername&layout=compact&langs_count=8&theme=tokyonight)
```

### Account 3
```markdown
![GitHub Stats](https://github-readme-stats-brown-theta-64.vercel.app/api?username=yourThirdUsername&include_all_commits=true&count_private=true&theme=tokyonight)
![Top Langs](https://github-readme-stats-brown-theta-64.vercel.app/api/top-langs/?username=yourThirdUsername&layout=compact&langs_count=8&theme=tokyonight)
```

## Testing Locally (Optional)

If you want to test before deploying:

1. Create a `.env` file in the project root:
   ```env
   PAT_1=your_first_token
   PAT_2=your_second_token
   PAT_3=your_third_token
   ```

2. Install and run:
   ```bash
   npm install
   node express.js
   ```

3. Open in browser:
   ```
   http://localhost:9000/multi-stats?usernames=user1,user2,user3
   http://localhost:9000/multi-top-langs?usernames=user1,user2,user3
   ```

## Customization Options

### Available Parameters for `/api/multi-stats`:
- `usernames` (required) - Comma-separated usernames
- `theme` - Choose from: tokyonight, dark, radical, merko, gruvbox, dracula, etc.
- `show_icons` - Show icons (true/false)
- `hide_border` - Hide border (true/false)
- `include_all_commits` - Include all commits (true/false)
- `count_private` - Count private contributions (true/false)
- `custom_title` - Custom card title
- `hide` - Hide specific stats: `stars,commits,prs,issues,contribs`
- `show` - Show additional stats: `reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage`

### Available Parameters for `/api/multi-top-langs`:
- `usernames` (required) - Comma-separated usernames
- `theme` - Card theme
- `layout` - Layout: compact, normal, donut, donut-vertical, pie
- `langs_count` - Number of languages to show (default: 5)
- `hide` - Hide specific languages (comma-separated)
- `custom_title` - Custom card title
- `hide_progress` - Hide progress bars (true/false)

### Example with Custom Options:
```markdown
![Custom Stats](https://github-readme-stats-brown-theta-64.vercel.app/api/multi-stats?usernames=user1,user2,user3&theme=radical&show_icons=true&hide=stars&custom_title=My%20Combined%20GitHub%20Activity&show=reviews,prs_merged)
```

## What Gets Aggregated?

The multi-profile stats combine:
- ✅ Total commits from all accounts
- ✅ Total pull requests
- ✅ Total issues
- ✅ Total stars
- ✅ Total reviews
- ✅ Repositories contributed to
- ✅ Total repositories owned
- ✅ Total followers
- ✅ Calculated combined rank

The language stats merge:
- ✅ All programming languages from all accounts
- ✅ Weighted by code size and repository count
- ✅ De-duplicated and sorted by usage

## Troubleshooting

### Stats not showing?
1. Check that all usernames are correct (no typos!)
2. Verify PATs are added to Vercel environment variables
3. Make sure PATs have the correct permissions (`public_repo`, `read:user`)
4. Redeploy your Vercel project after adding environment variables

### "Rate limit exceeded"?
- This shouldn't happen with 3 PATs, but if it does:
  - Add more PATs (PAT_4, PAT_5, etc.)
  - The system will automatically rotate through them

### Cache issues?
- Cards are cached for 24 hours by default
- Add `&cache_seconds=0` for testing (not recommended for production)
- Clear your browser cache

## Need Help?

Check out the full guide: [MULTI_PROFILE_GUIDE.md](./MULTI_PROFILE_GUIDE.md)

---

🎉 **You're all set!** Enjoy your aggregated GitHub stats from all your accounts!

