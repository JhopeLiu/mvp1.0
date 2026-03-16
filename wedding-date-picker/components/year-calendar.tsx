import type { MonthGrid } from "@/lib/calendar";

type YearCalendarProps = {
  year: number;
  months: MonthGrid[];
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export function YearCalendar({ year, months }: YearCalendarProps) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{year} 年日历</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            节假日/传统节日
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            周末
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            调休工作日
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            生肖冲突
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            温度不匹配
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            生肖匹配
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="text-pink-500">♥</span>
            推荐日期
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
                      : day.isHoliday
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                      : day.isAdjustedWorkday
                        ? "border-orange-300 bg-orange-50 text-orange-700"
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
                      ? `${day.dateISO} • 得分${day.score}分 • 生肖冲突；${day.scoreDetail}`
                      : day.isHoliday
                        ? `${day.dateISO} • 得分${day.score}分 • ${day.holidayName}；${day.scoreDetail}`
                      : day.isAdjustedWorkday
                        ? `${day.dateISO} • 得分${day.score}分 • 调休工作日；${day.scoreDetail}`
                      : day.isOutsidePreferredTempRange
                        ? `${day.dateISO} • 得分${day.score}分 • 超出偏好温度范围；${day.scoreDetail}`
                      : day.isRecommendedDate
                        ? `${day.dateISO} • 得分${day.score}分 • 推荐日期；${day.scoreDetail}`
                        : `${day.dateISO} • 得分${day.score}分 • 生肖匹配；${day.scoreDetail}`
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
