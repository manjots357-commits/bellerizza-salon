"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { story } from "@/content/site";
import { Orb } from "@/components/ui/Orb";

/**
 * Brand story as a single camera move: a small circular portrait sits
 * between two halves of a sentence, then opens into a full-bleed frame as
 * the words part — and the answer is written over the image.
 */
export function Story() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const answer = SplitText.create("[data-story-answer]", { type: "lines,words", mask: "lines" });
        gsap.set("[data-story-answer]", { autoAlpha: 1 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (isDesktop ? 2.2 : 1.6)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          "[data-story-frame]",
          { clipPath: `circle(${isDesktop ? 17 : 26}% at 50% 50%)` },
          { clipPath: "circle(75% at 50% 50%)", duration: 1, ease: "power2.inOut" },
          0,
        )
          // Start framed on the profile, drift back to the full composition.
          .fromTo(
            "[data-story-img]",
            { scale: 1.35, xPercent: isDesktop ? 34 : 18, yPercent: isDesktop ? -30 : -12 },
            { scale: 1, xPercent: 0, yPercent: 0, duration: 1.2 },
            0,
          )
          .to("[data-story-left]", { xPercent: -60, opacity: 0, duration: 0.6 }, 0)
          .to("[data-story-right]", { xPercent: 60, opacity: 0, duration: 0.6 }, 0)
          .to("[data-story-ring]", { scale: 3, opacity: 0, duration: 0.7 }, 0)
          .to("[data-story-shade]", { opacity: 1, duration: 0.5 }, 0.55)
          .from(answer.words, { yPercent: 110, stagger: 0.02, duration: 0.35, ease: "power3.out" }, 0.7)
          .from("[data-story-body]", { autoAlpha: 0, y: 30, duration: 0.3 }, 0.95)
          .from("[data-story-orb]", { yPercent: 40, autoAlpha: 0, duration: 0.4 }, 0.95)
          .to({}, { duration: 0.25 });

        return () => answer.revert();
      });

      mm.add(MQ.reduced, () => {
        gsap.set("[data-story-answer]", { autoAlpha: 1 });
        gsap.set("[data-story-frame]", { clipPath: "none" });
        gsap.set("[data-story-left], [data-story-right], [data-story-ring]", { autoAlpha: 0 });
        gsap.set("[data-story-shade]", { opacity: 1 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="story"
      aria-labelledby="story-title"
      className="relative h-screen overflow-hidden bg-ink"
    >
      {/* Expanding frame */}
      <div data-story-frame className="absolute inset-0" style={{ clipPath: "circle(17% at 50% 50%)" }}>
        <div data-story-img className="absolute inset-0 will-change-transform">
          <Image
            src={story.image.src}
            alt={story.image.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: story.image.focus }}
          />
        </div>
        <div
          data-story-shade
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(11_8_6/0.88)_0%,rgb(11_8_6/0.55)_50%,rgb(11_8_6/0.15)_100%)] opacity-0"
        />
      </div>

      <span
        data-story-ring
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(40vw,40vh)] -translate-x-[46%] -translate-y-[54%] rounded-full border border-champagne/30 max-lg:w-[58vw]"
      />

      {/* The question, split around the circle */}
      <p
        aria-hidden="true"
        className="display pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-5 text-[clamp(2.6rem,8vw,9rem)] text-bone md:px-10"
      >
        <span data-story-left>Beauty is</span>
        <span data-story-right className="italic text-champagne">
          not added.
        </span>
      </p>

      {/* The answer */}
      <div className="relative z-10 flex h-full flex-col justify-center px-5 md:px-10">
        <p className="eyebrow">
          <span className="text-gold">04</span> — Our Story
        </p>
        <h2
          id="story-title"
          data-story-answer
          data-reveal=""
          data-cursor="text"
          className="display mt-6 max-w-[11ch] text-[clamp(3.4rem,9vw,9.5rem)] text-bone"
        >
          <span className="sr-only">Beauty is not added — </span>it is <em>revealed.</em>
        </h2>
        <p
          data-story-body
          className="mt-8 max-w-[42ch] text-[0.98rem] leading-relaxed text-bone/80"
        >
          A studio devoted to the small things — nails, brows, lips, skin and hair — approached with patience and precision, so what you leave with feels like you, only more so.
        </p>
      </div>

      <div
        data-story-orb
        className="absolute bottom-[10vh] right-[8vw] z-10 hidden w-[min(22vh,14vw)] lg:block"
      >
        <Orb image={story.detail} sizes="14vw" ring={{ x: -0.1, y: 0.08 }} />
      </div>
    </section>
  );
}
