"use client";

import { useMemo, useState } from "react";
import { YearCalendar } from "@/components/year-calendar";
import { buildMonthGrids, getDatesForYear } from "@/lib/calendar";
import { ZODIAC_OPTIONS } from "@/lib/zodiac";

const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  const [groomZodiac, setGroomZodiac] = useState<(typeof ZODIAC_OPTIONS)[number]>(ZODIAC_OPTIONS[0]);
  const [brideZodiac, setBrideZodiac] = useState<(typeof ZODIAC_OPTIONS)[number]>(ZODIAC_OPTIONS[1]);
  const [yearInput, setYearInput] = useState<string>(String(CURRENT_YEAR));

  const selectedYear = useMemo(() => {
    const parsed = Number(yearInput);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return CURRENT_YEAR;
    }

    return parsed;
  }, [yearInput]);

  const months = useMemo(() => buildMonthGrids(selectedYear), [selectedYear]);
  const totalDates = useMemo(() => getDatesForYear(selectedYear).length, [selectedYear]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Wedding Date Picker Prototype</h1>
        <p className="mt-2 text-sm text-slate-600">
          Generate all dates for a year and quickly visualize weekends for planning.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Couple Details</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Groom zodiac</span>
            <select
              value={groomZodiac}
              onChange={(event) => setGroomZodiac(event.target.value as (typeof ZODIAC_OPTIONS)[number])}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-300 focus:ring-2"
            >
              {ZODIAC_OPTIONS.map((zodiac) => (
                <option key={`groom-${zodiac}`} value={zodiac}>
                  {zodiac}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Bride zodiac</span>
            <select
              value={brideZodiac}
              onChange={(event) => setBrideZodiac(event.target.value as (typeof ZODIAC_OPTIONS)[number])}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-300 focus:ring-2"
            >
              {ZODIAC_OPTIONS.map((zodiac) => (
                <option key={`bride-${zodiac}`} value={zodiac}>
                  {zodiac}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Year</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-300 focus:ring-2"
            />
          </label>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Showing <span className="font-semibold">{totalDates}</span> dates for{" "}
          <span className="font-semibold">{selectedYear}</span> • {groomZodiac} &amp; {brideZodiac}
        </p>
      </section>

      <YearCalendar year={selectedYear} months={months} />
    </main>
  );
}
