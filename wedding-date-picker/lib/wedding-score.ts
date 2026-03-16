import { getDatesForYear, toISODateString } from "@/lib/calendar";

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
};

export function getPotentialGoodDateSet({
  year,
  city,
  minTemp,
  maxTemp,
  holidayByDateISO,
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
    const isHoliday = Boolean(holidayByDateISO[toISODateString(year, monthIndex + 1, dayNumber)]);
    const tempMatch = monthTemp >= minTemp && monthTemp <= maxTemp;

    if (isWeekend && !isHoliday && tempMatch && LUCKY_DAY_NUMBERS.has(dayNumber)) {
      result.add(toISODateString(year, monthIndex + 1, dayNumber));
    }
  });

  return result;
}
