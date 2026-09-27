import Image from "next/image";
import type { CSSProperties } from "react";
import type { SiteImage } from "@/content/site";
import { cn } from "@/lib/cn";

type Props = {
  image: SiteImage;
  sizes: string;
  className?: string;
  /** Offset of the hairline ring as a fraction of the orb's size, or false. */
  ring?: { x: number; y: number } | false;
  preload?: boolean;
  style?: CSSProperties;
};

/**
 * Circular image with an offset hairline ring — the site's signature motif.
 * Sized by className (aspect is locked to 1:1 in CSS).
 */
export function Orb({ image, sizes, className, ring = { x: 0.08, y: -0.06 }, preload, style }: Props) {
  return (
    <div className={cn("orb", className)} style={style}>
      {ring && (
        <span
          className="orb__ring"
          aria-hidden="true"
          style={{ "--rx": `${ring.x * 100}%`, "--ry": `${ring.y * 100}%` } as CSSProperties}
        />
      )}
      <div className="orb__media">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className="orb__img object-cover"
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
      </div>
    </div>
  );
}
