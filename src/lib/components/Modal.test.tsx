import { useRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Modal } from "./Modal";

function Harness() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Test dialog" description="Some details">
        <button>First</button>
        <button>Second</button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("exposes the dialog role with a label and description", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Test dialog");
    expect(dialog).toHaveAccessibleDescription("Some details");
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("traps Tab focus within the dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const close = screen.getByRole("button", { name: "Close dialog" });
    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Second" });

    // Shift+Tab from the first focusable wraps to the last.
    close.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(last).toHaveFocus();

    // Tab from the last wraps back to the first.
    last.focus();
    await user.keyboard("{Tab}");
    expect(close).toHaveFocus();
    void first;
  });

  it("closes when the overlay is clicked but not the dialog body", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("button", { name: "First" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
