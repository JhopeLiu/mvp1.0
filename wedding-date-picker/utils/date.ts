import dayjs from "dayjs";

export function formatDate(value: string | Date, format = "YYYY-MM-DD"): string {
  return dayjs(value).format(format);
}

export function addDays(value: string | Date, amount: number): string {
  return dayjs(value).add(amount, "day").format("YYYY-MM-DD");
}
