"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getPrimaryBooking, services } from "@/content/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Orb } from "@/components/ui/Orb";
import { ArrowUpRight } from "@/components/ui/Icons";

const STEP = 0.78; // radians between orbs on the orbit
const pad = (n: number) => String(n + 1).padStart(2, "0");

/**
 * Signature services experience.
 *
 * Desktop (motion allowed): a pinned stage where the service orbs travel a
 * vertical 3D orbit as you scroll. The active orb swings to the front, the
 * list typography, description, secondary image and ambient colour follow.
 *
 * Mobile / reduced motion: an intentional stacked editorial layout — large
 * orbs alternating left and right with the copy always visible.
 */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const { scrollTo } = useSmoothScroll();
  const booking = getPrimaryBooking();
  const n = services.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = stage.current!;
        const orbs = gsap.utils.toArray<HTMLElement>("[data-svc-orb]", el);
        const shades = orbs.map((o) => o.querySelector<HTMLElement>("[data-svc-shade]")!);
        const rows = gsap.utils.toArray<HTMLElement>("[data-svc-row]", el);
        const copies = gsap.utils.toArray<HTMLElement>("[data-svc-copy]", el);
        const ambients = gsap.utils.toArray<HTMLElement>("[data-svc-ambient]", el);
        const details = gsap.utils.toArray<HTMLElement>("[data-svc-detail]", el);
        const counter = el.querySelector<HTMLElement>("[data-svc-counter]")!;
        const radius = () => Math.min(window.innerHeight * 0.62, 620);
        let active = -1;

        const render = (p: number) => {
          const R = radius();
          orbs.forEach((orb, i) => {
            const t = (i - p) * STEP;
            const c = Math.cos(t);
            const y = Math.sin(t) * R;
            const z = (c - 1) * R * 2.2;
            const x = (1 - c) * R * 0.7;
            const vis = gsap.utils.clamp(0, 1, (c - 0.3) / 0.45);
            gsap.set(orb, {
              x,
              y,
              z,
              opacity: vis,
              zIndex: Math.round(c * 100),
              pointerEvents: c > 0.97 ? "auto" : "none",
            });
            // Depth shading via an overlay (opacity only — stays on the compositor).
            gsap.set(shades[i], { opacity: Math.min(0.82, (1 - c) * 2.6) });
          });

          const next = gsap.utils.clamp(0, n - 1, Math.round(p));
          if (next !== active) {
            active = next;
            rows.forEach((r, i) => {
              r.dataset.active = String(i === next);
              if (i === next) r.setAttribute("aria-current", "true");
              else r.removeAttribute("aria-current");
            });
            copies.forEach((c, i) => {
              c.dataset.active = String(i === next);
              c.querySelector("a")?.setAttribute("tabindex", i === next ? "0" : "-1");
            });
            ambients.forEach((a, i) => gsap.to(a, { opacity: i === next ? 0.5 : 0, duration: 1.2, ease: "power2.out", overwrite: true }));
            details.forEach((d, i) =>
              gsap.to(d, {
                clipPath: i === next ? "circle(50% at 50% 50%)" : "circle(0% at 50% 50%)",
                duration: 1.1,
                ease: "expo.inOut",
                overwrite: true,
              }),
            );
            counter.textContent = pad(next);
          }
        };

        const state = { p: 0 };
        render(0);
        const tween = gsap.to(state, {
          p: n - 1,
          ease: "none",
          onUpdate: () => render(state.p),
          scrollTrigger: {
            trigger: el,
            pin: true,
            start: "top top",
            end: () => `+=${(n - 1) * window.innerHeight * 0.75}`,
            scrub: 1.2,
            snap: {
              snapTo: 1 / (n - 1),
              duration: { min: 0.4, max: 0.9 },
              delay: 0.12,
              ease: "power2.inOut",
            },
            invalidateOnRefresh: true,
            onRefresh: () => render(state.p),
          },
        });
        trigger.current = tween.scrollTrigger ?? null;

        return () => {
          trigger.current = null;
        };
      });

      // Stacked layout: each orb opens like an iris and settles as it enters.
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-svc-m-orb]").forEach((orb) => {
          gsap.fromTo(
            orb,
            { clipPath: "circle(0% at 50% 50%)", scale: 1.08 },
            {
              clipPath: "circle(75% at 50% 50%)",
              scale: 1,
              duration: 1.8,
              ease: "expo.inOut",
              scrollTrigger: { trigger: orb, start: "top 85%", once: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  /** Jump the orbit to a given service (click / keyboard on the list). */
  const goTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    scrollTo(st.start + ((st.end - st.start) * i) / (n - 1));
  };

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative">
      {/* Section opener */}
      <header className="relative z-10 mx-auto grid max-w-[1400px] gap-8 px-5 pb-[10vh] md:px-10 lg:grid-cols-[1fr_4fr]">
        <p className="eyebrow pt-4">
          <span className="text-gold">02</span> — Services
        </p>
        <div>
          <AnimatedText
            as="h2"
            id="services-title"
            split="chars"
            cursor="text"
            className="display text-[clamp(4rem,14vw,15rem)] text-bone"
          >
            Our <em>Services</em>
          </AnimatedText>
          <AnimatedText className="mt-8 max-w-[44ch] text-[0.95rem] leading-relaxed text-bone/70" start="top 92%">
            Six considered treatments, each given the time it deserves.
          </AnimatedText>
        </div>
      </header>

      {/* ── Desktop: pinned 3D orbit ─────────────────────────────────────── */}
      <div
        ref={stage}
        className="relative hidden h-screen overflow-hidden bg-espresso lg:motion-safe:block"
      >
        {/* Ambient colour — each service tints the room */}
        <div aria-hidden="true" className="absolute inset-0">
          {services.map((s) => (
            <div key={s.slug} data-svc-ambient className="absolute inset-0 opacity-0">
              <Image
                src={s.image.src}
                alt=""
                fill
                sizes="30vw"
                quality={30}
                className="scale-125 object-cover blur-[70px] saturate-[0.8]"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_20%,var(--color-espresso)_78%)]" />
        </div>

        <div className="relative grid h-full grid-cols-[minmax(0,5fr)_minmax(0,7fr)] px-10">
          {/* List */}
          <div className="relative z-10 flex flex-col justify-center">
            <ul className="space-y-[0.4vh]" aria-label="Services">
              {services.map((s, i) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    data-svc-row
                    data-active={i === 0}
                    onClick={() => goTo(i)}
                    aria-current={i === 0 ? "true" : undefined}
                    className="svc-row group flex w-full items-baseline gap-5 py-[0.6vh] text-left"
                  >
                    <span className="w-8 font-sans text-[0.65rem] tracking-[0.2em] text-mist transition-colors duration-500 group-data-[active=true]:text-gold">
                      {pad(i)}
                    </span>
                    <span className="svc-row__name font-serif text-[clamp(2.2rem,3.6vw,3.9rem)] leading-[1.05]">
                      {s.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="relative mt-[5vh] h-[8.5rem] max-w-[34ch]">
              {services.map((s, i) => (
                <div key={s.slug} data-svc-copy data-active={i === 0} className="svc-copy absolute inset-0">
                  <p className="eyebrow text-champagne/80">{s.line}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-bone/75">{s.description}</p>
                  <a
                    href={booking.href}
                    target={booking.external ? "_blank" : undefined}
                    rel={booking.external ? "noopener noreferrer" : undefined}
                    className="u-link mt-4 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-champagne"
                    tabIndex={i === 0 ? 0 : -1}
                  >
                    Enquire <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Orbit */}
          <div className="relative [perspective:1600px]">
            <svg
              aria-hidden="true"
              className="absolute left-[30%] top-1/2 h-[128vh] w-[128vh] -translate-y-1/2 text-champagne/10"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle cx="50" cy="50" r="49.9" stroke="currentColor" strokeWidth="0.08" />
            </svg>

            <div className="absolute left-[34%] top-1/2 [transform-style:preserve-3d]">
              {services.map((s, i) => (
                <div
                  key={s.slug}
                  data-svc-orb
                  aria-hidden="true"
                  onClick={() => goTo(i)}
                  data-cursor="service"
                  data-cursor-label={s.name}
                  className="svc-orb absolute left-0 top-0 w-[min(58vh,34vw)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
                >
                  <Orb image={s.image} sizes="(min-width:1024px) 34vw, 1px" ring={{ x: 0.06, y: -0.05 }} />
                  <span data-svc-shade className="pointer-events-none absolute inset-0 rounded-full bg-espresso opacity-0" />
                  <span className="pointer-events-none absolute -right-[8%] top-[12%] font-serif text-[1.1rem] italic text-champagne">
                    {pad(i)}
                  </span>
                </div>
              ))}
            </div>

            {/* Secondary detail image — changes with the active service */}
            <div className="absolute bottom-[10vh] right-0 z-[200] aspect-square w-[min(19vh,11vw)]" aria-hidden="true">
              {services.map((s, i) => (
                <div
                  key={s.slug}
                  data-svc-detail
                  className="absolute inset-0 overflow-hidden rounded-full"
                  style={{ clipPath: i === 0 ? "circle(50% at 50% 50%)" : "circle(0% at 50% 50%)" }}
                >
                  <Image src={s.detail.src} alt="" fill sizes="11vw" className="object-cover" />
                </div>
              ))}
              <span className="absolute -inset-[10%] rounded-full border border-champagne/25" />
            </div>

            {/* Counter */}
            <p className="absolute right-0 top-[12vh] flex items-baseline gap-2 font-serif text-bone" aria-hidden="true">
              <span data-svc-counter className="text-[3.2rem] leading-none">
                01
              </span>
              <span className="text-lg text-mist">/ {pad(n - 1)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile & reduced motion: stacked editorial list ───────────────── */}
      <ol className="mx-auto max-w-[1400px] space-y-[14vh] px-5 pb-[8vh] md:px-10 lg:motion-safe:hidden">
        {services.map((s, i) => (
          <li
            key={s.slug}
            className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-16 ${
              i % 2 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div data-svc-m-orb className={`w-[78%] md:w-[44%] ${i % 2 ? "self-end" : ""}`}>
              <Orb
                image={s.image}
                sizes="(min-width: 768px) 44vw, 78vw"
                ring={{ x: i % 2 ? -0.07 : 0.07, y: -0.06 }}
              />
            </div>
            <div className="md:flex-1">
              <p className="eyebrow">
                <span className="text-gold">{pad(i)}</span> — {s.line}
              </p>
              <h3 className="mt-3 font-serif text-[clamp(2.8rem,11vw,5rem)] leading-none text-bone">{s.name}</h3>
              <p className="mt-4 max-w-[40ch] text-[0.95rem] leading-relaxed text-bone/70">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
