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

const ZODIAC_SHARE_KEY_BY_ANIMAL: Record<ZodiacAnimal, string> = {
  鼠: "rat",
  牛: "ox",
  虎: "tiger",
  兔: "rabbit",
  龙: "dragon",
  蛇: "snake",
  马: "horse",
  羊: "goat",
  猴: "monkey",
  鸡: "rooster",
  狗: "dog",
  猪: "pig",
};

const ZODIAC_ANIMAL_BY_SHARE_KEY: Record<string, ZodiacAnimal> = {
  rat: "鼠",
  ox: "牛",
  tiger: "虎",
  rabbit: "兔",
  dragon: "龙",
  snake: "蛇",
  horse: "马",
  goat: "羊",
  monkey: "猴",
  rooster: "鸡",
  dog: "狗",
  pig: "猪",
};

export function toZodiacShareKey(animal: ZodiacAnimal): string {
  return ZODIAC_SHARE_KEY_BY_ANIMAL[animal];
}

export function fromZodiacShareKey(key: string): ZodiacAnimal | null {
  const normalizedKey = key.trim().toLowerCase();
  return ZODIAC_ANIMAL_BY_SHARE_KEY[normalizedKey] ?? null;
}
