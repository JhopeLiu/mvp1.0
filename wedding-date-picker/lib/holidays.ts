import { toISODateString } from "@/lib/calendar";

type HolidayContext = {
  holidayByDateISO: Record<string, string>;
  blockedWeddingDateSet: Set<string>;
  adjustedWorkdaySet: Set<string>;
};

function addHolidayDate(context: HolidayContext, year: number, month: number, day: number, name: string) {
  const dateISO = toISODateString(year, month, day);
  const existingName = context.holidayByDateISO[dateISO];

  if (!existingName) {
    context.holidayByDateISO[dateISO] = name;
  } else if (!existingName.includes(name)) {
    context.holidayByDateISO[dateISO] = `${existingName} / ${name}`;
  }

  context.blockedWeddingDateSet.add(dateISO);
}

function addHolidayRange(
  context: HolidayContext,
  year: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
  name: string,
) {
  const startDate = new Date(year, startMonth - 1, startDay);
  const endDate = new Date(year, endMonth - 1, endDay);

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    addHolidayDate(context, year, date.getMonth() + 1, date.getDate(), name);
  }
}

function addAdjustedWorkday(context: HolidayContext, year: number, month: number, day: number) {
  context.adjustedWorkdaySet.add(toISODateString(year, month, day));
}

function create2026HolidayContext(): HolidayContext {
  const context: HolidayContext = {
    holidayByDateISO: {},
    blockedWeddingDateSet: new Set<string>(),
    adjustedWorkdaySet: new Set<string>(),
  };

  // 法定节假日（2026）
  addHolidayDate(context, 2026, 1, 1, "元旦");
  addHolidayDate(context, 2026, 1, 27, "除夕");
  addHolidayRange(context, 2026, 1, 28, 2, 4, "春节假期");
  addHolidayDate(context, 2026, 4, 5, "清明节");
  addHolidayRange(context, 2026, 5, 1, 5, 5, "劳动节假期");
  addHolidayRange(context, 2026, 6, 19, 6, 21, "端午节假期");
  addHolidayRange(context, 2026, 9, 29, 10, 1, "中秋节假期");
  addHolidayRange(context, 2026, 10, 1, 10, 7, "国庆节假期");

  // 传统节日（非强制放假但婚礼场景重要）
  addHolidayDate(context, 2026, 2, 11, "元宵节");
  addHolidayDate(context, 2026, 8, 20, "七夕节");
  addHolidayDate(context, 2026, 10, 16, "重阳节");

  // 调休工作日（周末补班，需避免按周末逻辑处理）
  addAdjustedWorkday(context, 2026, 1, 24);
  addAdjustedWorkday(context, 2026, 1, 25);
  addAdjustedWorkday(context, 2026, 2, 7);
  addAdjustedWorkday(context, 2026, 2, 8);
  addAdjustedWorkday(context, 2026, 4, 26);
  addAdjustedWorkday(context, 2026, 5, 9);
  addAdjustedWorkday(context, 2026, 6, 14);
  addAdjustedWorkday(context, 2026, 9, 27);
  addAdjustedWorkday(context, 2026, 10, 10);

  return context;
}

function createDefaultHolidayContext(year: number): HolidayContext {
  const context: HolidayContext = {
    holidayByDateISO: {},
    blockedWeddingDateSet: new Set<string>(),
    adjustedWorkdaySet: new Set<string>(),
  };

  // 非 2026 年份提供基础占位，避免页面空态。
  addHolidayDate(context, year, 1, 1, "元旦");
  addHolidayDate(context, year, 2, 14, "情人节");
  addHolidayDate(context, year, 5, 1, "劳动节");
  addHolidayDate(context, year, 10, 1, "国庆节");

  return context;
}

export function getHolidayContext(year: number): HolidayContext {
  if (year === 2026) {
    return create2026HolidayContext();
  }

  return createDefaultHolidayContext(year);
}

export function getPublicHolidayMap(year: number): Record<string, string> {
  return getHolidayContext(year).holidayByDateISO;
}
