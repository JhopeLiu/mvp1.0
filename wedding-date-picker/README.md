# Wedding Date Picker

AI-assisted wedding date picker scaffold built with:

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Route Handlers (`app/api/...`) for API endpoints

## User input fields included

- City
- Zodiac of groom
- Zodiac of bride
- Preferred temperature range

## Project structure

```text
app/
  api/
    wedding-date/
      route.ts        # POST endpoint placeholder
  layout.tsx
  page.tsx            # Landing page + form container
components/
  wedding-date-form.tsx
lib/
  types/
    wedding-date.ts   # Request/response contracts
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API route

- `POST /api/wedding-date`
- Expects:
  - `city`
  - `groomZodiac`
  - `brideZodiac`
  - `preferredTemperatureRange: { min, max }`
- Returns a placeholder recommendation response. Replace it with real AI logic.
