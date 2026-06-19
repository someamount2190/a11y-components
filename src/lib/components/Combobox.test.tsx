import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Combobox, type ComboboxOption } from "./Combobox";

const OPTIONS: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "ember", label: "Ember", disabled: true },
];

function Harness() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox label="Framework" options={OPTIONS} value={value} onChange={setValue} />
  );
}

describe("Combobox", () => {
  it("wires combobox ARIA attributes to the listbox", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Framework" });
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
  });

  it("navigates options with the keyboard and selects with Enter", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Framework" });
    await user.click(input);

    await user.keyboard("{ArrowDown}"); // React
    await user.keyboard("{ArrowDown}"); // Vue
    const active = input.getAttribute("aria-activedescendant");
    expect(screen.getByRole("option", { name: "Vue" }).id).toBe(active);

    await user.keyboard("{Enter}");
    expect(input).toHaveValue("Vue");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters options by typed query and shows an empty message", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Framework" });
    await user.click(input);
    await user.type(input, "sv");

    const list = screen.getByRole("listbox");
    expect(within(list).getByRole("option", { name: "Svelte" })).toBeInTheDocument();
    expect(within(list).queryByRole("option", { name: "React" })).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "zzz");
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("skips disabled options during keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Framework" });
    await user.click(input);

    await user.keyboard("{End}"); // should land on last *enabled* (Svelte), not Ember
    const active = input.getAttribute("aria-activedescendant");
    expect(screen.getByRole("option", { name: "Svelte" }).id).toBe(active);
  });

  it("closes on Escape without selecting", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Framework" });
    await user.click(input);
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
  });
});
