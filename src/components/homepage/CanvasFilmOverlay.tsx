"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type CanvasFilmOverlayProps = {
  lightLeakTriggerKey: number;
};

type DustParticle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  drift: number;
};

type ScratchLine = {
  x: number;
  top: number;
  height: number;
  phase: number;
  cycle: number;
  alpha: number;
};

const SCRATCHES: ScratchLine[] = [
  { x: 0.185, top: 0.02, height: 0.78, phase: 1.1, cycle: 8.8, alpha: 0.07 },
  { x: 0.735, top: 0.1, height: 0.72, phase: 4.6, cycle: 10.4, alpha: 0.052 },
  { x: 0.912, top: 0.0, height: 0.9, phase: 7.2, cycle: 12.2, alpha: 0.045 },
];

function easeLeak(progress: number) {
  if (progress < 0.2) {
    return progress / 0.2;
  }

  return Math.max(0, 1 - (progress - 0.2) / 0.8);
}

function createDust(width: number, height: number) {
  return Array.from({ length: 30 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.35 + Math.random() * 0.85,
    alpha: 0.012 + Math.random() * 0.03,
    drift: Math.random() * Math.PI * 2,
  }));
}

function createGrainTile(size: number) {
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;

  const tileContext = tile.getContext("2d");

  if (!tileContext) {
    return tile;
  }

  const image = tileContext.createImageData(size, size);
  const data = image.data;

  for (let index = 0; index < data.length; index += 4) {
    const roll = Math.random();
    const isLight = roll > 0.54;
    const value = isLight ? 224 + Math.random() * 24 : 5 + Math.random() * 18;
    const alpha = roll > 0.985 ? 18 : roll > 0.84 ? 10 : 4;

    data[index] = value;
    data[index + 1] = isLight ? value * 0.95 : value * 0.82;
    data[index + 2] = isLight ? value * 0.82 : value * 0.65;
    data[index + 3] = alpha;
  }

  tileContext.putImageData(image, 0, 0);
  return tile;
}

export function CanvasFilmOverlay({ lightLeakTriggerKey }: CanvasFilmOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustRef = useRef<DustParticle[]>([]);
  const grainTileRef = useRef<HTMLCanvasElement | null>(null);
  const leakStartedAtRef = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (lightLeakTriggerKey === 0) {
      return;
    }

    leakStartedAtRef.current = performance.now();
  }, [lightLeakTriggerKey]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let lastGrainRefresh = 0;

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dustRef.current = createDust(width, height);
      grainTileRef.current = createGrainTile(reducedMotion ? 180 : 220);
    };

    const drawGrain = (time: number) => {
      if (!grainTileRef.current || time - lastGrainRefresh > (reducedMotion ? 2600 : 920)) {
        grainTileRef.current = createGrainTile(reducedMotion ? 180 : 220);
        lastGrainRefresh = time;
      }

      const grainTile = grainTileRef.current;
      const tileSize = grainTile.width;
      const offsetX = reducedMotion ? 0 : -((time * 0.006) % tileSize);
      const offsetY = reducedMotion ? 0 : -((time * 0.003) % tileSize);

      context.save();
      context.globalAlpha = reducedMotion ? 0.48 : 0.62;

      for (let x = offsetX - tileSize; x < width + tileSize; x += tileSize) {
        for (let y = offsetY - tileSize; y < height + tileSize; y += tileSize) {
          context.drawImage(grainTile, x, y);
        }
      }

      context.restore();
    };

    const drawDust = (seconds: number) => {
      context.save();

      dustRef.current.forEach((dust, index) => {
        const driftX = reducedMotion ? 0 : Math.sin(seconds * 0.18 + dust.drift) * 1.4;
        const driftY = reducedMotion ? 0 : Math.cos(seconds * 0.14 + dust.drift) * 1.1;
        const flicker = 0.72 + Math.sin(seconds * 0.42 + index) * 0.16;

        context.fillStyle = `rgba(236, 224, 198, ${dust.alpha * flicker})`;
        context.beginPath();
        context.arc(dust.x + driftX, dust.y + driftY, dust.radius, 0, Math.PI * 2);
        context.fill();
      });

      context.restore();
    };

    const drawScratches = (seconds: number) => {
      context.save();
      context.lineWidth = 0.55;

      SCRATCHES.forEach((scratch, index) => {
        const pulse = (seconds + scratch.phase) % scratch.cycle;

        if (pulse > 1.05) {
          return;
        }

        const visibility = Math.sin((pulse / 1.05) * Math.PI);
        const x = scratch.x * width + Math.sin(seconds * 2.1 + index) * 0.35;
        const top = scratch.top * height;
        const bottom = top + scratch.height * height;
        const gradient = context.createLinearGradient(x, top, x, bottom);

        gradient.addColorStop(0, "rgba(232, 220, 196, 0)");
        gradient.addColorStop(0.22, `rgba(232, 220, 196, ${scratch.alpha * visibility})`);
        gradient.addColorStop(0.68, `rgba(232, 220, 196, ${scratch.alpha * 0.42 * visibility})`);
        gradient.addColorStop(1, "rgba(232, 220, 196, 0)");

        context.strokeStyle = gradient;
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x + Math.sin(seconds + index) * 0.18, bottom);
        context.stroke();
      });

      context.restore();
    };

    const drawFlicker = (seconds: number) => {
      const exposure = reducedMotion
        ? 0.0035
        : 0.005 + Math.sin(seconds * 0.86) * 0.0017 + Math.sin(seconds * 1.73) * 0.001;

      context.save();
      context.fillStyle = `rgba(255, 232, 190, ${Math.max(0.002, exposure)})`;
      context.fillRect(0, 0, width, height);
      context.restore();
    };

    const drawLightLeak = (time: number) => {
      const leakStartedAt = leakStartedAtRef.current;

      if (leakStartedAt === null) {
        return;
      }

      const elapsed = time - leakStartedAt;
      const duration = reducedMotion ? 450 : 620;
      const progress = elapsed / duration;

      if (progress >= 1) {
        leakStartedAtRef.current = null;
        return;
      }

      const strength = easeLeak(progress);
      const leakWidth = width * 0.22;
      const push = width * 0.016 * progress;
      const gradient = context.createLinearGradient(-push, 0, leakWidth - push, 0);

      gradient.addColorStop(0, `rgba(255, 190, 78, ${0.34 * strength})`);
      gradient.addColorStop(0.08, `rgba(255, 112, 42, ${0.24 * strength})`);
      gradient.addColorStop(0.38, `rgba(190, 58, 30, ${0.105 * strength})`);
      gradient.addColorStop(0.72, `rgba(255, 220, 130, ${0.034 * strength})`);
      gradient.addColorStop(1, "rgba(255, 190, 92, 0)");

      context.save();
      context.globalCompositeOperation = "lighter";
      context.fillStyle = gradient;
      context.fillRect(0, 0, leakWidth, height);

      context.fillStyle = `rgba(255, 211, 104, ${0.18 * strength})`;
      context.fillRect(0, 0, Math.max(1, width * 0.012), height);

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 0.3 * strength;

      for (let i = 0; i < 36; i += 1) {
        const x = Math.random() * leakWidth * 0.86;
        const y = Math.random() * height;
        const size = 0.45 + Math.random() * 1.2;

        context.fillStyle = `rgba(255, 220, 150, ${0.05 + Math.random() * 0.08})`;
        context.fillRect(x, y, size, size);
      }

      context.restore();
    };

    const drawFrame = (time: number) => {
      const seconds = time / 1000;

      context.clearRect(0, 0, width, height);
      drawFlicker(seconds);
      drawGrain(time);
      drawDust(seconds);
      drawScratches(seconds);
      drawLightLeak(time);

      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    resize();
    drawFrame(performance.now());
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="canvas-film-overlay" aria-hidden="true" />;
}
