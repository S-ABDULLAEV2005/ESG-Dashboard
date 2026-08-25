# ESG Almaty

A responsive ESG dashboard for Almaty covering air quality, transport, district-level ESG scores, environmental behaviour, project details, and verified official sources.

## Stack

- Next.js 16
- React 19
- TypeScript
- Chart.js
- Plain responsive CSS

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Commit to GitHub

```bash
git init
git add .
git commit -m "Launch ESG Almaty dashboard"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Deploy to the existing Vercel project

1. Push this project to the GitHub repository connected to the existing Vercel project.
2. In Vercel, open the `esg-dashboard-beryl` project and confirm that the Production Branch is `main`.
3. Add the environment variable:

   ```text
   NEXT_PUBLIC_SITE_URL=https://esg-dashboard-beryl.vercel.app
   ```

4. Deploy the latest commit. Vercel should detect Next.js automatically; no custom build settings are required.

## Project structure

```text
app/
  globals.css   Global design system and responsive styles
  layout.tsx    Metadata and root layout
  page.tsx      Dashboard content, interactions, and charts
public/
  favicon.svg
  og.png        Social sharing image
```

The repository intentionally excludes dependencies, build output, deployment credentials, and platform-specific internal files.
