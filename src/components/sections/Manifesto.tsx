"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { services } from "@/content/site";

/** Inline image "pill" set into the running text — expands on hover. */
function Pill({ index }: { index: number }) {
  const img = services[index].image;
  return (
    <span
      className="group/pill relative mx-[0.12em] inline-block h-[0.78em] w-[1.5em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline transition-[width] duration-700 ease-[var(--ease-expo)] hover:w-[2.4em]"
      data-cursor="media"
      data-cursor-label={services[index].name}
    >
      <Image
        src={img.src}
        alt=""
        fill
        sizes="160px"
        className="object-cover transition-transform duration-1000 ease-[var(--ease-expo)] group-hover/pill:scale-110"
        style={{ objectPosition: img.focus }}
      />
    </span>
  );
}

/**
 * Editorial statement. Words brighten one by one as the reader scrolls,
 * with small image pills set into the line like an art-directed magazine spread.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create("[data-manifesto]", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: "[data-manifesto]",
              start: "top 78%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );
        gsap.from("[data-manifesto-pill]", {
          scale: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.15,
          scrollTrigger: { trigger: "[data-manifesto]", start: "top 70%", once: true },
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="manifesto-label"
      className="relative px-5 py-[22vh] md:px-10 lg:py-[30vh]"
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_4fr]">
        <p id="manifesto-label" className="eyebrow pt-3">
          <span className="text-gold">01</span> — The Atelier
        </p>
        <p
          data-manifesto
          data-cursor="text"
          className="font-serif text-[clamp(2.1rem,5.4vw,5.6rem)] leading-[1.02] tracking-[-0.015em] text-bone"
        >
          Beauty lives in the details
          <span data-manifesto-pill className="inline-block">
            <Pill index={0} />
          </span>
          — a steady hand, an <em className="text-champagne">unhurried</em> hour
          <span data-manifesto-pill className="inline-block">
            <Pill index={4} />
          </span>
          and care that leaves you feeling entirely, <em className="text-champagne">quietly</em> yourself.
        </p>
      </div>
    </section>
  );
}
