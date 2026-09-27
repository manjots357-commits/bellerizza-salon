"use client";

import { createElement, useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";

type Props = {
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  children: ReactNode;
  className?: string;
  /** Split granularity. Lines read calmest; chars are reserved for display type. */
  split?: "lines" | "words" | "chars";
  /** "scroll" reveals when entering the viewport; "load" plays after `delay`. */
  trigger?: "scroll" | "load";
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  id?: string;
  cursor?: "text";
};

/**
 * Masked editorial text reveal (GSAP SplitText). Each line/word/char rises
 * out of its own mask. Hidden pre-hydration via [data-reveal] to avoid a
 * flash; reduced motion shows the text immediately.
 */
export function AnimatedText({
  as = "p",
  children,
  className,
  split = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
  duration = 1.4,
  start = "top 88%",
  id,
  cursor,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        let tween: gsap.core.Tween | undefined;
        const s = SplitText.create(el, {
          type: split === "chars" ? "lines,chars" : split === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            const targets =
              split === "chars" ? self.chars : split === "words" ? self.words : self.lines;
            gsap.set(el, { autoAlpha: 1 });
            tween?.kill();
            tween = gsap.from(targets, {
              yPercent: 115,
              rotate: split === "lines" ? 0 : 4,
              duration,
              ease: "expo.out",
              stagger: stagger ?? (split === "chars" ? 0.025 : split === "words" ? 0.05 : 0.1),
              delay: trigger === "load" ? delay : 0,
              scrollTrigger: trigger === "scroll" ? { trigger: el, start, once: true } : undefined,
            });
            return tween;
          },
        });
        return () => s.revert();
      });
      mm.add(MQ.reduced, () => {
        gsap.set(el, { autoAlpha: 1 });
      });
    },
    { scope: ref },
  );

  return createElement(
    as,
    { ref, id, className, "data-reveal": "", "data-cursor": cursor },
    children,
  );
}
