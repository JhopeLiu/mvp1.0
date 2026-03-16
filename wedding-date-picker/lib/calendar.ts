export type CalendarDay = {
  dayNumber: number;
  dateISO: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isPotentialGoodDate: boolean;
};

export type MonthGrid = {
  monthName: string;
  leadingBlankDays: number;
  days: CalendarDay[];
};

type BuildMonthGridsOptions = {
  holidayByDateISO?: Record<string, string>;
  potentialGoodDateSet?: Set<string>;
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
  const potentialGoodDateSet = options.potentialGoodDateSet ?? new Set<string>();

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDates = allDates.filter((date) => date.getMonth() === monthIndex);
    const firstDay = new Date(year, monthIndex, 1);

    return {
      monthName: firstDay.toLocaleDateString("en-US", { month: "long" }),
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
          isPotentialGoodDate: potentialGoodDateSet.has(dateISO),
        };
      }),
    };
  });
}
