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
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Holiday
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Potential date
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
                  className={`flex h-8 items-center justify-center rounded-md border ${
                    day.isHoliday
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : day.isPotentialGoodDate
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : day.isWeekend
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                  title={day.holidayName ? `${day.dateISO} • ${day.holidayName}` : day.dateISO}
                >
                  {day.dayNumber}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
