import { describe, expect, it } from "vitest";
import {
  addMonths,
  getCalendarGrid,
  isSameDay,
  parseISODate,
  toISODate,
} from "./dateUtils";

describe("dateUtils", () => {
  it("parses valid ISO dates and rejects overflow", () => {
    expect(toISODate(parseISODate("2024-02-29")!)).toBe("2024-02-29"); // leap year
    expect(parseISODate("2023-02-29")).toBeNull(); // not a leap year
    expect(parseISODate("2024-13-01")).toBeNull();
    expect(parseISODate("nonsense")).toBeNull();
  });

  it("clamps the day when adding months to month-end dates", () => {
    // Jan 31 + 1 month should land on Feb 29 (2024), not spill into March.
    expect(toISODate(addMonths(new Date(2024, 0, 31), 1))).toBe("2024-02-29");
  });

  it("always returns a 6x7 grid starting on a Sunday", () => {
    const grid = getCalendarGrid(new Date(2024, 5, 15));
    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(0);
  });

  it("compares calendar days ignoring time", () => {
    expect(isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 23))).toBe(true);
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false);
    expect(isSameDay(null, new Date())).toBe(false);
  });
});
