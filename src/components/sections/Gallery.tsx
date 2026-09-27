"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { gallery } from "@/content/site";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Lightbox } from "./Lightbox";

const ratioClass = {
  tall: "aspect-[3/4.4]",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  wide: "aspect-[5/4]",
} as const;

/**
 * "The Edit" — a campaign-style gallery. Three columns of differing widths
 * drift at different speeds (depth), images reveal from masks, hovering one
 * dims the rest, and any image opens in a full-screen lightbox.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const columns = [0, 1, 2].map((c) =>
    gallery.map((item, i) => ({ item, i })).filter(({ i }) => i % 3 === c),
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-edit-media]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(18% 12% 18% 12%)", scale: 0.94 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1.8,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          );
        });
      });
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const speeds = [0, -14, -6];
        gsap.utils.toArray<HTMLElement>("[data-edit-col]").forEach((col, i) => {
          gsap.to(col, {
            yPercent: speeds[i],
            ease: "none",
            scrollTrigger: { trigger: "[data-edit-grid]", start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="gallery" aria-labelledby="gallery-title" className="relative px-5 py-[18vh] md:px-10">
      <header className="mx-auto mb-[12vh] grid max-w-[1400px] items-end gap-8 lg:grid-cols-[1fr_4fr]">
        <p className="eyebrow pb-4">
          <span className="text-gold">05</span> — Gallery
        </p>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <AnimatedText
            as="h2"
            id="gallery-title"
            split="chars"
            cursor="text"
            className="display text-[clamp(4rem,13vw,14rem)] text-bone"
          >
            The <em>Edit</em>
          </AnimatedText>
          <p className="max-w-[30ch] pb-4 text-[0.95rem] leading-relaxed text-bone/70">
            A study in light, skin and detail.
          </p>
        </div>
      </header>

      <div
        data-edit-grid
        className="edit-grid mx-auto grid max-w-[1400px] grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-[1.15fr_0.8fr_1fr] md:gap-x-[4vw]"
      >
        {columns.map((col, c) => (
          <div
            key={c}
            data-edit-col
            className={`flex flex-col gap-10 md:gap-[9vh] ${c === 1 ? "md:mt-[22vh]" : c === 2 ? "max-md:col-span-2 max-md:grid max-md:grid-cols-2 max-md:gap-4 md:mt-[9vh]" : ""}`}
          >
            {col.map(({ item, i }) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setOpen(i)}
                className="edit-item group block text-left"
                data-cursor="media"
                data-cursor-label="View"
                aria-label={`Open image: ${item.title}`}
              >
                <div data-edit-media className="edit-item__media relative overflow-hidden bg-cocoa">
                  <div className={ratioClass[item.ratio]}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 768px) 36vw, 50vw"
                      className="edit-item__img grade object-cover"
                      style={{ objectPosition: item.focus }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="edit-item__caption overflow-hidden font-serif text-xl italic text-champagne md:text-2xl">
                    <span>{item.title}</span>
                  </span>
                  <span className="font-sans text-[0.62rem] tracking-[0.22em] text-mist">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      <Lightbox index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
