"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import type { SiteImage } from "@/content/site";
import { cn } from "@/lib/cn";

type Props = {
  image: SiteImage;
  sizes: string;
  className?: string;
  /** Mask direction for the entrance. */
  from?: "bottom" | "top" | "left" | "right" | "center";
  /** Scroll parallax depth in percent of the frame (0 disables). */
  parallax?: number;
  preload?: boolean;
  cursor?: "media";
  cursorLabel?: string;
};

const clipFrom = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  center: "inset(50% 50% 50% 50%)",
};

/**
 * Image with a clip-path mask reveal and scroll-linked parallax inside the
 * frame (the image drifts slower than the page, reading as depth).
 */
export function RevealImage({
  image,
  sizes,
  className,
  from = "bottom",
  parallax = 10,
  preload,
  cursor,
  cursorLabel,
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          frame.current,
          { clipPath: clipFrom[from] },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.8,
            ease: "expo.inOut",
            scrollTrigger: { trigger: frame.current, start: "top 85%", once: true },
          },
        );
        if (parallax) {
          gsap.fromTo(
            inner.current,
            { yPercent: -parallax, scale: 1.2 },
            {
              yPercent: parallax,
              scale: 1.1,
              ease: "none",
              scrollTrigger: {
                trigger: frame.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });
    },
    { scope: frame },
  );

  return (
    <div
      ref={frame}
      className={cn("relative overflow-hidden bg-cocoa", className)}
      data-cursor={cursor}
      data-cursor-label={cursorLabel}
    >
      <div ref={inner} className="absolute inset-0 will-change-transform">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
      </div>
    </div>
  );
}
