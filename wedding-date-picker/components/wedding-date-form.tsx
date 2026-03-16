"use client";

import { FormEvent, useMemo, useState } from "react";
import type {
  WeddingDateRequest,
  WeddingDateResponse,
} from "@/lib/types/wedding-date";

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const initialState: WeddingDateRequest = {
  city: "",
  groomZodiac: zodiacSigns[0],
  brideZodiac: zodiacSigns[0],
  preferredTemperatureRange: {
    min: 18,
    max: 26,
  },
};

export function WeddingDateForm() {
  const [form, setForm] = useState<WeddingDateRequest>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeddingDateResponse | null>(null);

  const isInvalidRange = useMemo(
    () => form.preferredTemperatureRange.min > form.preferredTemperatureRange.max,
    [form.preferredTemperatureRange.max, form.preferredTemperatureRange.min],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (isInvalidRange) {
      setError("Minimum preferred temperature must be less than maximum.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wedding-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as WeddingDateResponse | { error: string };
      if (!response.ok) {
        setError("error" in data ? data.error : "Unable to generate date suggestion.");
        return;
      }

      setResult(data as WeddingDateResponse);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while submitting the form.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-black/20">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            type="text"
            required
            value={form.city}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, city: event.target.value }))
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 dark:border-white/20"
            placeholder="e.g. Kyoto"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="groom-zodiac" className="text-sm font-medium">
              Zodiac of groom
            </label>
            <select
              id="groom-zodiac"
              value={form.groomZodiac}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  groomZodiac: event.target.value,
                }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 dark:border-white/20"
            >
              {zodiacSigns.map((zodiac) => (
                <option key={`groom-${zodiac}`} value={zodiac} className="text-black">
                  {zodiac}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="bride-zodiac" className="text-sm font-medium">
              Zodiac of bride
            </label>
            <select
              id="bride-zodiac"
              value={form.brideZodiac}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  brideZodiac: event.target.value,
                }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 dark:border-white/20"
            >
              {zodiacSigns.map((zodiac) => (
                <option key={`bride-${zodiac}`} value={zodiac} className="text-black">
                  {zodiac}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="temp-min" className="text-sm font-medium">
              Preferred min temperature (°C)
            </label>
            <input
              id="temp-min"
              type="number"
              value={form.preferredTemperatureRange.min}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  preferredTemperatureRange: {
                    ...previous.preferredTemperatureRange,
                    min: Number(event.target.value),
                  },
                }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 dark:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="temp-max" className="text-sm font-medium">
              Preferred max temperature (°C)
            </label>
            <input
              id="temp-max"
              type="number"
              value={form.preferredTemperatureRange.max}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  preferredTemperatureRange: {
                    ...previous.preferredTemperatureRange,
                    max: Number(event.target.value),
                  },
                }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 dark:border-white/20"
            />
          </div>
        </div>

        {isInvalidRange ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            Minimum temperature must be less than or equal to maximum.
          </p>
        ) : null}

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading || isInvalidRange}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {isLoading ? "Generating..." : "Get wedding date suggestion"}
        </button>
      </form>

      {result ? (
        <div className="mt-6 space-y-3 rounded-md border border-black/10 bg-black/[0.02] p-4 dark:border-white/15 dark:bg-white/[0.02]">
          <h2 className="text-sm font-semibold">API response preview</h2>
          <pre className="overflow-x-auto text-xs leading-relaxed">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
