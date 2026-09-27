"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Subtle 3D tilt with a cursor-following light. The element should contain a
 * `.sheen` child; its position is driven through CSS custom properties.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 5) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, "rotationX", { duration: 1, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 1, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2);
      rx(-(py - 0.5) * max * 2);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, max]);
}
