import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import "./Combobox.css";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional secondary text shown beneath the label. */
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  label: string;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Show a loading state in the popup (e.g. async results). */
  loading?: boolean;
  /** Message shown when no options match the query. */
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
}

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Accessible single-select combobox with inline list filtering.
 *
 * Implements the WAI-ARIA 1.2 combobox pattern with a listbox popup:
 * - role="combobox" input with aria-expanded / aria-controls / aria-activedescendant.
 * - Roving "active option" via aria-activedescendant (focus stays in the input).
 * - Full keyboard support: ArrowUp/Down, Home/End, Enter, Escape, Alt+ArrowDown.
 * - Result count is announced politely to screen readers.
 */
export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Search…",
  loading = false,
  emptyMessage = "No results found",
  disabled = false,
  id,
}: ComboboxProps) {
  const reactId = useId();
  const baseId = id ?? reactId;
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;
  const statusId = `${baseId}-status`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? null;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  // When closed, the input reflects the selected label; when open, the query.
  const inputValue = open ? query : selectedOption?.label ?? "";

  const filtered = useMemo(() => {
    if (!open || norm(query) === norm(selectedOption?.label ?? "")) return options;
    const q = norm(query);
    if (!q) return options;
    return options.filter(
      (o) => norm(o.label).includes(q) || norm(o.description ?? "").includes(q),
    );
  }, [open, query, options, selectedOption]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
  }, []);

  useOnClickOutside([rootRef], close, open);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    const current = filtered.findIndex((o) => o.value === value);
    setActiveIndex(current);
  };

  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) return;
    onChange(option.value);
    close();
    inputRef.current?.focus();
  };

  const moveActive = (delta: number) => {
    const enabled = filtered
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled);
    if (enabled.length === 0) return;
    const positions = enabled.map((e) => e.i);
    const currentPos = positions.indexOf(activeIndex);
    let nextPos = currentPos + delta;
    if (nextPos < 0) nextPos = positions.length - 1;
    if (nextPos >= positions.length) nextPos = 0;
    setActiveIndex(positions[nextPos]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openList();
        else moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openList();
        else moveActive(-1);
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(filtered.findIndex((o) => !o.disabled));
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          for (let i = filtered.length - 1; i >= 0; i--) {
            if (!filtered[i].disabled) {
              setActiveIndex(i);
              break;
            }
          }
        }
        break;
      case "Enter":
        if (open && activeIndex >= 0 && filtered[activeIndex]) {
          event.preventDefault();
          selectOption(filtered[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close();
        } else if (value) {
          onChange(null);
        }
        break;
      case "Tab":
        if (open) close();
        break;
    }
  };

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);
    setQuery(event.target.value);
    setActiveIndex(-1);
  };

  const activeId =
    open && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined;

  const statusText = loading
    ? "Loading options"
    : open
      ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"} available`
      : "";

  return (
    <div className="a11y-combobox" ref={rootRef}>
      <label id={labelId} htmlFor={baseId} className="a11y-combobox__label">
        {label}
      </label>
      <div className="a11y-combobox__control" data-disabled={disabled || undefined}>
        <input
          ref={inputRef}
          id={baseId}
          className="a11y-combobox__input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={onInput}
          onKeyDown={onKeyDown}
          onClick={() => (open ? undefined : openList())}
        />
        {value && !disabled && (
          <button
            type="button"
            className="a11y-combobox__clear"
            aria-label="Clear selection"
            onClick={() => {
              onChange(null);
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="a11y-combobox__toggle"
          aria-label={open ? "Close suggestions" : "Open suggestions"}
          tabIndex={-1}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" data-open={open}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="a11y-combobox__listbox"
        >
          {loading ? (
            <li className="a11y-combobox__message" role="presentation">
              <span className="a11y-combobox__spinner" aria-hidden="true" />
              Loading…
            </li>
          ) : filtered.length === 0 ? (
            <li className="a11y-combobox__message" role="presentation">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${baseId}-option-${index}`}
                role="option"
                data-index={index}
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                className="a11y-combobox__option"
                data-active={index === activeIndex || undefined}
                // pointerdown (not click) keeps the input from blurring first.
                onPointerDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
                onMouseMove={() => setActiveIndex(index)}
              >
                <span className="a11y-combobox__option-label">{option.label}</span>
                {option.description && (
                  <span className="a11y-combobox__option-desc">
                    {option.description}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      <span id={statusId} role="status" aria-live="polite" className="a11y-visually-hidden">
        {statusText}
      </span>
    </div>
  );
}
