import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable, type Column } from "./DataTable";

interface Row {
  id: string;
  name: string;
  score: number;
}
const DATA: Row[] = [
  { id: "1", name: "Charlie", score: 30 },
  { id: "2", name: "Alice", score: 90 },
  { id: "3", name: "Bob", score: 60 },
];
const COLUMNS: Column<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "score", header: "Score", sortable: true, sortAccessor: (r) => r.score },
];

const rowNames = () =>
  screen
    .getAllByRole("row")
    .slice(1) // drop header row
    .map((r) => within(r).getAllByRole("cell")[0].textContent);

describe("DataTable", () => {
  it("sorts ascending, descending, then clears on repeated header clicks", async () => {
    const user = userEvent.setup();
    render(<DataTable caption="Players" columns={COLUMNS} data={DATA} getRowId={(r) => r.id} />);
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
    const sortBtn = within(nameHeader).getByRole("button");

    await user.click(sortBtn);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(rowNames()).toEqual(["Alice", "Bob", "Charlie"]);

    await user.click(sortBtn);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(rowNames()).toEqual(["Charlie", "Bob", "Alice"]);

    await user.click(sortBtn);
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    expect(rowNames()).toEqual(["Charlie", "Alice", "Bob"]); // original order
  });

  it("sorts numerically using the sort accessor", async () => {
    const user = userEvent.setup();
    render(<DataTable caption="Players" columns={COLUMNS} data={DATA} getRowId={(r) => r.id} />);
    await user.click(within(screen.getByRole("columnheader", { name: /Score/ })).getByRole("button"));
    expect(rowNames()).toEqual(["Charlie", "Bob", "Alice"]); // 30, 60, 90
  });

  it("supports select-all with an indeterminate header checkbox", async () => {
    const user = userEvent.setup();
    render(
      <DataTable caption="Players" columns={COLUMNS} data={DATA} getRowId={(r) => r.id} selectable />,
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    const firstRow = screen.getByRole("checkbox", { name: "Select row 1" });

    await user.click(firstRow);
    expect(selectAll.indeterminate).toBe(true);

    await user.click(selectAll);
    screen
      .getAllByRole("checkbox")
      .forEach((cb) => expect(cb).toBeChecked());
  });

  it("renders an empty state and a loading state", () => {
    const { rerender } = render(
      <DataTable caption="Players" columns={COLUMNS} data={[]} getRowId={(r) => r.id} emptyMessage="Nothing here" />,
    );
    // Shown in the cell and echoed in the live region — both are intentional.
    expect(screen.getAllByText("Nothing here").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing here");

    rerender(
      <DataTable caption="Players" columns={COLUMNS} data={DATA} getRowId={(r) => r.id} loading />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading data");
  });
});
