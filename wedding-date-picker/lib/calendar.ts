export type CalendarDay = {
  dayNumber: number;
  dateISO: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  hasZodiacConflict: boolean;
  isZodiacCompatible: boolean;
  isOutsidePreferredTempRange: boolean;
  isRecommendedDate: boolean;
};

export type MonthGrid = {
  monthName: string;
  leadingBlankDays: number;
  days: CalendarDay[];
};

type BuildMonthGridsOptions = {
  holidayByDateISO?: Record<string, string>;
  zodiacConflictDateSet?: Set<string>;
  zodiacCompatibleDateSet?: Set<string>;
  outOfPreferredTemperatureDateSet?: Set<string>;
  recommendedDateSet?: Set<string>;
};

export function toISODateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDatesForYear(year: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(year, 0, 1);

  while (current.getFullYear() === year) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function buildMonthGrids(year: number, options: BuildMonthGridsOptions = {}): MonthGrid[] {
  const allDates = getDatesForYear(year);
  const holidayByDateISO = options.holidayByDateISO ?? {};
  const zodiacConflictDateSet = options.zodiacConflictDateSet ?? new Set<string>();
  const zodiacCompatibleDateSet = options.zodiacCompatibleDateSet ?? new Set<string>();
  const outOfPreferredTemperatureDateSet = options.outOfPreferredTemperatureDateSet ?? new Set<string>();
  const recommendedDateSet = options.recommendedDateSet ?? new Set<string>();

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDates = allDates.filter((date) => date.getMonth() === monthIndex);
    const firstDay = new Date(year, monthIndex, 1);

    return {
      monthName: firstDay.toLocaleDateString("zh-CN", { month: "long" }),
      leadingBlankDays: firstDay.getDay(),
      days: monthDates.map((date) => {
        const dayOfWeek = date.getDay();
        const dateISO = toISODateString(year, date.getMonth() + 1, date.getDate());
        const holidayName = holidayByDateISO[dateISO];

        return {
          dayNumber: date.getDate(),
          dateISO,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isHoliday: Boolean(holidayName),
          holidayName,
          hasZodiacConflict: zodiacConflictDateSet.has(dateISO),
          isZodiacCompatible: zodiacCompatibleDateSet.has(dateISO),
          isOutsidePreferredTempRange: outOfPreferredTemperatureDateSet.has(dateISO),
          isRecommendedDate: recommendedDateSet.has(dateISO),
        };
      }),
    };
  });
}
