import { getDatesForYear, toISODateString } from "@/lib/calendar";
import { getZodiacSignIndex, type ZodiacSign } from "@/lib/zodiac";

const LUCKY_DAY_NUMBERS = new Set([6, 8, 9, 16, 18, 20, 22, 28]);

const CLIMATE_PROFILES = {
  tropical: [28, 28, 29, 30, 30, 30, 30, 30, 29, 29, 28, 28],
  temperate: [4, 6, 10, 14, 18, 22, 25, 24, 20, 15, 9, 5],
  cool: [2, 4, 7, 10, 14, 18, 21, 20, 16, 11, 7, 3],
} as const;

function inferClimateProfile(city: string): keyof typeof CLIMATE_PROFILES {
  const normalizedCity = city.trim().toLowerCase();

  if (["bangkok", "singapore", "jakarta", "dubai", "miami"].includes(normalizedCity)) {
    return "tropical";
  }

  if (["london", "seattle", "berlin", "toronto", "vancouver"].includes(normalizedCity)) {
    return "cool";
  }

  return "temperate";
}

type PotentialDateInput = {
  year: number;
  city: string;
  minTemp: number;
  maxTemp: number;
  holidayByDateISO: Record<string, string>;
  zodiacConflictDateSet: Set<string>;
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

function getDateZodiacIndex(monthIndex: number, dayNumber: number): number {
  // Placeholder date-sign mapping for MVP (deterministic and simple).
  return (monthIndex * 2 + dayNumber) % 12;
}

function getOppositeSignIndex(index: number): number {
  return (index + 6) % 12;
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
  city,
  minTemp,
  maxTemp,
  holidayByDateISO,
  zodiacConflictDateSet,
}: PotentialDateInput): Set<string> {
  const profile = CLIMATE_PROFILES[inferClimateProfile(city)];
  const dates = getDatesForYear(year);
  const result = new Set<string>();

  dates.forEach((date) => {
    const dayOfWeek = date.getDay();
    const dayNumber = date.getDate();
    const monthIndex = date.getMonth();
    const monthTemp = profile[monthIndex];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateISO = toISODateString(year, monthIndex + 1, dayNumber);
    const isHoliday = Boolean(holidayByDateISO[dateISO]);
    const hasZodiacConflict = zodiacConflictDateSet.has(dateISO);
    const tempMatch = monthTemp >= minTemp && monthTemp <= maxTemp;

    if (isWeekend && !isHoliday && !hasZodiacConflict && tempMatch && LUCKY_DAY_NUMBERS.has(dayNumber)) {
      result.add(dateISO);
    }
  });

  return result;
}
