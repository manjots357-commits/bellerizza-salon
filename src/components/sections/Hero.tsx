"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { onIntro } from "@/lib/intro";
import { brand, getPrimaryBooking, heroImages, services } from "@/content/site";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Orb } from "@/components/ui/Orb";
import { ArrowIcon } from "@/components/ui/Icons";

const GoldDust = dynamic(() => import("@/components/three/GoldDust"), { ssr: false });

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Cinematic hero. Layers, back to front:
 *   portrait (slow settle + scroll push-in) → cursor light → WebGL dust →
 *   hairline rings → floating orbs → oversized headline → CTAs.
 * Every layer carries a `data-depth` used for pointer parallax and for the
 * scroll-out, so the scene separates in depth as it leaves.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [dust, setDust] = useState(false);
  const [inView, setInView] = useState(true);
  const booking = getPrimaryBooking();
  const index = services.map((s) => s.name).join("  ·  ");

  // WebGL only where it earns its keep: large screens, motion allowed.
  useEffect(() => {
    const ok =
      window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches &&
      webglAvailable();
    if (!ok) return;
    const id = window.requestIdleCallback?.(() => setDust(true)) ?? window.setTimeout(() => setDust(true), 600);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(root.current!);
    return () => {
      window.cancelIdleCallback?.(id);
      clearTimeout(id);
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, (ctx) => {
        const split = SplitText.create("[data-hero-line]", { type: "chars", mask: "chars" });
        gsap.set("[data-hero-title]", { autoAlpha: 1 });
        gsap.set(split.chars, { yPercent: 120 });
        gsap.set("[data-hero-img]", { scale: 1.28 });
        gsap.set("[data-hero-orb]", { clipPath: "circle(0% at 50% 50%)" });
        gsap.set("[data-hero-ring] circle", { strokeDashoffset: 1 });
        gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 24 });

        // Named context method: runs inside this component's scope even when
        // triggered from the preloader's timeline.
        const play = ctx.add("play", () => {
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .to("[data-hero-img]", { scale: 1.06, duration: 3.2 }, 0)
            .to(split.chars, { yPercent: 0, duration: 1.6, stagger: 0.035 }, 0.15)
            .to("[data-hero-ring] circle", { strokeDashoffset: 0, duration: 2.8, ease: "power2.inOut", stagger: 0.2 }, 0.3)
            .to("[data-hero-orb]", { clipPath: "circle(75% at 50% 50%)", duration: 2.2, ease: "expo.inOut", stagger: 0.14, clearProps: "clipPath" }, 0.4)
            .to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.08 }, 0.9);
        }) as () => void;
        const off = onIntro(play);

        // Scroll-out: layers leave at different speeds — the scene separates in depth.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        tl.to("[data-hero-img-wrap]", { yPercent: 18, scale: 1.08 }, 0)
          .to("[data-hero-shade]", { opacity: 0.85 }, 0)
          .to("[data-hero-line='1']", { xPercent: -8, yPercent: -40 }, 0)
          .to("[data-hero-line='2']", { xPercent: 6, yPercent: -25 }, 0)
          .to("[data-hero-line='3']", { xPercent: -3, yPercent: -12 }, 0)
          .to("[data-hero-orb]", { y: (i: number) => -160 - i * 120 }, 0)
          .to("[data-hero-rings]", { scale: 1.15, opacity: 0 }, 0)
          .to("[data-hero-meta]", { autoAlpha: 0, y: -40 }, 0);

        return () => {
          off();
          split.revert();
        };
      });

      // Pointer parallax + cursor-follow light (desktop, motion allowed).
      mm.add(`${MQ.desktop} and ${MQ.finePointer}`, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => {
          const d = parseFloat(el.dataset.depth!);
          return {
            d,
            x: gsap.quickTo(el, "x", { duration: 1.6, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1.6, ease: "power3.out" }),
          };
        });
        const light = document.querySelector<HTMLElement>("[data-hero-light]");
        const lx = light && gsap.quickTo(light, "x", { duration: 1.2, ease: "power3.out" });
        const ly = light && gsap.quickTo(light, "y", { duration: 1.2, ease: "power3.out" });

        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.d * 60);
            l.y(ny * l.d * 36);
          });
          const r = root.current!.getBoundingClientRect();
          lx?.(e.clientX - r.left);
          ly?.(e.clientY - r.top);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      mm.add(MQ.reduced, () => {
        gsap.set("[data-hero-title]", { autoAlpha: 1 });
      });
    },
    { scope: root },
  );

  const { portrait, orbs } = heroImages;

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate h-[100svh] min-h-[600px] overflow-hidden bg-ink"
    >
      {/* Portrait */}
      <div data-hero-img-wrap className="absolute inset-0 lg:left-[30%]">
        <div data-depth="-0.25" className="absolute -inset-[4%]">
          <div data-hero-img data-hero-image className="absolute inset-0 will-change-transform">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 1024px) 72vw, 100vw"
              className="object-cover"
              style={{ objectPosition: portrait.focus }}
            />
          </div>
        </div>
      </div>
      {/* Grade: melt the portrait into the ink on the left and at the foot. */}
      <div
        data-hero-shade
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_2%,transparent_55%),linear-gradient(to_right,var(--color-ink)_28%,rgb(11_8_6/0.55)_48%,transparent_75%)] opacity-60 max-lg:bg-[linear-gradient(to_top,var(--color-ink)_8%,rgb(11_8_6/0.6)_45%,rgb(11_8_6/0.2)_75%,rgb(11_8_6/0.5))] lg:opacity-100"
      />
      {/* Cursor-follow light */}
      <div
        data-hero-light
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(240_214_170/0.28),transparent_60%)] mix-blend-soft-light lg:block"
        style={{ left: 0, top: 0 }}
      />

      {dust && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <GoldDust active={inView} />
        </div>
      )}

      {/* Hairline rings */}
      <div data-hero-rings aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg
          data-hero-ring
          data-depth="0.35"
          className="absolute right-[4%] top-[8%] h-[78vmin] w-[78vmin] text-champagne/25 max-lg:-right-[30%] max-lg:top-[4%]"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="49.8" stroke="currentColor" strokeWidth="0.12" pathLength={1} strokeDasharray="1" />
        </svg>
        <svg
          data-hero-ring
          data-depth="0.6"
          className="absolute bottom-[-18%] right-[22%] hidden h-[46vmin] w-[46vmin] text-gold/30 lg:block"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="49.7" stroke="currentColor" strokeWidth="0.2" pathLength={1} strokeDasharray="1" />
        </svg>
      </div>

      {/* Floating orbs */}
      <div data-hero-orbs className="pointer-events-none absolute inset-0">
        <div data-depth="0.9" className="absolute left-[41%] top-[17%] w-[clamp(84px,9.5vw,170px)] max-lg:left-[7%] max-lg:top-[13%] max-lg:w-[23vw]">
          <div data-hero-orb>
            <Orb image={orbs[0]} sizes="(min-width:1024px) 10vw, 25vw" ring={{ x: -0.12, y: 0.1 }} />
          </div>
        </div>
        <div data-depth="1.3" className="absolute bottom-[24%] left-[35%] w-[clamp(110px,11.5vw,210px)] max-lg:hidden">
          <div data-hero-orb>
            <Orb image={orbs[1]} sizes="14vw" ring={{ x: 0.1, y: -0.08 }} />
          </div>
        </div>
        <div data-depth="0.6" className="absolute right-[34%] top-[12%] w-[clamp(60px,6.5vw,120px)] max-lg:left-[33%] max-lg:right-auto max-lg:top-[25%] max-lg:w-[13vw]">
          <div data-hero-orb>
            <Orb image={orbs[2]} sizes="(min-width:1024px) 7vw, 16vw" ring={{ x: 0.12, y: 0.1 }} />
          </div>
        </div>
      </div>

      {/* Vertical index of services — factual, and part of the composition */}
      <p
        data-hero-fade
        className="eyebrow pointer-events-none absolute right-5 top-1/2 hidden origin-center translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-[0.62rem] text-mist/80 lg:right-10 lg:block"
        aria-hidden="true"
      >
        {index}
      </p>

      {/* Headline */}
      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8 md:px-10 md:pb-10">
        <div data-hero-fade className="mb-6 flex items-center gap-4 lg:mb-8">
          <span className="h-px w-10 bg-gold/70" />
          <span className="eyebrow text-champagne/80">{brand.descriptor}</span>
        </div>

        <h1
          id="hero-title"
          data-hero-title
          data-cursor="text"
          data-reveal=""
          className="display text-[clamp(4.1rem,18.5vw,8rem)] text-bone md:text-[clamp(6rem,12.2vw,13.5rem)]"
        >
          <span data-hero-line="1" className="block will-change-transform">
            Beauty,
          </span>{" "}
          <span data-hero-line="2" className="block pl-[12vw] italic text-champagne will-change-transform md:pl-[9vw]">
            softly
          </span>{" "}
          <span data-hero-line="3" className="block will-change-transform">
            defined.
          </span>
        </h1>

        <div
          data-hero-meta
          className="mt-8 flex flex-col gap-7 lg:absolute lg:bottom-10 lg:right-10 lg:mt-0 lg:max-w-[360px] lg:items-start"
        >
          <p data-hero-fade className="max-w-[34ch] text-[0.95rem] leading-relaxed text-bone/75">
            Manicure, pedicure, hair &amp; makeup, lip blushing, brows and facials — unhurried care, finished by hand.
          </p>
          <div data-hero-fade className="flex flex-wrap items-center gap-3">
            <MagneticButton href={booking.href} external={booking.external} icon={<ArrowIcon />}>
              Book appointment
            </MagneticButton>
            <span className="hidden sm:inline-flex">
              <MagneticButton href="#services" variant="ghost">
                Services
              </MagneticButton>
            </span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        data-hero-fade
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
      >
        <span className="eyebrow text-[0.6rem]">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-champagne/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.4s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-champagne" />
        </span>
      </div>
    </section>
  );
}
