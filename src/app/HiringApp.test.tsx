import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HiringApp } from "./HiringApp";

const openMaya = async (user: ReturnType<typeof userEvent.setup>) => {
  // The table fetch is simulated (~900ms); wait for the row to render.
  const nameButton = await screen.findByRole(
    "button",
    { name: "Maya Okonkwo" },
    { timeout: 3000 },
  );
  await user.click(nameButton);
  return screen.getByRole("dialog", { name: "Maya Okonkwo" });
};

describe("HiringApp candidate drawer", () => {
  it("opens a full candidate profile from the table", async () => {
    const user = userEvent.setup();
    render(<HiringApp onOpenDocs={() => {}} />);
    const dialog = await openMaya(user);

    // Profile essentials are present in the overview.
    expect(within(dialog).getByText("maya.okonkwo@mail.com")).toBeInTheDocument();
    // Position appears in both the header and the application card.
    expect(within(dialog).getAllByText(/Senior Frontend Engineer/).length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("heading", { name: "Skills" })).toBeInTheDocument();
    // Pipeline stepper is exposed as a labelled list.
    expect(within(dialog).getByRole("list", { name: "Pipeline progress" })).toBeInTheDocument();
  });

  it("navigates tabs with arrow keys and shows interview history", async () => {
    const user = userEvent.setup();
    render(<HiringApp onOpenDocs={() => {}} />);
    const dialog = await openMaya(user);

    const overviewTab = within(dialog).getByRole("tab", { name: /Overview/ });
    overviewTab.focus();
    await user.keyboard("{ArrowRight}"); // -> Interviews
    expect(within(dialog).getByRole("tab", { name: /Interviews/ })).toHaveAttribute("aria-selected", "true");
    expect(within(dialog).getByText("Recruiter Screen")).toBeInTheDocument();
    expect(within(dialog).getByText("System Design")).toBeInTheDocument();
  });

  it("lets a recruiter post a note onto the activity timeline", async () => {
    const user = userEvent.setup();
    render(<HiringApp onOpenDocs={() => {}} />);
    const dialog = await openMaya(user);

    await user.click(within(dialog).getByRole("tab", { name: /Activity/ }));
    const composer = within(dialog).getByPlaceholderText(/Leave a note/);
    await user.type(composer, "Strong portfolio, fast-track to onsite.");
    await user.click(within(dialog).getByRole("button", { name: /Post/ }));

    expect(within(dialog).getByText("Strong portfolio, fast-track to onsite.")).toBeInTheDocument();
  });

  it("advances a candidate through the pipeline", async () => {
    const user = userEvent.setup();
    render(<HiringApp onOpenDocs={() => {}} />);
    const dialog = await openMaya(user);

    // Maya starts in Interview; advancing moves her to Offer.
    await user.click(within(dialog).getByRole("button", { name: /Advance to Offer/ }));
    expect(await within(dialog).findByRole("button", { name: /Advance to Hired/ })).toBeInTheDocument();
  });

  it("closes the drawer on Escape", async () => {
    const user = userEvent.setup();
    render(<HiringApp onOpenDocs={() => {}} />);
    await openMaya(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Maya Okonkwo" })).not.toBeInTheDocument();
  });
});
