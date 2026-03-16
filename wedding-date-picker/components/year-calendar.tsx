import type { MonthGrid } from "@/lib/calendar";

type YearCalendarProps = {
  year: number;
  months: MonthGrid[];
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function YearCalendar({ year, months }: YearCalendarProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{year} Calendar</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {months.map((month) => (
          <article key={month.monthName} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                    day.isWeekend
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
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
