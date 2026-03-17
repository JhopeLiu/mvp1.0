import { useState } from "react";
import type { MonthGrid } from "@/lib/calendar";
import type { RecommendationMode } from "@/lib/wedding-score";

type YearCalendarProps = {
  year: number;
  months: MonthGrid[];
  recommendationMode: RecommendationMode;
};

export function YearCalendar({ year, months, recommendationMode }: YearCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<MonthGrid["days"][number] | null>(null);
  const weekdayHeader = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{year} 年婚礼日历</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            红色：休假日（周末/节假日）
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            灰色：工作日
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="text-pink-500">♥</span>
            推荐日期
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            黯淡：生肖/温度不匹配
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {months.map((month) => (
          <article key={month.monthName} className="rounded-xl border border-slate-200 bg-white/90 p-2">
            <div className="mb-2 flex items-center justify-between rounded-md bg-red-700 px-2 py-1">
              <span className="text-sm font-bold text-white">{month.monthName.replace("月", "")}月</span>
              <span className="text-[10px] text-red-100">全年总览</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500">
              {weekdayHeader.map((weekday) => (
                <span key={`${month.monthName}-${weekday}`} className="rounded bg-slate-50 py-0.5">
                  {weekday}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: month.leadingBlankDays }).map((_, index) => (
                <div key={`${month.monthName}-blank-${index}`} className="h-[52px] rounded bg-transparent" />
              ))}
              {month.days.map((day) => {
                const isRestDay = day.isHoliday || (day.isWeekend && !day.isAdjustedWorkday);
                const isDimmed = day.hasZodiacConflict || day.isOutsidePreferredTempRange;
                const showStrictMarriageTabooMarker = recommendationMode === "strict" && day.hasMarriageTaboo;

                return (
                  <button
                    type="button"
                    key={day.dateISO}
                    onClick={() => setSelectedDay(day)}
                    className={`relative flex h-[52px] min-w-0 flex-col items-center justify-between rounded-sm border px-0.5 py-0.5 text-[10px] ${
                      isRestDay
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-200 bg-slate-100 text-slate-700"
                    } ${isDimmed ? "opacity-40" : ""} transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-slate-400`}
                  >
                    <span className="leading-none text-[9px]">{day.weekdayLabel}</span>
                    <span className="text-sm font-semibold leading-none">{String(day.dayNumber).padStart(2, "0")}</span>
                    <span className="leading-none text-[8px]">{day.lunarDayText}</span>
                    {showStrictMarriageTabooMarker && (
                      <span className="absolute left-0.5 top-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-semibold text-white">
                        忌
                      </span>
                    )}
                    {day.isRecommendedDate && <span className="absolute -right-1 -top-1 text-base leading-none text-pink-500">♥</span>}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {selectedDay && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 leading-relaxed shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            {selectedDay.dateISO}（{selectedDay.lunarDayText}） · 得分 {selectedDay.score}
          </p>
          <p className="mt-3 text-xs text-slate-700">
            <span className="font-semibold">得分理由：</span>
            {selectedDay.scoreReason}
          </p>
          <p className="mt-3 text-xs text-slate-700">
            <span className="font-semibold">注意事项：</span>
            {selectedDay.noticeText}
          </p>
        </div>
      )}
    </section>
  );
}
