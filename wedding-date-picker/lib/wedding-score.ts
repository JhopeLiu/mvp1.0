import { getDatesForYear, toISODateString } from "@/lib/calendar";
import type { ZodiacAnimal } from "@/lib/zodiac";
import { LunarYear, Solar } from "lunar-javascript";

type MonthlyTemperatureRange = {
  min: number;
  max: number;
};

// Mock "typical monthly ranges" dataset for MVP filtering.
const MONTHLY_TEMPERATURE_RANGES: MonthlyTemperatureRange[] = [
  { min: 10, max: 18 }, // Jan
  { min: 11, max: 19 }, // Feb
  { min: 14, max: 22 }, // Mar
  { min: 18, max: 25 }, // Apr
  { min: 21, max: 28 }, // May
  { min: 24, max: 32 }, // Jun
  { min: 26, max: 34 }, // Jul
  { min: 25, max: 33 }, // Aug
  { min: 22, max: 30 }, // Sep
  { min: 18, max: 26 }, // Oct
  { min: 14, max: 22 }, // Nov
  { min: 11, max: 19 }, // Dec
];

type TemperaturePreferenceInput = {
  year: number;
  minTemp: number;
  maxTemp: number;
  ignoreTemperature: boolean;
};

type TemperaturePreferenceOutput = {
  preferredTemperatureDateSet: Set<string>;
  outOfPreferredTemperatureDateSet: Set<string>;
};

type AlmanacAuspiciousInput = {
  year: number;
  groomZodiac: ZodiacPreference;
  brideZodiac: ZodiacPreference;
  blockedWeddingDateSet: Set<string>;
  adjustedWorkdaySet: Set<string>;
  preferredTemperatureDateSet: Set<string>;
  ignoreTemperature: boolean;
};

export type RankedAuspiciousDate = {
  dateISO: string;
  score: number;
  reason: string;
  lunarText: string;
};

type AlmanacAuspiciousOutput = {
  zodiacConflictDateSet: Set<string>;
  zodiacCompatibleDateSet: Set<string>;
  recommendedDateSet: Set<string>;
  rankedAuspiciousDates: RankedAuspiciousDate[];
  dateScoreByISO: Record<string, number>;
  dateScoreDetailByISO: Record<string, string>;
  leapMonth: number;
};

const AUSPICIOUS_ZHI_XING = new Set(["除", "定", "执", "危", "成", "开"]);
const TOP_AUSPICIOUS_COUNT = 80;

// 杨公十三忌（按农历月日，闰月按同月处理）。
const YANG_GONG_JI = new Set([
  "1-13",
  "2-11",
  "3-9",
  "4-7",
  "5-5",
  "6-3",
  "7-1",
  "7-29",
  "8-27",
  "9-25",
  "10-23",
  "11-21",
  "12-19",
]);

const ZODIAC_ELEMENT_MAP: Record<ZodiacAnimal, "金" | "木" | "水" | "火" | "土"> = {
  鼠: "水",
  牛: "土",
  虎: "木",
  兔: "木",
  龙: "土",
  蛇: "火",
  马: "火",
  羊: "土",
  猴: "金",
  鸡: "金",
  狗: "土",
  猪: "水",
};

const ELEMENT_GENERATE_MAP: Record<"金" | "木" | "水" | "火" | "土", "金" | "木" | "水" | "火" | "土"> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const ELEMENT_RESTRAIN_MAP: Record<"金" | "木" | "水" | "火" | "土", "金" | "木" | "水" | "火" | "土"> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

export type ZodiacPreference = ZodiacAnimal | "ANY";

function isSpecificZodiac(zodiac: ZodiacPreference): zodiac is ZodiacAnimal {
  return zodiac !== "ANY";
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getJieQiDateByName(year: number, name: string): Date | null {
  const currentTable = Solar.fromYmd(year, 6, 1).getLunar().getJieQiTable();
  const nextTable = Solar.fromYmd(year + 1, 1, 1).getLunar().getJieQiTable();
  const candidates = [currentTable[name], nextTable[name]].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.getYear() === year) {
      return new Date(candidate.getYear(), candidate.getMonth() - 1, candidate.getDay());
    }
  }

  return null;
}

function getSiLiDateSet(year: number): Set<string> {
  const result = new Set<string>();
  const siLiTerms = ["春分", "夏至", "秋分", "冬至"];

  siLiTerms.forEach((term) => {
    const termDate = getJieQiDateByName(year, term);
    if (!termDate) {
      return;
    }

    const targetDate = addDays(termDate, -1);
    if (targetDate.getFullYear() === year) {
      result.add(toISODateString(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()));
    }
  });

  return result;
}

function getSiJueDateSet(year: number): Set<string> {
  const result = new Set<string>();
  const siJueTerms = ["立春", "立夏", "立秋", "立冬"];

  siJueTerms.forEach((term) => {
    const termDate = getJieQiDateByName(year, term);
    if (!termDate) {
      return;
    }

    const targetDate = addDays(termDate, -1);
    if (targetDate.getFullYear() === year) {
      result.add(toISODateString(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()));
    }
  });

  return result;
}

function getNaYinElement(dayNaYin: string): "金" | "木" | "水" | "火" | "土" | null {
  const element = dayNaYin.match(/[金木水火土]/)?.[0];
  if (!element) {
    return null;
  }
  return element as "金" | "木" | "水" | "火" | "土";
}

function evaluateNaYinCompatibility(
  dayElement: "金" | "木" | "水" | "火" | "土" | null,
  groomZodiac: ZodiacPreference,
  brideZodiac: ZodiacPreference,
) {
  const preferredZodiacs = [groomZodiac, brideZodiac].filter(isSpecificZodiac);

  if (preferredZodiacs.length === 0) {
    return {
      compatible: true,
      score: 0,
      reason: "生肖不设限制",
    };
  }

  if (!dayElement) {
    return {
      compatible: false,
      score: 0,
      reason: "纳音信息缺失",
    };
  }

  const preferredElements = preferredZodiacs.map((zodiac) => ZODIAC_ELEMENT_MAP[zodiac]);
  const preferredText = preferredZodiacs.map((zodiac) => `属${zodiac}`).join("、");
  const dayRestrains = ELEMENT_RESTRAIN_MAP[dayElement];
  const restrainsDay = preferredElements.some((element) => ELEMENT_RESTRAIN_MAP[element] === dayElement);
  const dayRestrainsPreferred = preferredElements.includes(dayRestrains);

  if (dayRestrainsPreferred || restrainsDay) {
    return {
      compatible: false,
      score: 0,
      reason: `纳音${dayElement}与${preferredText}五行相冲`,
    };
  }

  const generateTargets = new Set([ELEMENT_GENERATE_MAP[dayElement]]);
  let score = 6;

  preferredElements.forEach((element) => {
    if (generateTargets.has(element)) {
      score += 2;
    } else if (dayElement === element) {
      score += 1;
    }
  });

  return {
    compatible: true,
    score,
    reason: `纳音${dayElement}与${preferredText}相合`,
  };
}

function rangesOverlap(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
  return aMin <= bMax && bMin <= aMax;
}

export function getTemperaturePreferenceSets({
  year,
  minTemp,
  maxTemp,
  ignoreTemperature,
}: TemperaturePreferenceInput): TemperaturePreferenceOutput {
  const preferredTemperatureDateSet = new Set<string>();
  const outOfPreferredTemperatureDateSet = new Set<string>();

  if (ignoreTemperature) {
    getDatesForYear(year).forEach((date) => {
      preferredTemperatureDateSet.add(toISODateString(year, date.getMonth() + 1, date.getDate()));
    });

    return {
      preferredTemperatureDateSet,
      outOfPreferredTemperatureDateSet,
    };
  }

  getDatesForYear(year).forEach((date) => {
    const monthIndex = date.getMonth();
    const dayNumber = date.getDate();
    const dateISO = toISODateString(year, monthIndex + 1, dayNumber);
    const monthlyRange = MONTHLY_TEMPERATURE_RANGES[monthIndex];
    const matchesPreference = rangesOverlap(minTemp, maxTemp, monthlyRange.min, monthlyRange.max);

    if (matchesPreference) {
      preferredTemperatureDateSet.add(dateISO);
      return;
    }

    outOfPreferredTemperatureDateSet.add(dateISO);
  });

  return {
    preferredTemperatureDateSet,
    outOfPreferredTemperatureDateSet,
  };
}

export function getAlmanacAuspiciousAnalysis({
  year,
  groomZodiac,
  brideZodiac,
  blockedWeddingDateSet,
  adjustedWorkdaySet,
  preferredTemperatureDateSet,
  ignoreTemperature,
}: AlmanacAuspiciousInput): AlmanacAuspiciousOutput {
  const zodiacConflictDateSet = new Set<string>();
  const zodiacCompatibleDateSet = new Set<string>();
  const rankedAuspiciousDates: RankedAuspiciousDate[] = [];
  const dateScoreByISO: Record<string, number> = {};
  const dateScoreDetailByISO: Record<string, string> = {};
  const siLiDateSet = getSiLiDateSet(year);
  const siJueDateSet = getSiJueDateSet(year);
  const leapMonth = LunarYear.fromYear(year).getLeapMonth();

  getDatesForYear(year).forEach((date) => {
    const dateISO = toISODateString(year, date.getMonth() + 1, date.getDate());
    const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
    const dayYi = lunar.getDayYi();
    const dayJi = lunar.getDayJi();
    const dayXiongSha = lunar.getDayXiongSha();
    const dayNaYin = lunar.getDayNaYin();
    const dayElement = getNaYinElement(dayNaYin);
    const zhiXing = lunar.getZhiXing();
    const isHuangDao = lunar.getDayTianShenType() === "黄道";
    const includesMarryInYi = dayYi.includes("嫁娶");
    const excludesMarryInJi = !dayJi.includes("嫁娶");
    const lunarMonthRaw = lunar.getMonth();
    const lunarMonth = Math.abs(lunarMonthRaw);
    const lunarDay = lunar.getDay();
    const isYangGongJi = YANG_GONG_JI.has(`${lunarMonth}-${lunarDay}`);
    const isSanSang = dayXiongSha.includes("三丧");
    const isSiLi = siLiDateSet.has(dateISO);
    const isSiJue = siJueDateSet.has(dateISO);
    const isHolidayOrFestival = blockedWeddingDateSet.has(dateISO);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isAdjustedWorkday = adjustedWorkdaySet.has(dateISO);
    const isPreferredTemp = preferredTemperatureDateSet.has(dateISO);
    const isBingWuYearFor2026 = year !== 2026 || lunar.getYearInGanZhi() === "丙午";
    const dayChongShengXiao = lunar.getDayChongShengXiao();
    const hasDirectChong =
      (isSpecificZodiac(groomZodiac) && dayChongShengXiao === groomZodiac) ||
      (isSpecificZodiac(brideZodiac) && dayChongShengXiao === brideZodiac);
    const naYinCheck = evaluateNaYinCompatibility(dayElement, groomZodiac, brideZodiac);
    const hasZodiacConflict = hasDirectChong || !naYinCheck.compatible;
    const scoreNotes: string[] = [];
    let score = 60;

    if (hasZodiacConflict) {
      zodiacConflictDateSet.add(dateISO);
    } else {
      zodiacCompatibleDateSet.add(dateISO);
    }

    if (isHuangDao) {
      score += 12;
      scoreNotes.push("黄道日 +12");
    } else {
      score -= 18;
      scoreNotes.push("黑道日 -18");
    }

    if (AUSPICIOUS_ZHI_XING.has(zhiXing)) {
      score += 6;
      scoreNotes.push(`${zhiXing}值偏吉 +6`);
    } else {
      score -= 4;
      scoreNotes.push(`${zhiXing}值一般 -4`);
    }

    if (includesMarryInYi) {
      score += 14;
      scoreNotes.push("宜含嫁娶 +14");
    } else {
      score -= 30;
      scoreNotes.push("宜不含嫁娶 -30");
    }

    if (excludesMarryInJi) {
      score += 6;
      scoreNotes.push("忌不含嫁娶 +6");
    } else {
      score -= 35;
      scoreNotes.push("忌含嫁娶 -35");
    }

    if (isHolidayOrFestival) {
      score -= 45;
      scoreNotes.push("法定/传统节日禁选 -45");
    }

    if (isAdjustedWorkday) {
      score -= 8;
      scoreNotes.push("调休工作日 -8");
    } else if (isWeekend) {
      score += 5;
      scoreNotes.push("周末档期 +5");
    }

    if (isYangGongJi) {
      score -= 40;
      scoreNotes.push("杨公忌 -40");
    }

    if (isSanSang) {
      score -= 35;
      scoreNotes.push("三丧日 -35");
    }

    if (isSiLi) {
      score -= 28;
      scoreNotes.push("四离日 -28");
    }

    if (isSiJue) {
      score -= 28;
      scoreNotes.push("四绝日 -28");
    }

    if (ignoreTemperature) {
      scoreNotes.push("温度不设限制 ±0");
    } else if (isPreferredTemp) {
      score += 4;
      scoreNotes.push("温度匹配 +4");
    } else {
      score -= 10;
      scoreNotes.push("温度不匹配 -10");
    }

    if (hasDirectChong) {
      score -= 24;
      scoreNotes.push(`日冲${dayChongShengXiao}（与新人冲）-24`);
    }

    if (naYinCheck.compatible) {
      score += naYinCheck.score;
      scoreNotes.push(`${naYinCheck.reason} +${naYinCheck.score}`);
    } else {
      score -= 18;
      scoreNotes.push(`${naYinCheck.reason} -18`);
    }

    if (lunar.getDayTianShenLuck() === "吉") {
      score += 3;
      scoreNotes.push("天神吉 +3");
    }

    if (isBingWuYearFor2026) {
      score += 2;
      scoreNotes.push("丙午年校验通过 +2");
    } else {
      score -= 50;
      scoreNotes.push("丙午年校验失败 -50");
    }

    score = Math.max(0, Math.min(100, score));
    dateScoreByISO[dateISO] = score;
    dateScoreDetailByISO[dateISO] = scoreNotes.join("；");

    const isAuspiciousByRules =
      isHuangDao &&
      !isYangGongJi &&
      !isSanSang &&
      !isSiLi &&
      !isSiJue &&
      naYinCheck.compatible &&
      includesMarryInYi &&
      excludesMarryInJi &&
      isBingWuYearFor2026 &&
      (ignoreTemperature || isPreferredTemp) &&
      !isHolidayOrFestival &&
      !hasDirectChong;

    if (!isAuspiciousByRules) {
      return;
    }

    const reasons = [`黄道吉日（${zhiXing}日）`, "宜嫁娶", naYinCheck.reason];

    if (isWeekend && !isAdjustedWorkday) {
      reasons.push("周末档期");
    } else if (isAdjustedWorkday) {
      reasons.push("调休工作日，周末便利性较低");
    }

    if (year === 2026) {
      reasons.push("农历丙午年");
    }

    if (lunarMonthRaw < 0 || leapMonth > 0) {
      reasons.push(leapMonth > 0 ? `已按闰${Math.abs(leapMonth)}月规则校验` : "闰月规则已校验");
    }

    rankedAuspiciousDates.push({
      dateISO,
      score,
      reason: reasons.join("，"),
      lunarText: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    });
  });

  rankedAuspiciousDates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.dateISO.localeCompare(b.dateISO);
  });

  return {
    zodiacConflictDateSet,
    zodiacCompatibleDateSet,
    recommendedDateSet: new Set(rankedAuspiciousDates.slice(0, TOP_AUSPICIOUS_COUNT).map((item) => item.dateISO)),
    rankedAuspiciousDates,
    dateScoreByISO,
    dateScoreDetailByISO,
    leapMonth,
  };
}
