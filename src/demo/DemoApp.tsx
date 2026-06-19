import { useRef, useState } from "react";
import { Modal } from "../lib/components/Modal";
import { Combobox } from "../lib/components/Combobox";
import { DatePicker } from "../lib/components/DatePicker";
import { DataTable, type Column } from "../lib/components/DataTable";
import { Story } from "./Story";
import {
  EMPLOYEES,
  FRAMEWORKS,
  formatDate,
  formatSalary,
  type Employee,
} from "./data";
import "./demo.css";

const NAV = [
  { id: "modal", label: "Modal", badge: "dialog" },
  { id: "combobox", label: "Combobox", badge: "listbox" },
  { id: "datepicker", label: "Date Picker", badge: "grid" },
  { id: "datatable", label: "Data Table", badge: "table" },
];

export function DemoApp({ onBack }: { onBack?: () => void }) {
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Combobox
  const [framework, setFramework] = useState<string | null>("react");
  const [comboLoading, setComboLoading] = useState(false);

  // Date picker
  const [date, setDate] = useState<Date | null>(null);

  // Data table
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tableState, setTableState] = useState<"data" | "loading" | "empty">("data");

  const columns: Column<Employee>[] = [
    { key: "name", header: "Name", sortable: true, width: "22%" },
    { key: "role", header: "Role", sortable: true },
    { key: "team", header: "Team", sortable: true },
    {
      key: "startDate",
      header: "Start date",
      sortable: true,
      sortAccessor: (r) => r.startDate,
      render: (r) => formatDate(r.startDate),
    },
    {
      key: "salary",
      header: "Salary",
      sortable: true,
      align: "end",
      sortAccessor: (r) => r.salary,
      render: (r) => formatSalary(r.salary),
    },
  ];

  const tableData = tableState === "empty" ? [] : EMPLOYEES;

  return (
    <div className="demo-shell">
      <a href="#main" className="a11y-skip-link">
        Skip to content
      </a>

      <aside className="demo-sidebar">
        <div className="demo-brand">
          a11y<span>/</span>components
        </div>
        <p className="demo-tagline">Accessible React primitives, hand-built.</p>
        <nav className="demo-nav" aria-label="Components">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              <span>{item.label}</span>
              <span className="demo-nav-badge">{item.badge}</span>
            </a>
          ))}
        </nav>
        {onBack && (
          <button type="button" className="demo-btn demo-btn--ghost demo-back" onClick={onBack}>
            ← Back to Atlas Hiring
          </button>
        )}
      </aside>

      <main id="main" className="demo-main">
        <header className="demo-hero">
          <h1>Accessibility-first component library</h1>
          <p>
            A small set of polished, reusable UI components built to be fully
            keyboard-navigable and screen-reader correct — no UI framework, just
            React, TypeScript, and the WAI-ARIA Authoring Practices.
          </p>
          <div className="demo-pills">
            <span className="demo-pill">Focus management</span>
            <span className="demo-pill">ARIA roles &amp; state</span>
            <span className="demo-pill">Keyboard parity</span>
            <span className="demo-pill">Empty / loading states</span>
            <span className="demo-pill">Reduced-motion aware</span>
          </div>
        </header>

        {/* ---------------- Modal ---------------- */}
        <Story
          id="modal"
          title="Modal dialog"
          description="A focus-trapping dialog rendered in a portal. Background scroll is locked and focus returns to the trigger on close."
          a11y={
            <>
              <li>
                <code>role="dialog"</code> + <code>aria-modal</code>, labelled by
                its title and described by its body.
              </li>
              <li>Focus is trapped inside and wraps at both ends.</li>
              <li>
                <kbd>Esc</kbd> or an overlay click closes; focus is restored to
                the button that opened it.
              </li>
              <li>Background scroll is locked without layout shift.</li>
            </>
          }
        >
          <button className="demo-btn" onClick={() => setModalOpen(true)}>
            Open dialog
          </button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Delete project?"
            description="This permanently removes the project and all of its data. This action cannot be undone."
            initialFocusRef={confirmRef}
            footer={
              <>
                <button className="demo-btn demo-btn--ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button ref={confirmRef} className="demo-btn" onClick={() => setModalOpen(false)}>
                  Delete project
                </button>
              </>
            }
          >
            <p>
              Try it with the keyboard: <kbd>Tab</kbd> cycles only between the two
              buttons and the close icon — focus never leaks to the page behind.
            </p>
          </Modal>
        </Story>

        {/* ---------------- Combobox ---------------- */}
        <Story
          id="combobox"
          title="Combobox"
          description="An editable single-select with inline filtering, following the ARIA 1.2 combobox + listbox pattern."
          a11y={
            <>
              <li>
                <code>role="combobox"</code> with{" "}
                <code>aria-expanded / aria-controls / aria-activedescendant</code>.
              </li>
              <li>
                <kbd>↑</kbd> <kbd>↓</kbd> move the active option, <kbd>Home</kbd> /{" "}
                <kbd>End</kbd> jump to ends, <kbd>Enter</kbd> selects.
              </li>
              <li>
                <kbd>Esc</kbd> closes the list, or clears the value when already
                closed. Disabled options are skipped.
              </li>
              <li>Result count is announced via a polite live region.</li>
            </>
          }
        >
          <div style={{ flex: "1 1 18rem" }}>
            <Combobox
              label="Favorite framework"
              options={FRAMEWORKS}
              value={framework}
              onChange={setFramework}
              loading={comboLoading}
            />
            <div className="demo-controls">
              <span className="demo-readout">value: {framework ?? "null"}</span>
              <button
                className="demo-btn demo-btn--ghost"
                onClick={() => {
                  setComboLoading(true);
                  window.setTimeout(() => setComboLoading(false), 1200);
                }}
              >
                Simulate async load
              </button>
            </div>
          </div>
        </Story>

        {/* ---------------- Date Picker ---------------- */}
        <Story
          id="datepicker"
          title="Date picker"
          description="An ISO text input paired with a calendar grid dialog. Type a date or pick one — both stay in sync."
          a11y={
            <>
              <li>
                Calendar is a <code>role="grid"</code> of gridcell buttons with
                roving <code>tabindex</code>.
              </li>
              <li>
                <kbd>←↑↓→</kbd> move by day/week, <kbd>PageUp/Down</kbd> by month,
                <kbd>Shift</kbd>+<kbd>PageUp/Down</kbd> by year.
              </li>
              <li>
                <kbd>Home</kbd> / <kbd>End</kbd> jump to start/end of week;{" "}
                <kbd>Enter</kbd> selects, <kbd>Esc</kbd> closes.
              </li>
              <li>The focused day is announced as it changes; min/max bound selection.</li>
            </>
          }
        >
          <div>
            <DatePicker
              label="Start date"
              value={date}
              onChange={setDate}
              min={new Date(2020, 0, 1)}
              max={new Date(2030, 11, 31)}
            />
            <p className="demo-readout" style={{ marginTop: "0.75rem" }}>
              selected: {date ? date.toDateString() : "none"}
            </p>
          </div>
        </Story>

        {/* ---------------- Data Table ---------------- */}
        <Story
          id="datatable"
          title="Data table"
          description="A sortable, selectable table built on semantic markup, with first-class loading and empty states."
          a11y={
            <>
              <li>
                Semantic <code>&lt;table&gt;</code> with a <code>&lt;caption&gt;</code>;
                sortable headers are buttons exposing <code>aria-sort</code>.
              </li>
              <li>
                Selection uses real checkboxes; the header checkbox shows a mixed
                (indeterminate) state.
              </li>
              <li>Loading shows shimmer skeletons; empty shows a clear message — both announced.</li>
              <li>Click a sortable header three times to cycle asc → desc → unsorted.</li>
            </>
          }
        >
          <div style={{ width: "100%" }}>
            <div className="demo-controls" style={{ marginBottom: "1rem", marginTop: 0 }}>
              <span className="demo-readout">state:</span>
              {(["data", "loading", "empty"] as const).map((s) => (
                <label key={s} className="demo-toggle">
                  <input
                    type="radio"
                    name="tablestate"
                    checked={tableState === s}
                    onChange={() => setTableState(s)}
                  />
                  {s}
                </label>
              ))}
              <span className="demo-readout">· {selected.size} selected</span>
            </div>
            <DataTable
              caption="Engineering team"
              columns={columns}
              data={tableData}
              getRowId={(r) => r.id}
              selectable
              selectedIds={selected}
              onSelectionChange={setSelected}
              loading={tableState === "loading"}
            />
          </div>
        </Story>

        <footer style={{ marginTop: "4rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Built with React + TypeScript. Every component follows the{" "}
          <a href="https://www.w3.org/WAI/ARIA/apg/" target="_blank" rel="noreferrer">
            WAI-ARIA Authoring Practices
          </a>
          .
        </footer>
      </main>
    </div>
  );
}
