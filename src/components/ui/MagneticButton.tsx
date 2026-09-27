"use client";

import { useRef, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { gsap } from "@/lib/gsap";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/cn";

type Props = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "solid" | "ghost";
  size?: "md" | "sm";
  external?: boolean;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Premium magnetic button. The body drifts toward the pointer, the label
 * travels a little further (depth), and a fill blooms from the exact point
 * the pointer entered — retreating toward where it leaves.
 */
export function MagneticButton({
  href,
  onClick,
  children,
  variant = "solid",
  size = "md",
  external,
  icon,
  className,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  useMagnetic(ref, { inner: innerRef, strength: size === "sm" ? 0.35 : 0.25 });

  const bloom = (e: RPointerEvent, enter: boolean) => {
    if (e.pointerType !== "mouse" || !ref.current || !fillRef.current) return;
    const r = ref.current.getBoundingClientRect();
    gsap.set(fillRef.current, { left: e.clientX - r.left, top: e.clientY - r.top });
    gsap.to(fillRef.current, {
      scale: enter ? 1 : 0,
      duration: enter ? 0.7 : 0.55,
      ease: enter ? "power3.out" : "power3.inOut",
      overwrite: true,
    });
  };

  const classes = cn("btn", `btn--${variant}`, `btn--${size}`, className);
  const content = (
    <>
      <span ref={fillRef} className="btn__fill" aria-hidden="true" />
      <span ref={innerRef} className="btn__inner">
        <span className="btn__label">{children}</span>
        {icon && <span className="btn__icon">{icon}</span>}
      </span>
    </>
  );

  const common = {
    ref,
    className: classes,
    "data-cursor": "button",
    "aria-label": ariaLabel,
    onPointerEnter: (e: RPointerEvent) => bloom(e, true),
    onPointerLeave: (e: RPointerEvent) => bloom(e, false),
  };

  if (href) {
    return (
      <a href={href} {...common} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} {...common}>
      {content}
    </button>
  );
}
