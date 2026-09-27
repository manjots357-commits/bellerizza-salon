"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { markIntroDone } from "@/lib/intro";
import { brand } from "@/content/site";

const SEEN_KEY = "intro-seen";

function waitForHero(): Promise<void> {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const img = document.querySelector<HTMLImageElement>("[data-hero-image] img");
  const image =
    !img || img.complete
      ? Promise.resolve()
      : new Promise<void>((res) => {
          img.addEventListener("load", () => res(), { once: true });
          img.addEventListener("error", () => res(), { once: true });
        });
  const cap = new Promise<void>((res) => setTimeout(res, 2200));
  return Promise.race([Promise.all([fonts, image]).then(() => undefined), cap]);
}

/**
 * Opening curtain: the wordmark rises, a hairline draws while the hero image
 * and fonts load, then the curtain lifts to reveal the hero. Shortened on
 * repeat visits in the same session; skipped for reduced motion.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current!;
      let alive = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {}

      const finish = () => {
        el.style.display = "none";
        markIntroDone();
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
      };

      if (reduced) return finish();

      if (seen) {
        gsap.to(el, { autoAlpha: 0, duration: 0.6, ease: "power2.out", onStart: markIntroDone, onComplete: finish });
        return;
      }

      const intro = gsap
        .timeline()
        .from("[data-pl-char]", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.03 })
        .from("[data-pl-sub]", { autoAlpha: 0, y: 10, duration: 0.8 }, "-=0.8")
        .fromTo("[data-pl-line]", { scaleX: 0 }, { scaleX: 0.7, duration: 1.2, ease: "power2.inOut" }, "<");

      const outro = contextSafe!(() => {
        if (!alive) return;
        gsap
            .timeline({ onComplete: finish })
            .to("[data-pl-line]", { scaleX: 1, duration: 0.35, ease: "power2.out" })
            .to("[data-pl-char]", { yPercent: -110, duration: 0.7, ease: "expo.in", stagger: 0.018 }, "-=0.05")
            .to("[data-pl-sub], [data-pl-line]", { autoAlpha: 0, duration: 0.3 }, "<")
            .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.3")
            .add(markIntroDone, "-=0.8");
      });
      waitForHero().then(() => intro.then(outro));

      return () => {
        alive = false;
      };
    },
    { scope: ref },
  );

  return (
    <>
      <noscript>
        <style>{`.preloader{display:none!important}`}</style>
      </noscript>
      <div
        ref={ref}
        className="preloader fixed inset-0 z-[90] flex flex-col items-center justify-center bg-espresso"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        aria-hidden="true"
      >
        <div>
          <p className="display flex overflow-hidden pb-[0.08em] pt-[0.22em] text-[clamp(3.2rem,9vw,8rem)] text-bone">
            {Array.from(brand.name).map((ch, i) => (
              <span key={i} data-pl-char className={i > brand.name.indexOf(" ") ? "inline-block italic text-champagne" : "inline-block"}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </p>
        </div>
        <span data-pl-line className="mt-6 block h-px w-[min(260px,50vw)] origin-left bg-gold/70" />
        <p data-pl-sub className="eyebrow mt-5">
          {brand.descriptor}
        </p>
      </div>
    </>
  );
}
