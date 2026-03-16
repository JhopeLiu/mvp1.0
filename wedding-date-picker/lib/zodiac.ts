export const ZODIAC_OPTIONS = [
  "鼠",
  "牛",
  "虎",
  "兔",
  "龙",
  "蛇",
  "马",
  "羊",
  "猴",
  "鸡",
  "狗",
  "猪",
] as const;

export type ZodiacAnimal = (typeof ZODIAC_OPTIONS)[number];

export function getZodiacAnimalIndex(animal: ZodiacAnimal): number {
  return ZODIAC_OPTIONS.indexOf(animal);
}
