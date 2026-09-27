"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Orb & ring" cursor — the site's circle-with-offset-ring motif, as a pointer.
 *
 * A precise champagne dot plus a hairline ring that trails slightly behind.
 * The ring reads context from the nearest `[data-cursor]` ancestor:
 *
 *   data-cursor="media"    → ring becomes a solid lens with a label ("View")
 *   data-cursor="service"  → lens shows the service name (data-cursor-label)
 *   data-cursor="text"     → collapses into a slim editorial caret
 *   data-cursor="button"   → steps aside; the magnetic button takes over
 *   data-cursor="drag"     → lens with "Drag"
 *   (any other a / button) → ring tightens around the pointer
 *
 * Runs on a single rAF loop that writes transforms directly — no React state
 * per frame. Only mounts for fine pointers; trailing is removed for reduced
 * motion.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Follow the input device: enable for a mouse, disable for touch (and react
  // if that changes, e.g. a tablet with a keyboard/trackpad attached).
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener("change", sync);
    return () => fine.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = rootRef.current!;
    const ring = ringRef.current!;
    const dot = dotRef.current!;
    const label = labelRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const lerp = reduced ? 1 : 0.16;
    let visible = false;
    let raf = 0;
    let state = "default";

    const setState = (next: string, text = "") => {
      if (next === state && label.textContent === text) return;
      state = next;
      root.dataset.state = next;
      label.textContent = text;
    };

    const resolve = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      const ctx = el?.closest<HTMLElement>("[data-cursor]");
      if (ctx) {
        const kind = ctx.dataset.cursor!;
        const text =
          ctx.dataset.cursorLabel ??
          (kind === "media" ? "View" : kind === "drag" ? "Drag" : kind === "service" ? "Explore" : "");
        setState(kind, text);
        return;
      }
      if (el?.closest("a, button, [role='button'], summary, label")) setState("link");
      else setState("default");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        root.dataset.visible = "true";
      }
    };
    const onOver = (e: PointerEvent) => resolve(e.target);
    const onLeave = () => {
      visible = false;
      root.dataset.visible = "false";
    };
    const onDown = () => (root.dataset.down = "true");
    const onUp = () => (root.dataset.down = "false");
    // Elements that move under a static pointer (scroll) should still update state.
    const onScroll = () => {
      if (!visible) return;
      resolve(document.elementFromPoint(pos.x, pos.y));
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * lerp;
      ringPos.y += (pos.y - ringPos.y) * lerp;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      root.dataset.visible = "false";
    };
  }, [enabled]);

  return (
    <div ref={rootRef} className="cursor" data-state="default" data-visible="false" aria-hidden="true">
      <div ref={ringRef} className="cursor__ring-anchor">
        <div className="cursor__ring">
          <span ref={labelRef} className="cursor__label" />
        </div>
      </div>
      <div ref={dotRef} className="cursor__dot-anchor">
        <div className="cursor__dot" />
      </div>
    </div>
  );
}
