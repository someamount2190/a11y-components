import { useEffect, useId, useRef, useState } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import {
  addDays,
  addMonths,
  addYears,
  formatFullDate,
  formatMonthYear,
  getCalendarGrid,
  isSameDay,
  parseISODate,
  startOfDay,
  toISODate,
  WEEKDAYS_LONG,
} from "../dateUtils";
import "./DatePicker.css";

export interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  disabled?: boolean;
  id?: string;
}

const WEEKDAY_ABBR = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Accessible date picker: an ISO text input paired with a calendar dialog.
 *
 * Implements the WAI-ARIA date-picker dialog pattern:
 * - Calendar is a role="grid" with one row per week and gridcell buttons.
 * - Roving tabindex — only the focused day is tabbable; arrows move focus.
 * - Arrows = day, PageUp/Down = month, Shift+PageUp/Down = year, Home/End = week.
 * - The focused date is announced via an aria-live region as it changes.
 */
export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
  id,
}: DatePickerProps) {
  const reactId = useId();
  const baseId = id ?? reactId;
  const dialogId = `${baseId}-dialog`;
  const gridLabelId = `${baseId}-grid-label`;
  const liveId = `${baseId}-live`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ? toISODate(value) : "");
  // The date that currently holds focus inside the grid.
  const [focusDate, setFocusDate] = useState<Date>(value ?? startOfDay(new Date()));

  // Keep the text field in sync when the controlled value changes externally.
  useEffect(() => {
    setText(value ? toISODate(value) : "");
  }, [value]);

  useFocusTrap(dialogRef, { active: open, returnFocus: triggerRef });
  useOnClickOutside([rootRef], () => setOpen(false), open);

  const isDisabledDate = (d: Date) =>
    (min ? startOfDay(d) < startOfDay(min) : false) ||
    (max ? startOfDay(d) > startOfDay(max) : false);

  const openCalendar = () => {
    if (disabled) return;
    setFocusDate(value ?? startOfDay(new Date()));
    setOpen(true);
  };

  const commitSelection = (d: Date) => {
    if (isDisabledDate(d)) return;
    onChange(startOfDay(d));
    setText(toISODate(d));
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Move focus within the grid; clamp into the allowed range.
  const moveFocus = (next: Date) => {
    if (min && startOfDay(next) < startOfDay(min)) next = startOfDay(min);
    if (max && startOfDay(next) > startOfDay(max)) next = startOfDay(max);
    setFocusDate(next);
  };

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    let handled = true;
    switch (event.key) {
      case "ArrowLeft":
        moveFocus(addDays(focusDate, -1));
        break;
      case "ArrowRight":
        moveFocus(addDays(focusDate, 1));
        break;
      case "ArrowUp":
        moveFocus(addDays(focusDate, -7));
        break;
      case "ArrowDown":
        moveFocus(addDays(focusDate, 7));
        break;
      case "Home":
        moveFocus(addDays(focusDate, -focusDate.getDay()));
        break;
      case "End":
        moveFocus(addDays(focusDate, 6 - focusDate.getDay()));
        break;
      case "PageUp":
        moveFocus(event.shiftKey ? addYears(focusDate, -1) : addMonths(focusDate, -1));
        break;
      case "PageDown":
        moveFocus(event.shiftKey ? addYears(focusDate, 1) : addMonths(focusDate, 1));
        break;
      case "Enter":
      case " ":
        commitSelection(focusDate);
        break;
      case "Escape":
        setOpen(false);
        triggerRef.current?.focus();
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  // After arrow navigation, move real DOM focus to the newly focused day.
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current?.querySelector<HTMLButtonElement>(
      `[data-date="${toISODate(focusDate)}"]`,
    );
    el?.focus();
  }, [focusDate, open]);

  const onInputBlur = () => {
    const parsed = parseISODate(text);
    if (text === "") {
      onChange(null);
    } else if (parsed && !isDisabledDate(parsed)) {
      onChange(parsed);
    } else {
      // Revert invalid text to the last good value.
      setText(value ? toISODate(value) : "");
    }
  };

  const grid = getCalendarGrid(focusDate);
  const viewMonth = focusDate.getMonth();

  return (
    <div className="a11y-datepicker" ref={rootRef}>
      <label htmlFor={baseId} className="a11y-datepicker__label">
        {label}
      </label>
      <div className="a11y-datepicker__control" data-disabled={disabled || undefined}>
        <input
          ref={inputRef}
          id={baseId}
          className="a11y-datepicker__input"
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          aria-describedby={`${baseId}-hint`}
          disabled={disabled}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={onInputBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && !open) {
              e.preventDefault();
              openCalendar();
            }
          }}
        />
        <button
          ref={triggerRef}
          type="button"
          className="a11y-datepicker__trigger"
          aria-label="Choose date"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openCalendar())}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
            <rect x="3" y="4" width="14" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <span id={`${baseId}-hint`} className="a11y-datepicker__hint">
        Format: YYYY-MM-DD
      </span>

      {open && (
        <div
          ref={dialogRef}
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-label={`Choose date, ${label}`}
          className="a11y-datepicker__dialog"
        >
          <div className="a11y-datepicker__nav">
            <button
              type="button"
              className="a11y-datepicker__navbtn"
              aria-label="Previous month"
              onClick={() => moveFocus(addMonths(focusDate, -1))}
            >
              ‹
            </button>
            <span id={gridLabelId} className="a11y-datepicker__monthlabel" aria-live="polite">
              {formatMonthYear(focusDate)}
            </span>
            <button
              type="button"
              className="a11y-datepicker__navbtn"
              aria-label="Next month"
              onClick={() => moveFocus(addMonths(focusDate, 1))}
            >
              ›
            </button>
          </div>

          <table
            role="grid"
            aria-labelledby={gridLabelId}
            className="a11y-datepicker__grid"
            onKeyDown={onGridKeyDown}
          >
            <thead>
              <tr>
                {WEEKDAY_ABBR.map((abbr, i) => (
                  <th key={abbr} scope="col" abbr={WEEKDAYS_LONG[i]}>
                    <span aria-hidden="true">{abbr}</span>
                    <span className="a11y-visually-hidden">{WEEKDAYS_LONG[i]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, week) => (
                <tr key={week}>
                  {grid.slice(week * 7, week * 7 + 7).map((day) => {
                    const outside = day.getMonth() !== viewMonth;
                    const selected = isSameDay(day, value);
                    const isFocusDay = isSameDay(day, focusDate);
                    const dayDisabled = isDisabledDate(day);
                    return (
                      <td key={toISODate(day)} role="gridcell" aria-selected={selected}>
                        <button
                          type="button"
                          tabIndex={isFocusDay ? 0 : -1}
                          data-date={toISODate(day)}
                          data-outside={outside || undefined}
                          data-today={isSameDay(day, startOfDay(new Date())) || undefined}
                          className="a11y-datepicker__day"
                          disabled={dayDisabled}
                          aria-label={formatFullDate(day)}
                          aria-current={isSameDay(day, startOfDay(new Date())) ? "date" : undefined}
                          onClick={() => commitSelection(day)}
                        >
                          {day.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <span id={liveId} role="status" aria-live="polite" className="a11y-visually-hidden">
        {open ? formatFullDate(focusDate) : ""}
      </span>
    </div>
  );
}
