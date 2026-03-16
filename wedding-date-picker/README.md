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
