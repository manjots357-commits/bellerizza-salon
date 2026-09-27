import type { CSSProperties } from "react";

/**
 * Letter-by-letter vertical roll on hover (pure CSS). The visible copy slides
 * up and a duplicate rolls in beneath it with a per-letter stagger.
 * Screen readers get the plain text once.
 */
export function RollText({ text, className }: { text: string; className?: string }) {
  const letters = Array.from(text);
  const render = (copy: "a" | "b") => (
    <span className={`roll__row roll__row--${copy}`} aria-hidden="true">
      {letters.map((ch, i) => (
        <span key={i} className="roll__ch" style={{ "--i": i } as CSSProperties}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
  return (
    <span className={`roll ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      {render("a")}
      {render("b")}
    </span>
  );
}
