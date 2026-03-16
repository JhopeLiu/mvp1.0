import { toISODateString } from "@/lib/calendar";

type HolidaySeed = {
  month: number;
  day: number;
  name: string;
};

// Placeholder holiday seeds for MVP visualization.
const HOLIDAY_SEEDS: HolidaySeed[] = [
  { month: 1, day: 1, name: "New Year" },
  { month: 2, day: 14, name: "Valentine's Day" },
  { month: 5, day: 1, name: "Labor Day" },
  { month: 7, day: 4, name: "Summer Holiday" },
  { month: 10, day: 1, name: "National Day" },
  { month: 12, day: 25, name: "Christmas" },
];

export function getPublicHolidayMap(year: number): Record<string, string> {
  return HOLIDAY_SEEDS.reduce<Record<string, string>>((map, holiday) => {
    map[toISODateString(year, holiday.month, holiday.day)] = holiday.name;
    return map;
  }, {});
}
