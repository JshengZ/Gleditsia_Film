"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.86,
      touchMultiplier: 0.92,
    });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}

