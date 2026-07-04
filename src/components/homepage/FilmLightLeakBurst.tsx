"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type FilmLightLeakBurstProps = {
  triggerKey: number;
};

export function FilmLightLeakBurst({ triggerKey }: FilmLightLeakBurstProps) {
  const leakRef = useRef<HTMLDivElement | null>(null);
  const direction = "left";

  useEffect(() => {
    const leak = leakRef.current;

    if (!leak || triggerKey === 0) {
      return;
    }

    const fromLeft = true;
    const ctx = gsap.context(() => {
      gsap.set(leak, {
        opacity: 0,
        xPercent: -12,
        yPercent: -1,
        scaleX: 1,
        scaleY: 1,
        rotate: -1.2,
        transformOrigin: fromLeft ? "left center" : "right center",
      });

      gsap
        .timeline()
        .to(leak, {
          opacity: 0.12,
          duration: 0.1,
          ease: "power2.out",
        })
        .to(
          leak,
          {
            xPercent: 2,
            scaleX: 1.08,
            scaleY: 1.02,
            rotate: -0.4,
            duration: 0.2,
            ease: "power1.inOut",
          },
          "<",
        )
        .to(
          leak,
          {
            opacity: 0,
            duration: 0.18,
            ease: "power2.in",
          },
          "-=0.05",
        );
    }, leak);

    return () => ctx.revert();
  }, [triggerKey]);

  return (
    <div
      ref={leakRef}
      className="film-light-leak"
      data-leak-side={direction}
      aria-hidden="true"
    >
      <span className="film-light-leak__edge" />
      <span className="film-light-leak__burn" />
    </div>
  );
}
