import type { Point } from "./types";

export function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSessionSeed() {
  return Math.floor(
    (globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0] ??
      Math.random() * 4294967295) >>> 0,
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function randomBetween(random: () => number, min: number, max: number) {
  return min + (max - min) * random();
}

export function pick<T>(random: () => number, values: readonly T[]) {
  return values[Math.floor(random() * values.length)] ?? values[0];
}

export function smoothstep(value: number) {
  const normalized = clamp(value, 0, 1);

  return normalized * normalized * (3 - 2 * normalized);
}

export function easeExposure(progress: number) {
  if (progress < 0.2) {
    return smoothstep(progress / 0.2);
  }

  return smoothstep(1 - (progress - 0.2) / 0.8);
}

export function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb}, ${clamp(alpha, 0, 1)})`;
}

export function pathIrregularLoop(
  context: CanvasRenderingContext2D,
  points: Point[],
) {
  if (points.length < 3) {
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const previous = points[index - 1];
    const controlX = (previous.x + current.x) * 0.5;
    const controlY = (previous.y + current.y) * 0.5;

    context.quadraticCurveTo(previous.x, previous.y, controlX, controlY);
  }

  const last = points[points.length - 1];
  const first = points[0];
  context.quadraticCurveTo(last.x, last.y, (last.x + first.x) * 0.5, (last.y + first.y) * 0.5);
  context.closePath();
}

export function strokeSmoothPath(
  context: CanvasRenderingContext2D,
  points: Point[],
) {
  if (points.length < 2) {
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];

    context.quadraticCurveTo(
      previous.x,
      previous.y,
      (previous.x + point.x) * 0.5,
      (previous.y + point.y) * 0.5,
    );
  }

  context.stroke();
}
