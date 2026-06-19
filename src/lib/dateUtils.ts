/** Small, dependency-free date helpers used by the DatePicker. */

export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  // Clamp the day to the last valid day of the resulting month.
  const lastDay = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(d.getDate(), lastDay));
  return r;
}

export function addYears(d: Date, n: number): Date {
  return addMonths(d, n * 12);
}

/** Returns the 6x7 grid of dates covering the month containing `viewDate`. */
export function getCalendarGrid(viewDate: Date): Date[] {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses an ISO `YYYY-MM-DD` string, returning null if invalid. */
export function parseISODate(input: string): Date | null {
  const match = ISO.exec(input.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null; // Rejects overflow like 2024-02-31.
  }
  return date;
}

export function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const monthYearFmt = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});
const fullDateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const formatMonthYear = (d: Date) => monthYearFmt.format(d);
export const formatFullDate = (d: Date) => fullDateFmt.format(d);
