"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { gallery } from "@/content/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { ArrowIcon } from "@/components/ui/Icons";

type Props = {
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
};

/**
 * Full-screen viewer for the gallery. Keyboard (Esc / ← / →), swipe on
 * touch, focus is trapped while open and returned to the thumbnail after.
 */
export function Lightbox({ index, onClose, onIndex }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const { lock, unlock } = useSmoothScroll();
  const open = index !== null;
  const n = gallery.length;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = (dir: 1 | -1) => {
    if (index === null) return;
    onIndex((index + dir + n) % n);
  };

  // Open / close choreography.
  useEffect(() => {
    const el = ref.current!;
    if (open) {
      opener.current = document.activeElement as HTMLElement;
      lock();
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced() ? 0 : 0.6, ease: "power2.out", overwrite: true });
      el.querySelector<HTMLElement>("[data-lb-close]")?.focus();
      return () => {
        unlock();
        gsap.to(el, {
          autoAlpha: 0,
          duration: reduced() ? 0 : 0.45,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            gsap.set(el, { display: "none" });
          },
        });
        opener.current?.focus({ preventScroll: true });
      };
    }
  }, [open, lock, unlock]);

  // Image change transition.
  useEffect(() => {
    if (index === null || !imgRef.current || reduced()) return;
    gsap.fromTo(
      imgRef.current,
      { autoAlpha: 0, scale: 1.04, clipPath: "inset(6% 6% 6% 6%)" },
      { autoAlpha: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out" },
    );
  }, [index]);

  // Keyboard + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("button");
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
  });

  // Swipe.
  const touchX = useRef<number | null>(null);

  const item = index !== null ? gallery[index] : null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] hidden flex-col bg-ink/[0.97] opacity-0 backdrop-blur-sm"
      onPointerDown={(e) => (touchX.current = e.pointerType === "touch" ? e.clientX : null)}
      onPointerUp={(e) => {
        if (touchX.current === null) return;
        const dx = e.clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between px-5 md:h-[84px] md:px-10">
        <p className="font-sans text-[0.7rem] tracking-[0.26em] text-mist" aria-live="polite">
          {index !== null && (
            <>
              <span className="text-bone">{String(index + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </>
          )}
        </p>
        <button
          data-lb-close
          type="button"
          onClick={onClose}
          className="flex h-11 items-center gap-3 px-2 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-bone"
        >
          Close
          <span aria-hidden="true" className="relative block h-4 w-4">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-champagne" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-champagne" />
          </span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 md:px-24">
        {item && (
          <figure className="flex h-full max-h-full w-full flex-col items-center justify-center">
            <div ref={imgRef} className="relative h-[72vh] w-full max-w-[min(90vw,62vh)]">
              <Image
                key={item.src}
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 62vh, 90vw"
                className="object-cover"
                style={{ objectPosition: item.focus }}
              />
            </div>
            <figcaption className="mt-5 font-serif text-2xl italic text-champagne">{item.title}</figcaption>
          </figure>
        )}

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-champagne/25 text-champagne transition-colors hover:bg-champagne hover:text-ink md:left-8"
        >
          <ArrowIcon className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next image"
          className="absolute right-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-champagne/25 text-champagne transition-colors hover:bg-champagne hover:text-ink md:right-8"
        >
          <ArrowIcon />
        </button>
      </div>
      <div className="h-8 shrink-0" />
    </div>
  );
}
