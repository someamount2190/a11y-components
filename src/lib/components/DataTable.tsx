import { useId, useMemo, useState } from "react";
import "./DataTable.css";

export interface Column<T> {
  /** Stable key; also used as the default sort accessor via `row[key]`. */
  key: string;
  header: React.ReactNode;
  /** Custom cell renderer. Defaults to String(row[key]). */
  render?: (row: T) => React.ReactNode;
  /** Value used for sorting; defaults to row[key]. */
  sortAccessor?: (row: T) => string | number | Date;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  /** Accessible column width hint (CSS value). */
  width?: string;
}

export interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Enable a checkbox selection column. */
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  loading?: boolean;
  /** Rows of skeleton placeholders to show while loading. */
  loadingRows?: number;
  emptyMessage?: string;
  /** Hide the caption visually (still read by screen readers). */
  visuallyHiddenCaption?: boolean;
}

type SortDir = "asc" | "desc";

function compare(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/**
 * Accessible data table with column sorting and optional row selection.
 *
 * Built on a semantic <table> (not role="grid"), which is the correct pattern
 * for static, non-editable tabular data:
 * - Sortable headers are <button>s inside <th>, with aria-sort reflecting state.
 * - Row selection uses real checkboxes; the header checkbox supports mixed state.
 * - First-class loading (skeleton) and empty states, announced politely.
 */
export function DataTable<T>({
  caption,
  columns,
  data,
  getRowId,
  selectable = false,
  selectedIds,
  onSelectionChange,
  loading = false,
  loadingRows = 5,
  emptyMessage = "No data to display",
  visuallyHiddenCaption = false,
}: DataTableProps<T>) {
  const statusId = useId();
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(null);

  // Uncontrolled selection fallback so the table is usable without wiring props.
  const [internalSel, setInternalSel] = useState<Set<string>>(new Set());
  const selection = selectedIds ?? internalSel;
  const setSelection = (next: Set<string>) => {
    onSelectionChange?.(next);
    if (!selectedIds) setInternalSel(next);
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const accessor =
      col.sortAccessor ?? ((row: T) => (row as Record<string, unknown>)[col.key] as never);
    const sorted = [...data].sort((a, b) => compare(accessor(a), accessor(b)));
    return sort.dir === "asc" ? sorted : sorted.reverse();
  }, [data, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null; // Third click clears the sort.
    });
  };

  const allIds = sortedData.map(getRowId);
  const allSelected = allIds.length > 0 && allIds.every((id) => selection.has(id));
  const someSelected = allIds.some((id) => selection.has(id));

  const toggleAll = () => {
    setSelection(allSelected ? new Set() : new Set(allIds));
  };
  const toggleRow = (id: string) => {
    const next = new Set(selection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelection(next);
  };

  const colCount = columns.length + (selectable ? 1 : 0);
  const ariaSort = (key: string): "ascending" | "descending" | "none" =>
    sort?.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  return (
    <div className="a11y-table-wrap">
      <table className="a11y-table">
        <caption className={visuallyHiddenCaption ? "a11y-visually-hidden" : "a11y-table__caption"}>
          {caption}
          {selectable && someSelected && (
            <span className="a11y-table__selcount">
              {" "}
              · {[...selection].filter((id) => allIds.includes(id)).length} selected
            </span>
          )}
        </caption>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="a11y-table__checkcol">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  disabled={loading || allIds.length === 0}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width, textAlign: col.align ?? "start" }}
                aria-sort={col.sortable ? ariaSort(col.key) : undefined}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="a11y-table__sortbtn"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span>{col.header}</span>
                    <span className="a11y-table__sorticon" aria-hidden="true">
                      {sort?.key === col.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }, (_, r) => (
              <tr key={`sk-${r}`} className="a11y-table__skeleton-row">
                {selectable && (
                  <td>
                    <span className="a11y-table__skeleton" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key}>
                    <span className="a11y-table__skeleton" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="a11y-table__empty">
                <div className="a11y-table__empty-inner">
                  <svg aria-hidden="true" viewBox="0 0 48 48" width="40" height="40">
                    <rect x="8" y="10" width="32" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 18h32M16 26h16M16 32h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row) => {
              const id = getRowId(row);
              const isSelected = selection.has(id);
              return (
                <tr key={id} aria-selected={selectable ? isSelected : undefined} data-selected={isSelected || undefined}>
                  {selectable && (
                    <td className="a11y-table__checkcol">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${id}`}
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} style={{ textAlign: col.align ?? "start" }}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <span id={statusId} role="status" aria-live="polite" className="a11y-visually-hidden">
        {loading
          ? "Loading data"
          : sortedData.length === 0
            ? emptyMessage
            : `${sortedData.length} ${sortedData.length === 1 ? "row" : "rows"}${
                sort ? `, sorted by ${sort.key} ${sort.dir === "asc" ? "ascending" : "descending"}` : ""
              }`}
      </span>
    </div>
  );
}
