"use client";

import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { muteColor } from "@/lib/color";

type DominantBackground = {
  base: string;
  soft: string;
};

export function useDominantBackground(src: string) {
  const [background, setBackground] = useState<DominantBackground>({
    base: "#090806",
    soft: "rgba(30, 25, 20, 0.12)",
  });

  useEffect(() => {
    let isCancelled = false;
    const fac = new FastAverageColor();

    fac
      .getColorAsync(src)
      .then((color) => {
        if (isCancelled) {
          return;
        }

        setBackground({
          base: muteColor(color.hex, 1),
          soft: muteColor(color.hex, 0.14),
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setBackground({
            base: "#090806",
            soft: "rgba(30, 25, 20, 0.12)",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [src]);

  return background;
}
