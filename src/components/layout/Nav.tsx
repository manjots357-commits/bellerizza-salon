"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { onIntro } from "@/lib/intro";
import { brand, getPrimaryBooking, nav } from "@/content/site";
import { RollText } from "@/components/ui/RollText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const booking = getPrimaryBooking();

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, (ctx) => {
        gsap.set(el, { yPercent: -100, autoAlpha: 0 });
        const show = ctx.add("show", () => {
          gsap.to(el, { yPercent: 0, autoAlpha: 1, duration: 1.6, ease: "expo.out", delay: 0.5 });
        }) as () => void;
        const off = onIntro(show);

        // Hide while travelling down, return on the way up.
        let hidden = false;
        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate(self) {
            const past = self.scroll() > window.innerHeight * 0.6;
            const shouldHide = past && self.direction === 1;
            el.dataset.scrolled = self.scroll() > 40 ? "true" : "false";
            if (shouldHide !== hidden) {
              hidden = shouldHide;
              gsap.to(el, { yPercent: hidden ? -110 : 0, duration: 0.9, ease: "expo.out", overwrite: "auto" });
            }
          },
        });
        return () => {
          off();
          st.kill();
        };
      });

      mm.add(MQ.reduced, () => {
        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => (el.dataset.scrolled = self.scroll() > 40 ? "true" : "false"),
        });
        return () => st.kill();
      });
    },
    { scope: ref },
  );

  // Return focus to the trigger when the menu closes (not on first mount).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !menuOpen) menuButton.current?.focus({ preventScroll: true });
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  return (
    <>
      <header
        ref={ref}
        data-scrolled="false"
        className="group/nav fixed inset-x-0 top-0 z-50 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[140%] before:bg-[linear-gradient(to_bottom,rgb(11_8_6/0.82),rgb(11_8_6/0.4)_55%,transparent)] before:opacity-0 before:transition-opacity before:duration-700 data-[scrolled=true]:before:opacity-100"
      >
        <nav
          aria-label="Primary"
          className="relative mx-auto flex h-[72px] items-center justify-between px-5 md:h-[84px] md:px-10"
        >
          <a href="#top" className="group flex items-baseline gap-2" aria-label={`${brand.name} — back to top`}>
            <span className="font-serif text-[1.7rem] leading-none tracking-tight text-bone md:text-[1.9rem]">
              {brand.name.split(" ")[0]}{" "}
              <em className="text-champagne transition-colors duration-500 group-hover:text-gold">
                {brand.name.split(" ").slice(1).join(" ")}
              </em>
            </span>
          </a>

          <ul className="hidden items-center gap-10 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-bone/80"
                >
                  <RollText text={item.label} />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <MagneticButton href={booking.href} external={booking.external} size="sm">
                Book
              </MagneticButton>
            </div>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-11 items-center gap-3 rounded-full px-2 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-bone lg:hidden"
            >
              Menu
              <span aria-hidden="true" className="flex w-6 flex-col gap-[5px]">
                <span className="h-px w-full bg-champagne" />
                <span className="h-px w-2/3 self-end bg-champagne" />
              </span>
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
