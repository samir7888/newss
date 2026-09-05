# Production setup checklist

Use this checklist to bring the app from local development to a live, auto-fetching news site.

## 1. Create a Postgres database

Use any managed PostgreSQL provider such as Neon, Supabase, or Railway.

Recommended: Neon

1. Create a new project.
2. Copy the connection string.
3. Use it as the value for `DATABASE_URL`.

Example format:

```bash
postgresql://username:password@host:5432/dbname?sslmode=require
```

## 2. Add repository secrets in GitHub

In your GitHub repository, open Settings → Secrets and variables → Actions → New repository secret.

Add these values:

- `DATABASE_URL`
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `AI_PROVIDER_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `PEXELS_API_KEY`
- `NEXTAUTH_SECRET`

### Suggested values

- `CRON_SECRET`: any long random string
- `NEXTAUTH_SECRET`: random secret, 32+ characters
- `NEXT_PUBLIC_SITE_URL`: full production URL, for example `https://nepalisamachar.xyz`
- `AI_PROVIDER_API_KEY`: key from OpenRouter, Groq, or another provider you use
- `UNSPLASH_ACCESS_KEY`: from Unsplash Developer
- `PEXELS_API_KEY`: from Pexels API

## 3. Set local environment values

Create a local `.env.local` file in the project root:

```bash
DATABASE_URL="postgresql://..."
CRON_SECRET="your-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AI_PROVIDER_API_KEY="your-key"
UNSPLASH_ACCESS_KEY="your-key"
PEXELS_API_KEY="your-key"
NEXTAUTH_SECRET="your-random-secret"
```

## 4. Run the database migration

From the project root:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

If you are using a database provider that requires a different migration command, follow that provider's docs. The schema is already defined in `lib/db/schema.ts`.

## 5. Seed categories and feed sources

Run:

```bash
npm run seed:db
```

This inserts the initial category list and the RSS source registry.

## 6. Confirm the fetch script works

Run:

```bash
npm run news:fetch
```

This should parse the RSS feeds and print a summary such as:

```bash
Fetched X candidate entries; published Y new stories.
```

If `DATABASE_URL` is missing, it will skip DB writes but still process the feeds.

## 7. Deploy the app

Push the repo to GitHub, then deploy it to Vercel or your preferred host.

For Vercel:

- import the repository
- add the same environment variables in the Vercel project settings
- deploy

## 8. Verify the GitHub Action scheduler

The workflow file is in `.github/workflows/news-fetch.yml` and runs every 2 hours:

```yaml
cron: "0 */2 * * *"
```

You can also trigger it manually from the GitHub Actions tab with `workflow_dispatch`.

## 9. Production notes

- Do not republish full article bodies from source sites; rewrite them in your own words.
- Keep the original source URL and visible source attribution.
- Use licensed stock images from Unsplash/Pexels only.
- Keep the cron secret private; never expose it in client code.
- Keep the site URL consistent across `NEXT_PUBLIC_SITE_URL` and your deployed domain.

## 10. Final check list

Before going fully live, confirm:

- [ ] GitHub repository secrets are added
- [ ] Postgres database is available
- [ ] `DATABASE_URL` works locally
- [ ] `npm run seed:db` succeeds
- [ ] `npm run news:fetch` runs without errors
- [ ] Site is deployed and reachable
- [ ] GitHub Actions executes on schedule
- [ ] Articles are showing up in the app
