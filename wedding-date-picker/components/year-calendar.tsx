import type { MonthGrid } from "@/lib/calendar";

type YearCalendarProps = {
  year: number;
  months: MonthGrid[];
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function YearCalendar({ year, months }: YearCalendarProps) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{year} Calendar</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Weekend
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Zodiac conflict
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            Temp out of range
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Zodiac compatible
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="text-pink-500">♥</span>
            Recommended
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {months.map((month) => (
          <article
            key={month.monthName}
            className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur"
          >
            <h3 className="text-sm font-semibold text-slate-700">{month.monthName}</h3>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
              {WEEKDAY_LABELS.map((weekday) => (
                <span key={`${month.monthName}-${weekday}`} className="font-medium text-slate-500">
                  {weekday}
                </span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: month.leadingBlankDays }).map((_, index) => (
                <span key={`${month.monthName}-blank-${index}`} className="h-8 rounded-md" />
              ))}
              {month.days.map((day) => (
                <span
                  key={day.dateISO}
                  className={`relative flex h-8 items-center justify-center rounded-md border ${
                    day.hasZodiacConflict
                      ? "border-slate-300 bg-slate-100 text-slate-400"
                      : day.isOutsidePreferredTempRange
                        ? "border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                      : day.isRecommendedDate
                        ? "border-pink-300 bg-pink-50 text-pink-700"
                        : day.isWeekend
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : day.isZodiacCompatible
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                  title={
                    day.hasZodiacConflict
                      ? `${day.dateISO} • Zodiac conflict`
                      : day.isOutsidePreferredTempRange
                        ? `${day.dateISO} • Outside preferred temperature range`
                      : day.isRecommendedDate
                        ? `${day.dateISO} • Recommended date`
                        : `${day.dateISO} • Zodiac compatible`
                  }
                >
                  {day.dayNumber}
                  {day.isRecommendedDate && <span className="absolute right-0.5 top-0 text-[10px] leading-none">♥</span>}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
