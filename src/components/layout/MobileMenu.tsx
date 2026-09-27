"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { brand, getChannels, heroImages, nav } from "@/content/site";
import { Orb } from "@/components/ui/Orb";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { ChannelIcon } from "@/components/ui/Icons";

type Props = { open: boolean; onClose: () => void };

/**
 * Full-screen menu for touch / narrow viewports. The panel wipes down from
 * the top and the serif links rise from their masks. Escape closes, focus is
 * held inside while open, and the page scroll is locked.
 */
export function MobileMenu({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);
  const { lock, unlock } = useSmoothScroll();
  const channels = getChannels();

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(ref.current, { visibility: "visible" })
        .fromTo(
          ref.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: reduced ? 0 : 1.1, ease: "expo.inOut" },
        )
        .from(
          "[data-menu-link]",
          { yPercent: 110, duration: reduced ? 0 : 1.2, stagger: 0.06 },
          reduced ? 0 : "-=0.45",
        )
        .from("[data-menu-fade]", { autoAlpha: 0, y: 12, duration: reduced ? 0 : 1 }, "<0.2");
    },
    { scope: ref },
  );

  const wasOpen = useRef(false);
  useEffect(() => {
    const t = tl.current;
    if (!t || open === wasOpen.current) return;
    wasOpen.current = open;
    if (open) {
      lock();
      t.timeScale(1).play();
      requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("a, button")?.focus());
    } else {
      t.timeScale(1.6).reverse();
      unlock();
    }
  }, [open, lock, unlock]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
      className="invisible fixed inset-0 z-[60] flex flex-col bg-espresso px-5 pb-8 pt-5"
    >
      <div className="flex h-[52px] items-center justify-between">
        <span data-menu-fade className="font-serif text-[1.7rem] leading-none">
          {brand.name}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 items-center gap-3 px-2 text-[0.7rem] font-medium uppercase tracking-[0.26em]"
        >
          Close
          <span aria-hidden="true" className="relative block h-4 w-4">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-champagne" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-champagne" />
          </span>
        </button>
      </div>

      <div data-menu-fade aria-hidden="true" className="pointer-events-none absolute right-[8%] top-[13%] w-[40vw] max-w-[260px]">
        <Orb image={heroImages.portrait} sizes="40vw" ring={{ x: -0.1, y: 0.08 }} />
      </div>

      <nav aria-label="Menu" className="mt-auto">
        <ul className="space-y-1">
          {nav.map((item, i) => (
            <li key={item.href} className="overflow-hidden">
              <a
                data-menu-link
                href={item.href}
                onClick={onClose}
                className="flex items-baseline gap-4 py-1 font-serif text-[clamp(3rem,13vw,5.5rem)] leading-[1] text-bone active:text-champagne"
              >
                <span className="font-sans text-[0.65rem] tracking-[0.2em] text-mist">
                  0{i + 1}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div data-menu-fade className="mt-10 border-t hairline pt-6">
        {channels.length > 0 ? (
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {channels.map((c) => (
              <li key={c.kind}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2 text-sm text-bone/80"
                >
                  <ChannelIcon kind={c.kind} />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="eyebrow">{brand.tagline}</p>
        )}
      </div>
    </div>
  );
}
