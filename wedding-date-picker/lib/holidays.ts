import { toISODateString } from "@/lib/calendar";

type HolidaySeed = {
  month: number;
  day: number;
  name: string;
};

// MVP 阶段的节假日占位数据。
const HOLIDAY_SEEDS: HolidaySeed[] = [
  { month: 1, day: 1, name: "元旦" },
  { month: 2, day: 17, name: "春节" },
  { month: 4, day: 5, name: "清明节" },
  { month: 5, day: 1, name: "劳动节" },
  { month: 6, day: 19, name: "端午节" },
  { month: 10, day: 1, name: "国庆节" },
  { month: 10, day: 6, name: "中秋节" },
];

export function getPublicHolidayMap(year: number): Record<string, string> {
  return HOLIDAY_SEEDS.reduce<Record<string, string>>((map, holiday) => {
    map[toISODateString(year, holiday.month, holiday.day)] = holiday.name;
    return map;
  }, {});
}
