"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

type Options = {
  /** How far the element follows the pointer (0–1 of the offset). */
  strength?: number;
  /** Optional inner element that travels further, for a sense of depth. */
  inner?: RefObject<HTMLElement | null>;
  innerStrength?: number;
};

/**
 * Restrained magnetic pull for fine pointers. Uses quickTo so pointer moves
 * never trigger React renders. No-ops on touch and for reduced motion.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, opts: Options = {}) {
  const { strength = 0.28, inner, innerStrength = 0.14 } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "elastic.out(1, 0.55)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "elastic.out(1, 0.55)" });
    const innerEl = inner?.current;
    const ixTo = innerEl ? gsap.quickTo(innerEl, "x", { duration: 0.9, ease: "power3.out" }) : null;
    const iyTo = innerEl ? gsap.quickTo(innerEl, "y", { duration: 0.9, ease: "power3.out" }) : null;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * innerStrength);
      iyTo?.(dy * innerStrength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([el, innerEl].filter(Boolean));
    };
  }, [ref, inner, strength, innerStrength]);
}
