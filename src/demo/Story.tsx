import type { ReactNode } from "react";

export interface StoryProps {
  id: string;
  title: string;
  description: ReactNode;
  /** Bullet list of accessibility features / keyboard interactions. */
  a11y: ReactNode;
  children: ReactNode;
}

/** Storybook-style section: heading, live canvas, and an a11y notes panel. */
export function Story({ id, title, description, a11y, children }: StoryProps) {
  return (
    <section id={id} className="demo-story" aria-labelledby={`${id}-h`}>
      <div className="demo-story__head">
        <h2 id={`${id}-h`}>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="demo-canvas">{children}</div>
      <div className="demo-a11y">
        <h3>Accessibility &amp; keyboard</h3>
        <ul>{a11y}</ul>
      </div>
    </section>
  );
}
