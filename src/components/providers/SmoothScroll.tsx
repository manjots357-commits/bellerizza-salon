"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ScrollApi = {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
  lock: () => void;
  unlock: () => void;
};

const ScrollContext = createContext<ScrollApi>({
  lenis: null,
  scrollTo: () => {},
  lock: () => {},
  unlock: () => {},
});

export const useSmoothScroll = () => useContext(ScrollContext);

/**
 * Lenis smooth scrolling driven by the GSAP ticker so ScrollTrigger and
 * Lenis share one frame loop. Disabled entirely for reduced motion.
 * Also routes in-page anchor links through Lenis.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lockCount = useRef(0);

  useEffect(() => {
    // The opening sequence is choreographed from the top; don't restore mid-page
    // (unless a specific section was linked).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // Anchor links → smooth scroll (or native jump when Lenis is off).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      const el = id === "#top" ? document.body : document.querySelector<HTMLElement>(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
      else el.scrollIntoView({ behavior: "auto" });
      history.replaceState(null, "", id === "#top" ? " " : id);
      // Move focus for keyboard / screen-reader users without a second jump.
      if (el !== document.body) {
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  const api = useMemo<ScrollApi>(() => ({
    lenis,
    scrollTo: (target, opts) => {
      if (lenis) lenis.scrollTo(target, { offset: opts?.offset ?? 0, immediate: opts?.immediate, duration: 1.6 });
      else if (typeof target === "number") window.scrollTo({ top: target });
      else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        el?.scrollIntoView();
      }
    },
    lock: () => {
      lockCount.current += 1;
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    },
    unlock: () => {
      lockCount.current = Math.max(0, lockCount.current - 1);
      if (lockCount.current === 0) {
        lenis?.start();
        document.documentElement.style.overflow = "";
      }
    },
  }), [lenis]);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
