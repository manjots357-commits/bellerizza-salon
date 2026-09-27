"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ritual } from "@/content/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { useTilt } from "@/hooks/useTilt";

function Arch({ item, index }: { item: (typeof ritual)[number]; index: number }) {
  const tilt = useRef<HTMLDivElement>(null);
  useTilt(tilt, 4);
  return (
    <figure
      data-ritual-panel
      className={`relative flex w-[74vw] shrink-0 snap-center flex-col md:w-[46vw] lg:w-[min(30vw,46vh)] ${
        index % 2 ? "lg:mt-[12vh]" : "lg:-mt-[5vh]"
      }`}
    >
      <div ref={tilt} className="relative will-change-transform">
        <div className="relative aspect-[3/4.2] overflow-hidden rounded-t-full bg-cocoa">
          <div data-ritual-img className="absolute inset-y-0 -left-[12%] -right-[12%]">
            <Image
              src={item.image.src}
              alt={item.image.alt}
              fill
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 52vw, 80vw"
              className="grade object-cover"
              style={{ objectPosition: item.image.focus }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          <span className="sheen" />
        </div>
        {/* Offset hairline arch */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 translate-x-[5%] -translate-y-[3%] rounded-t-full border border-champagne/25"
        />
      </div>
      <figcaption className="relative -mt-[0.55em] flex items-end justify-between gap-4 px-1">
        <span className="font-serif text-[clamp(3.2rem,6vw,6.4rem)] leading-none text-bone">
          <em className="text-champagne">{item.word}</em>
        </span>
        <span className="pb-3 font-sans text-[0.65rem] tracking-[0.22em] text-mist">0{index + 1}</span>
      </figcaption>
      <p className="mt-3 px-1 text-[0.95rem] text-bone/70">{item.line}</p>
    </figure>
  );
}

/**
 * The visit, told as four beats. On desktop the track is pinned and slides
 * horizontally with scroll (and can be dragged); images counter-drift inside
 * their arches. On touch it's a native swipe carousel.
 */
export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;

        const slide = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-ritual-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img,
                containerAnimation: slide,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        gsap.fromTo(
          "[data-ritual-progress]",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true } },
        );

        // Drag to scrub: horizontal drag converts into page scroll.
        let startX = 0;
        let startScroll = 0;
        let dragging = false;
        const down = (e: PointerEvent) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          dragging = true;
          startX = e.clientX;
          startScroll = window.scrollY;
          el.setPointerCapture(e.pointerId);
          el.dataset.dragging = "true";
        };
        const move = (e: PointerEvent) => {
          if (!dragging) return;
          const target = startScroll - (e.clientX - startX) * 1.4;
          const l = lenisRef.current;
          if (l) l.scrollTo(target, { lerp: 0.12 });
          else window.scrollTo(0, target);
        };
        const up = (e: PointerEvent) => {
          if (!dragging) return;
          dragging = false;
          el.releasePointerCapture(e.pointerId);
          el.dataset.dragging = "false";
        };
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        return () => {
          el.removeEventListener("pointerdown", down);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="ritual"
      aria-labelledby="ritual-title"
      className="relative overflow-hidden bg-ink py-[12vh] lg:flex lg:h-screen lg:items-center lg:py-0"
    >
      <div
        ref={track}
        data-cursor="drag"
        className="flex snap-x snap-mandatory scroll-px-5 items-center gap-[6vw] overflow-x-auto px-5 pb-6 md:scroll-px-10 [scrollbar-width:none] md:px-10 lg:motion-safe:snap-none lg:motion-safe:overflow-visible lg:pb-0 lg:pl-10 lg:pr-[12vw] lg:select-none lg:data-[dragging=true]:[&_*]:pointer-events-none"
      >
        <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-center md:w-[52vw] lg:w-[36vw]">
          <p className="eyebrow">
            <span className="text-gold">03</span> — The Ritual
          </p>
          <h2
            id="ritual-title"
            data-cursor="text"
            className="display mt-6 text-[clamp(3.8rem,10vw,10rem)] text-bone"
          >
            The <em>ritual</em>
          </h2>
          <p className="mt-8 max-w-[34ch] text-[0.95rem] leading-relaxed text-bone/70">
            Every appointment follows the same quiet rhythm — so the only thing you need to bring is yourself.
          </p>
          <p className="eyebrow mt-10 flex items-center gap-3 text-[0.6rem] lg:hidden" aria-hidden="true">
            Swipe <span className="h-px w-10 bg-champagne/40" />
          </p>
        </div>
        {ritual.map((item, i) => (
          <Arch key={item.word} item={item} index={i} />
        ))}
      </div>

      <div className="absolute inset-x-10 bottom-10 hidden h-px bg-champagne/10 lg:block" aria-hidden="true">
        <span data-ritual-progress className="block h-full origin-left bg-champagne/70" />
      </div>
    </section>
  );
}
