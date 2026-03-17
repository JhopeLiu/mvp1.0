# Wedding Date Picker

A prototype Next.js 14 app for exploring wedding date options in a selected year.

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- API route support (`app/api`)

## Prototype Features

- Form inputs for:
  - Groom zodiac
  - Bride zodiac
  - Year
- Calendar grid for all 12 months of the selected year
- Weekend highlighting (Saturday + Sunday)
- Starter API endpoint at `GET /api/wedding-dates`

## Project Structure

```text
app/
  api/wedding-dates/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  year-calendar.tsx
lib/
  calendar.ts
  zodiac.ts
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy Without Vercel (Recommended)

This project now supports Docker-based deployment out of the box.

### Option A: Render (No CLI required)

1. Push this repository to GitHub.
2. Create a new **Web Service** in Render from the repo.
3. Render will detect `render.yaml` + `Dockerfile`.
4. Deploy and get a stable public URL.

### Option B: Railway (No Vercel, minimal setup)

1. Create a new Railway project from this GitHub repo.
2. Railway detects the `Dockerfile`.
3. Deploy and assign a public domain in project settings.

### Why this is stable

- Uses production build (`next build`) + standalone server.
- URL is tied to your deployment platform/domain, not a temporary tunnel.
- Safe for sharing with others long-term.
