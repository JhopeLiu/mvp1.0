"use client";

import { useMemo, useState } from "react";
import { YearCalendar } from "@/components/year-calendar";
import { buildMonthGrids, getDatesForYear } from "@/lib/calendar";
import { getPublicHolidayMap } from "@/lib/holidays";
import { getPotentialGoodDateSet } from "@/lib/wedding-score";
import { ZODIAC_OPTIONS } from "@/lib/zodiac";

const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  const [city, setCity] = useState("Tokyo");
  const [groomZodiac, setGroomZodiac] = useState<(typeof ZODIAC_OPTIONS)[number]>(ZODIAC_OPTIONS[0]);
  const [brideZodiac, setBrideZodiac] = useState<(typeof ZODIAC_OPTIONS)[number]>(ZODIAC_OPTIONS[1]);
  const [minTemp, setMinTemp] = useState("16");
  const [maxTemp, setMaxTemp] = useState("24");
  const [yearInput, setYearInput] = useState<string>(String(CURRENT_YEAR));

  const selectedYear = useMemo(() => {
    const parsed = Number(yearInput);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return CURRENT_YEAR;
    }

    return parsed;
  }, [yearInput]);

  const [normalizedMinTemp, normalizedMaxTemp] = useMemo(() => {
    const parsedMin = Number(minTemp);
    const parsedMax = Number(maxTemp);
    const safeMin = Number.isFinite(parsedMin) ? parsedMin : 0;
    const safeMax = Number.isFinite(parsedMax) ? parsedMax : 50;

    return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];
  }, [maxTemp, minTemp]);

  const holidayMap = useMemo(() => getPublicHolidayMap(selectedYear), [selectedYear]);
  const potentialGoodDateSet = useMemo(
    () =>
      getPotentialGoodDateSet({
        year: selectedYear,
        city,
        minTemp: normalizedMinTemp,
        maxTemp: normalizedMaxTemp,
        holidayByDateISO: holidayMap,
      }),
    [city, holidayMap, normalizedMaxTemp, normalizedMinTemp, selectedYear],
  );

  const months = useMemo(
    () =>
      buildMonthGrids(selectedYear, {
        holidayByDateISO: holidayMap,
        potentialGoodDateSet,
      }),
    [holidayMap, potentialGoodDateSet, selectedYear],
  );
  const totalDates = useMemo(() => getDatesForYear(selectedYear).length, [selectedYear]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 xl:p-8">
        <header className="mb-5 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Wedding Date Picker MVP</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter preferences on the left and explore suggested dates in the yearly calendar on the right.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[340px,1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold text-slate-900">Wedding Preferences</h2>
            <form className="mt-4 space-y-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="e.g. Tokyo"
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Groom zodiac</span>
                <select
                  value={groomZodiac}
                  onChange={(event) => setGroomZodiac(event.target.value as (typeof ZODIAC_OPTIONS)[number])}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                >
                  {ZODIAC_OPTIONS.map((zodiac) => (
                    <option key={`groom-${zodiac}`} value={zodiac}>
                      {zodiac}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Bride zodiac</span>
                <select
                  value={brideZodiac}
                  onChange={(event) => setBrideZodiac(event.target.value as (typeof ZODIAC_OPTIONS)[number])}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                >
                  {ZODIAC_OPTIONS.map((zodiac) => (
                    <option key={`bride-${zodiac}`} value={zodiac}>
                      {zodiac}
                    </option>
                  ))}
                </select>
              </label>

              <div className="text-sm">
                <span className="font-medium text-slate-700">Preferred temperature range (°C)</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minTemp}
                    onChange={(event) => setMinTemp(event.target.value)}
                    placeholder="Min"
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                  />
                  <input
                    type="number"
                    value={maxTemp}
                    onChange={(event) => setMaxTemp(event.target.value)}
                    placeholder="Max"
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                  />
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Year</span>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={yearInput}
                  onChange={(event) => setYearInput(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                />
              </label>
            </form>

            <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Summary:</span> {city || "Unknown city"} •{" "}
                {groomZodiac} &amp; {brideZodiac}
              </p>
              <p className="mt-1">
                {totalDates} dates in {selectedYear} • preferred {normalizedMinTemp}°C to {normalizedMaxTemp}°C
              </p>
              <p className="mt-1">
                Potential dates found: <span className="font-semibold text-emerald-700">{potentialGoodDateSet.size}</span>
              </p>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <YearCalendar year={selectedYear} months={months} />
          </section>
        </div>
      </div>
    </main>
  );
}
