import { getDatesForYear, toISODateString } from "@/lib/calendar";
import { getZodiacSignIndex, type ZodiacSign } from "@/lib/zodiac";

const LUCKY_DAY_NUMBERS = new Set([6, 8, 9, 16, 18, 20, 22, 28]);

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

type PotentialDateInput = {
  year: number;
  holidayByDateISO: Record<string, string>;
  zodiacConflictDateSet: Set<string>;
  preferredTemperatureDateSet: Set<string>;
};

type ZodiacCompatibilityInput = {
  year: number;
  groomZodiac: ZodiacSign;
  brideZodiac: ZodiacSign;
};

type ZodiacCompatibilityOutput = {
  zodiacConflictDateSet: Set<string>;
  zodiacCompatibleDateSet: Set<string>;
};

type TemperaturePreferenceInput = {
  year: number;
  minTemp: number;
  maxTemp: number;
};

type TemperaturePreferenceOutput = {
  preferredTemperatureDateSet: Set<string>;
  outOfPreferredTemperatureDateSet: Set<string>;
};

function getDateZodiacIndex(monthIndex: number, dayNumber: number): number {
  // Placeholder date-sign mapping for MVP (deterministic and simple).
  return (monthIndex * 2 + dayNumber) % 12;
}

function getOppositeSignIndex(index: number): number {
  return (index + 6) % 12;
}

function rangesOverlap(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
  return aMin <= bMax && bMin <= aMax;
}

export function getTemperaturePreferenceSets({
  year,
  minTemp,
  maxTemp,
}: TemperaturePreferenceInput): TemperaturePreferenceOutput {
  const preferredTemperatureDateSet = new Set<string>();
  const outOfPreferredTemperatureDateSet = new Set<string>();

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

export function getZodiacCompatibilitySets({
  year,
  groomZodiac,
  brideZodiac,
}: ZodiacCompatibilityInput): ZodiacCompatibilityOutput {
  const groomIndex = getZodiacSignIndex(groomZodiac);
  const brideIndex = getZodiacSignIndex(brideZodiac);
  const conflictIndexes = new Set<number>([
    groomIndex,
    brideIndex,
    getOppositeSignIndex(groomIndex),
    getOppositeSignIndex(brideIndex),
  ]);
  const zodiacConflictDateSet = new Set<string>();
  const zodiacCompatibleDateSet = new Set<string>();

  getDatesForYear(year).forEach((date) => {
    const monthIndex = date.getMonth();
    const dayNumber = date.getDate();
    const dateISO = toISODateString(year, monthIndex + 1, dayNumber);
    const dateZodiacIndex = getDateZodiacIndex(monthIndex, dayNumber);

    if (conflictIndexes.has(dateZodiacIndex)) {
      zodiacConflictDateSet.add(dateISO);
      return;
    }

    zodiacCompatibleDateSet.add(dateISO);
  });

  return {
    zodiacConflictDateSet,
    zodiacCompatibleDateSet,
  };
}

export function getPotentialGoodDateSet({
  year,
  holidayByDateISO,
  zodiacConflictDateSet,
  preferredTemperatureDateSet,
}: PotentialDateInput): Set<string> {
  const dates = getDatesForYear(year);
  const result = new Set<string>();

  dates.forEach((date) => {
    const dayOfWeek = date.getDay();
    const dayNumber = date.getDate();
    const monthIndex = date.getMonth();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateISO = toISODateString(year, monthIndex + 1, dayNumber);
    const isHoliday = Boolean(holidayByDateISO[dateISO]);
    const hasZodiacConflict = zodiacConflictDateSet.has(dateISO);
    const tempMatch = preferredTemperatureDateSet.has(dateISO);

    if (isWeekend && !isHoliday && !hasZodiacConflict && tempMatch && LUCKY_DAY_NUMBERS.has(dayNumber)) {
      result.add(dateISO);
    }
  });

  return result;
}
