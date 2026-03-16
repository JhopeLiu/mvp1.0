export type CalendarDay = {
  dayNumber: number;
  dateISO: string;
  isWeekend: boolean;
};

export type MonthGrid = {
  monthName: string;
  leadingBlankDays: number;
  days: CalendarDay[];
};

export function getDatesForYear(year: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(year, 0, 1);

  while (current.getFullYear() === year) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function buildMonthGrids(year: number): MonthGrid[] {
  const allDates = getDatesForYear(year);

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDates = allDates.filter((date) => date.getMonth() === monthIndex);
    const firstDay = new Date(year, monthIndex, 1);

    return {
      monthName: firstDay.toLocaleDateString("en-US", { month: "long" }),
      leadingBlankDays: firstDay.getDay(),
      days: monthDates.map((date) => {
        const dayOfWeek = date.getDay();
        return {
          dayNumber: date.getDate(),
          dateISO: date.toISOString().slice(0, 10),
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        };
      }),
    };
  });
}
