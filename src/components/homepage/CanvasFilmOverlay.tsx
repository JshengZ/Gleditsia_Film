"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type CanvasFilmOverlayProps = {
  lightLeakTriggerKey: number;
};

type FilmState = {
  exposure: number;
  instability: number;
  contamination: number;
  density: number;
};

type FilmSize = {
  width: number;
  height: number;
  ratio: number;
};

type FilmFrame = FilmSize & {
  context: CanvasRenderingContext2D;
  delta: number;
  time: number;
  reducedMotion: boolean;
  state: FilmState;
};

type FineGrainParticle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  polarity: -1 | 1;
};

type CoarseGrainParticle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  bornAt: number;
  lifespan: number;
  vx: number;
  vy: number;
  polarity: -1 | 1;
};

type ScratchEvent = {
  x: number;
  y: number;
  length: number;
  opacity: number;
  lifespan: number;
  flicker: number;
  broken: boolean;
};

type InternalScratchEvent = ScratchEvent & {
  bornAt: number;
  drift: number;
  width: number;
  segments: Array<{ start: number; end: number }>;
};

type LightLeakEvent = {
  startTime: number;
  duration: number;
  origin: "left" | "right" | "top" | "bottom" | "corner" | "random";
  shape: "band" | "wash" | "burn" | "flare";
  geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
  };
  intensity: number;
  colors: {
    core: string;
    mid: string;
    edge: string;
  };
};

type InternalLightLeakEvent = LightLeakEvent & {
  seed: number;
  boundary: Array<{ x: number; y: number }>;
  edge: Array<{ x: number; y: number }>;
};

const LIGHT_LEAK_COLORS = [
  { core: "255, 224, 154", mid: "237, 126, 58", edge: "155, 38, 24" },
  { core: "255, 204, 118", mid: "222, 84, 42", edge: "114, 30, 24" },
  { core: "255, 232, 179", mid: "198, 74, 38", edge: "92, 26, 22" },
];

function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(random: () => number, min: number, max: number) {
  return min + (max - min) * random();
}

function pick<T>(random: () => number, values: T[]) {
  return values[Math.floor(random() * values.length)] ?? values[0];
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function easeExposure(progress: number) {
  if (progress < 0.18) {
    return smoothstep(progress / 0.18);
  }

  return smoothstep(Math.max(0, 1 - (progress - 0.18) / 0.82));
}

function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb}, ${Math.max(0, Math.min(alpha, 1))})`;
}

function pathIrregularLoop(
  context: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
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

class ExposureSystem {
  private readonly random: () => number;
  private readonly phases: number[];
  private readonly offsets: number[];

  constructor(random: () => number) {
    this.random = random;
    this.phases = Array.from({ length: 8 }, () => this.random() * 1000);
    this.offsets = Array.from({ length: 5 }, () => this.random() * Math.PI * 2);
  }

  update(time: number): FilmState {
    const exposureNoise = this.noise(time * 0.34, 0) * 0.5 + this.noise(time * 0.08, 1) * 0.5;
    const instabilityNoise = this.noise(time * 0.78, 2);
    const contaminationNoise = this.noise(time * 0.12, 3);
    const densityNoise = this.noise(time * 0.065, 4);

    return {
      exposure: 0.98 + exposureNoise * 0.028,
      instability: 0.35 + instabilityNoise * 0.34,
      contamination: 0.42 + contaminationNoise * 0.34,
      density: 0.5 + densityNoise * 0.28,
    };
  }

  render(frame: FilmFrame) {
    const { context, width, height, state, time } = frame;
    const warmth = 0.003 + state.contamination * 0.0045;
    const density = 0.004 + state.density * 0.006;

    context.save();
    context.globalCompositeOperation = "source-over";

    const topShift = Math.sin(time * 0.13 + this.offsets[0]) * width * 0.035;
    const lowShift = Math.cos(time * 0.09 + this.offsets[1]) * width * 0.025;

    context.fillStyle = rgba("255, 228, 184", warmth);
    context.beginPath();
    context.moveTo(-width * 0.04 + topShift, 0);
    context.bezierCurveTo(width * 0.22, height * 0.15, width * 0.76, height * 0.04, width * 1.04, height * 0.22);
    context.lineTo(width * 1.04, height * 0.46);
    context.bezierCurveTo(width * 0.72, height * 0.34, width * 0.28, height * 0.42, -width * 0.04, height * 0.28);
    context.closePath();
    context.fill();

    context.fillStyle = rgba("0, 0, 0", density);
    context.beginPath();
    context.moveTo(-width * 0.06, height * 0.72);
    context.bezierCurveTo(width * 0.22 + lowShift, height * 0.68, width * 0.66, height * 0.86, width * 1.06, height * 0.78);
    context.lineTo(width * 1.06, height * 1.06);
    context.lineTo(-width * 0.06, height * 1.06);
    context.closePath();
    context.fill();

    context.globalAlpha = 0.045 + state.density * 0.03;
    context.strokeStyle = rgba("20, 16, 12", 0.2);
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(width * 0.006, 0);
    context.bezierCurveTo(width * 0.003, height * 0.32, width * 0.012, height * 0.62, width * 0.008, height);
    context.moveTo(width * 0.994, 0);
    context.bezierCurveTo(width * 0.988, height * 0.38, width * 1.0, height * 0.72, width * 0.99, height);
    context.stroke();

    context.restore();
  }

  private noise(value: number, channel: number) {
    const floor = Math.floor(value);
    const fraction = value - floor;
    const a = this.hash(floor, channel);
    const b = this.hash(floor + 1, channel);

    return a + (b - a) * smoothstep(fraction);
  }

  private hash(index: number, channel: number) {
    const value = Math.sin(index * 127.1 + channel * 311.7 + this.phases[channel]) * 43758.5453;

    return (value - Math.floor(value)) * 2 - 1;
  }
}

class GrainSystem {
  private readonly random: () => number;
  private readonly fine: FineGrainParticle[] = [];
  private readonly coarse: CoarseGrainParticle[] = [];

  constructor(random: () => number) {
    this.random = random;
  }

  resize(size: FilmSize, reducedMotion: boolean) {
    const target = reducedMotion
      ? Math.min(420, Math.max(160, Math.round((size.width * size.height) / 2400)))
      : Math.min(1200, Math.max(260, Math.round((size.width * size.height) / 1100)));

    this.fine.length = 0;

    for (let index = 0; index < target; index += 1) {
      this.fine.push(this.createFineParticle(size));
    }

    this.coarse.length = 0;
  }

  update(frame: FilmFrame) {
    const { width, height, delta, state, reducedMotion, time } = frame;
    const driftScale = reducedMotion ? 0.15 : 1;

    for (const particle of this.fine) {
      const turbulence = Math.sin(time * 1.7 + particle.phase) * 0.18 * state.instability;
      particle.x += (particle.vx + turbulence) * delta * driftScale;
      particle.y += (particle.vy + Math.cos(time * 1.3 + particle.phase) * 0.12) * delta * driftScale;

      if (particle.x < -4) particle.x = width + this.random() * 4;
      if (particle.x > width + 4) particle.x = -this.random() * 4;
      if (particle.y < -4) particle.y = height + this.random() * 4;
      if (particle.y > height + 4) particle.y = -this.random() * 4;
    }

    for (let index = this.coarse.length - 1; index >= 0; index -= 1) {
      const particle = this.coarse[index];
      const age = time - particle.bornAt;

      if (age >= particle.lifespan) {
        this.coarse.splice(index, 1);
        continue;
      }

      particle.x += particle.vx * delta * driftScale;
      particle.y += particle.vy * delta * driftScale;
    }

    if (!reducedMotion) {
      const spawnChance = delta * (2.2 + state.contamination * 3.2);
      if (this.random() < spawnChance) {
        const count = this.random() > 0.82 ? 2 : 1;

        for (let index = 0; index < count; index += 1) {
          this.coarse.push(this.createCoarseParticle(frame));
        }
      }
    }
  }

  render(frame: FilmFrame) {
    const { context, state, time } = frame;

    context.save();
    context.globalCompositeOperation = "source-over";

    for (const particle of this.fine) {
      const densityPatch =
        0.68 +
        Math.sin(particle.x * 0.008 + particle.phase) * 0.18 +
        Math.cos(particle.y * 0.006 - particle.phase) * 0.14;
      const pulse = 0.78 + Math.sin(time * 2.4 + particle.phase) * 0.14;
      const alpha = particle.alpha * densityPatch * pulse * (0.75 + state.density * 0.5);
      const color = particle.polarity > 0 ? "232, 222, 202" : "6, 5, 4";

      context.fillStyle = rgba(color, alpha);
      context.fillRect(particle.x, particle.y, particle.radius, particle.radius);
    }

    for (const particle of this.coarse) {
      const age = time - particle.bornAt;
      const progress = Math.max(0, Math.min(age / particle.lifespan, 1));
      const life = Math.sin(progress * Math.PI);
      const color = particle.polarity > 0 ? "236, 221, 188" : "4, 3, 2";

      context.fillStyle = rgba(color, particle.alpha * life * (0.7 + state.contamination * 0.5));
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  private createFineParticle(size: FilmSize): FineGrainParticle {
    const densityBias = this.random() ** 1.8;
    const x = this.random() * size.width;
    const y = this.random() * size.height;

    return {
      x,
      y,
      radius: randomBetween(this.random, 0.3, 0.8),
      alpha: randomBetween(this.random, 0.02, 0.06) * (0.65 + densityBias * 0.55),
      vx: randomBetween(this.random, -3.8, 3.8),
      vy: randomBetween(this.random, -2.2, 2.6),
      phase: this.random() * Math.PI * 2,
      polarity: this.random() > 0.47 ? 1 : -1,
    };
  }

  private createCoarseParticle(frame: FilmFrame): CoarseGrainParticle {
    const cluster = this.random() > 0.62;
    const x = cluster ? frame.width * (0.08 + this.random() * 0.84) : this.random() * frame.width;
    const y = cluster ? frame.height * (0.1 + this.random() * 0.78) : this.random() * frame.height;

    return {
      x,
      y,
      radius: randomBetween(this.random, 0.8, 2.5),
      alpha: randomBetween(this.random, 0.018, 0.07),
      bornAt: frame.time,
      lifespan: randomBetween(this.random, 1, 3),
      vx: randomBetween(this.random, -2.6, 2.6),
      vy: randomBetween(this.random, -1.4, 2.0),
      polarity: this.random() > 0.56 ? 1 : -1,
    };
  }
}

class ScratchSystem {
  private readonly random: () => number;
  private readonly events: InternalScratchEvent[] = [];

  constructor(random: () => number) {
    this.random = random;
  }

  resize() {
    this.events.length = 0;
  }

  update(frame: FilmFrame) {
    const { delta, reducedMotion, state, time } = frame;

    for (let index = this.events.length - 1; index >= 0; index -= 1) {
      if (time - this.events[index].bornAt > this.events[index].lifespan) {
        this.events.splice(index, 1);
      }
    }

    if (reducedMotion) {
      return;
    }

    const spawnChance = delta * (0.32 + state.instability * 0.5 + state.contamination * 0.22);

    if (this.random() < spawnChance) {
      this.events.push(this.createScratch(frame));
    }
  }

  render(frame: FilmFrame) {
    const { context, time } = frame;

    context.save();
    context.lineCap = "round";
    context.globalCompositeOperation = "source-over";

    for (const event of this.events) {
      const age = time - event.bornAt;
      const progress = Math.max(0, Math.min(age / event.lifespan, 1));
      const frameBlink = Math.sin(age * event.flicker * 42) > -0.2 ? 1 : 0.24;
      const life = Math.sin(progress * Math.PI);
      const opacity = event.opacity * life * frameBlink;
      const x = event.x + Math.sin(age * 4.2 + event.drift) * 0.85;

      context.lineWidth = event.width;
      context.strokeStyle = rgba("228, 218, 198", opacity);

      if (event.broken) {
        for (const segment of event.segments) {
          const y0 = event.y + event.length * segment.start;
          const y1 = event.y + event.length * segment.end;
          context.beginPath();
          context.moveTo(x + Math.sin(segment.start * 9 + event.drift) * 0.4, y0);
          context.lineTo(x + Math.sin(segment.end * 9 + event.drift) * 0.4, y1);
          context.stroke();
        }
      } else {
        context.beginPath();
        context.moveTo(x, event.y);
        context.lineTo(x + Math.sin(age + event.drift) * 0.45, event.y + event.length);
        context.stroke();
      }
    }

    context.restore();
  }

  private createScratch(frame: FilmFrame): InternalScratchEvent {
    const shortFlash = this.random() > 0.72;
    const broken = this.random() > 0.45;
    const length = randomBetween(this.random, frame.height * 0.16, frame.height * 0.86);
    const y = randomBetween(this.random, -frame.height * 0.05, frame.height - length * 0.45);
    const segmentCount = broken ? 2 + Math.floor(this.random() * 4) : 1;
    const segments = Array.from({ length: segmentCount }, () => {
      const start = this.random() * 0.82;
      const span = randomBetween(this.random, 0.05, 0.22);

      return { start, end: Math.min(1, start + span) };
    }).sort((a, b) => a.start - b.start);

    return {
      x: randomBetween(this.random, frame.width * -0.02, frame.width * 1.02),
      y,
      length,
      opacity: randomBetween(this.random, 0.025, shortFlash ? 0.13 : 0.075),
      lifespan: shortFlash ? randomBetween(this.random, 0.045, 0.13) : randomBetween(this.random, 0.42, 1.85),
      flicker: randomBetween(this.random, 0.5, 1.6),
      broken,
      bornAt: frame.time,
      drift: this.random() * Math.PI * 2,
      width: randomBetween(this.random, 0.45, 1.05),
      segments,
    };
  }
}

class LightLeakSystem {
  private readonly random: () => number;
  private readonly events: InternalLightLeakEvent[] = [];
  private nextAmbientAt = 0;

  constructor(random: () => number) {
    this.random = random;
  }

  resize(frame: FilmSize) {
    this.events.length = 0;
    this.nextAmbientAt = randomBetween(this.random, 7, 13);
    void frame;
  }

  trigger(time: number, size: FilmSize, reducedMotion: boolean) {
    this.events.push(this.createEvent(time, size, reducedMotion, true));
  }

  update(frame: FilmFrame) {
    for (let index = this.events.length - 1; index >= 0; index -= 1) {
      const event = this.events[index];

      if (frame.time - event.startTime > event.duration) {
        this.events.splice(index, 1);
      }
    }

    if (frame.reducedMotion || frame.time < this.nextAmbientAt) {
      return;
    }

    if (this.random() < 0.35) {
      this.events.push(this.createEvent(frame.time, frame, frame.reducedMotion, false));
    }

    this.nextAmbientAt = frame.time + randomBetween(this.random, 9, 18);
  }

  render(frame: FilmFrame) {
    for (const event of this.events) {
      const progress = (frame.time - event.startTime) / event.duration;

      if (progress < 0 || progress > 1) {
        continue;
      }

      const strength = easeExposure(progress) * event.intensity;

      this.renderWash(frame, event, strength);
      this.renderCore(frame, event, strength);
      this.renderEdgeBurn(frame, event, strength);
    }
  }

  private createEvent(
    startTime: number,
    size: FilmSize,
    reducedMotion: boolean,
    deliberate: boolean,
  ): InternalLightLeakEvent {
    const origin = deliberate
      ? pick(this.random, ["left", "right", "top", "bottom", "corner", "random"] as const)
      : pick(this.random, ["left", "right", "top", "bottom", "corner"] as const);
    const shape = pick(this.random, ["band", "wash", "burn", "flare"] as const);
    const colors = pick(this.random, LIGHT_LEAK_COLORS);
    const geometry = this.createGeometry(size, origin, shape);
    const seed = this.random() * 10000;

    return {
      startTime,
      duration: reducedMotion
        ? randomBetween(this.random, 0.42, 0.58)
        : deliberate
          ? randomBetween(this.random, 0.62, 0.9)
          : randomBetween(this.random, 0.48, 0.78),
      origin,
      shape,
      geometry,
      intensity: deliberate ? randomBetween(this.random, 0.9, 1.12) : randomBetween(this.random, 0.38, 0.72),
      colors,
      seed,
      boundary: this.createBoundary(geometry, shape, seed),
      edge: this.createEdgeTrace(geometry, origin, seed),
    };
  }

  private createGeometry(
    size: FilmSize,
    origin: LightLeakEvent["origin"],
    shape: LightLeakEvent["shape"],
  ): LightLeakEvent["geometry"] {
    const widthScale = shape === "wash" ? randomBetween(this.random, 0.48, 0.82) : randomBetween(this.random, 0.26, 0.58);
    const heightScale = shape === "band" ? randomBetween(this.random, 0.64, 1.28) : randomBetween(this.random, 0.36, 0.82);
    const leakWidth = size.width * widthScale;
    const leakHeight = size.height * heightScale;
    const angle = randomBetween(this.random, -0.58, 0.58);

    switch (origin) {
      case "right":
        return {
          x: size.width - leakWidth * randomBetween(this.random, 0.82, 0.96),
          y: randomBetween(this.random, -leakHeight * 0.24, size.height - leakHeight * 0.5),
          width: leakWidth,
          height: leakHeight,
          angle,
        };
      case "top":
        return {
          x: randomBetween(this.random, -leakWidth * 0.18, size.width - leakWidth * 0.5),
          y: -leakHeight * randomBetween(this.random, 0.24, 0.44),
          width: leakWidth,
          height: leakHeight,
          angle: angle + Math.PI / 2,
        };
      case "bottom":
        return {
          x: randomBetween(this.random, -leakWidth * 0.18, size.width - leakWidth * 0.5),
          y: size.height - leakHeight * randomBetween(this.random, 0.58, 0.78),
          width: leakWidth,
          height: leakHeight,
          angle: angle + Math.PI / 2,
        };
      case "corner": {
        const left = this.random() > 0.5;
        const top = this.random() > 0.5;

        return {
          x: left ? -leakWidth * 0.22 : size.width - leakWidth * 0.82,
          y: top ? -leakHeight * 0.22 : size.height - leakHeight * 0.72,
          width: leakWidth,
          height: leakHeight,
          angle: angle + (left ? -0.24 : 0.24),
        };
      }
      case "random":
        return {
          x: randomBetween(this.random, -leakWidth * 0.12, size.width - leakWidth * 0.55),
          y: randomBetween(this.random, -leakHeight * 0.12, size.height - leakHeight * 0.55),
          width: leakWidth,
          height: leakHeight,
          angle,
        };
      case "left":
      default:
        return {
          x: -leakWidth * randomBetween(this.random, 0.16, 0.34),
          y: randomBetween(this.random, -leakHeight * 0.24, size.height - leakHeight * 0.5),
          width: leakWidth,
          height: leakHeight,
          angle,
        };
    }
  }

  private createBoundary(
    geometry: LightLeakEvent["geometry"],
    shape: LightLeakEvent["shape"],
    seed: number,
  ) {
    const random = createRandom(Math.floor(seed * 1000));
    const points: Array<{ x: number; y: number }> = [];
    const count = shape === "band" ? 12 : 16;
    const cx = geometry.x + geometry.width * 0.5;
    const cy = geometry.y + geometry.height * 0.5;

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const rx = geometry.width * randomBetween(random, 0.34, 0.58);
      const ry = geometry.height * randomBetween(random, 0.28, 0.56);
      const pinch = shape === "burn" && index % 3 === 0 ? 0.72 : 1;

      points.push({
        x: cx + Math.cos(angle) * rx * pinch,
        y: cy + Math.sin(angle) * ry * pinch,
      });
    }

    return points;
  }

  private createEdgeTrace(
    geometry: LightLeakEvent["geometry"],
    origin: LightLeakEvent["origin"],
    seed: number,
  ) {
    const random = createRandom(Math.floor(seed * 1700 + 31));
    const points: Array<{ x: number; y: number }> = [];
    const count = 10;

    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);

      if (origin === "right") {
        points.push({
          x: geometry.x + geometry.width * randomBetween(random, 0.74, 0.98),
          y: geometry.y + geometry.height * t + randomBetween(random, -16, 16),
        });
      } else if (origin === "top") {
        points.push({
          x: geometry.x + geometry.width * t + randomBetween(random, -16, 16),
          y: geometry.y + geometry.height * randomBetween(random, 0.1, 0.3),
        });
      } else if (origin === "bottom") {
        points.push({
          x: geometry.x + geometry.width * t + randomBetween(random, -16, 16),
          y: geometry.y + geometry.height * randomBetween(random, 0.68, 0.92),
        });
      } else {
        points.push({
          x: geometry.x + geometry.width * randomBetween(random, 0.04, 0.24),
          y: geometry.y + geometry.height * t + randomBetween(random, -16, 16),
        });
      }
    }

    return points;
  }

  private renderWash(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const { geometry, colors } = event;

    context.save();
    context.translate(geometry.x + geometry.width * 0.5, geometry.y + geometry.height * 0.5);
    context.rotate(geometry.angle * 0.45);
    context.translate(-geometry.x - geometry.width * 0.5, -geometry.y - geometry.height * 0.5);
    pathIrregularLoop(context, event.boundary);
    context.clip();

    const gradient = context.createLinearGradient(
      geometry.x,
      geometry.y + geometry.height * 0.5,
      geometry.x + geometry.width,
      geometry.y + geometry.height * 0.52,
    );
    gradient.addColorStop(0, rgba(colors.mid, 0.075 * strength));
    gradient.addColorStop(0.5, rgba(colors.core, 0.04 * strength));
    gradient.addColorStop(1, rgba(colors.mid, 0));

    context.fillStyle = gradient;
    context.fillRect(geometry.x - geometry.width * 0.08, geometry.y - geometry.height * 0.08, geometry.width * 1.16, geometry.height * 1.16);
    context.restore();
  }

  private renderCore(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const { geometry, colors, shape } = event;

    context.save();
    context.globalCompositeOperation = "screen";
    context.translate(geometry.x + geometry.width * 0.5, geometry.y + geometry.height * 0.5);
    context.rotate(geometry.angle);
    context.translate(-geometry.x - geometry.width * 0.5, -geometry.y - geometry.height * 0.5);

    if (shape === "band") {
      this.pathBand(context, geometry, event.seed);
    } else if (shape === "flare") {
      this.pathFlare(context, geometry, event.seed);
    } else {
      pathIrregularLoop(context, event.boundary);
    }

    context.clip();

    const gradient = context.createLinearGradient(
      geometry.x,
      geometry.y,
      geometry.x + geometry.width,
      geometry.y + geometry.height * 0.35,
    );
    gradient.addColorStop(0, rgba(colors.core, 0.19 * strength));
    gradient.addColorStop(0.18, rgba(colors.mid, 0.15 * strength));
    gradient.addColorStop(0.54, rgba(colors.edge, 0.055 * strength));
    gradient.addColorStop(1, rgba(colors.core, 0));

    context.fillStyle = gradient;
    context.fillRect(geometry.x - geometry.width * 0.08, geometry.y - geometry.height * 0.08, geometry.width * 1.16, geometry.height * 1.16);
    context.restore();
  }

  private renderEdgeBurn(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const { colors } = event;

    context.save();
    context.globalCompositeOperation = "source-over";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = rgba(colors.edge, 0.11 * strength);
    context.lineWidth = randomBetween(createRandom(Math.floor(event.seed * 911)), 1.6, 4.6);

    context.beginPath();
    event.edge.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
        return;
      }

      const previous = event.edge[index - 1];
      context.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) * 0.5, (previous.y + point.y) * 0.5);
    });
    context.stroke();

    context.strokeStyle = rgba(colors.core, 0.055 * strength);
    context.lineWidth = 0.85;
    context.stroke();
    context.restore();
  }

  private pathBand(
    context: CanvasRenderingContext2D,
    geometry: LightLeakEvent["geometry"],
    seed: number,
  ) {
    const random = createRandom(Math.floor(seed * 2200));
    const top: Array<{ x: number; y: number }> = [];
    const bottom: Array<{ x: number; y: number }> = [];
    const count = 7;

    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);
      const x = geometry.x + geometry.width * t;
      const center = geometry.y + geometry.height * (0.28 + Math.sin(t * Math.PI) * 0.12);
      const thickness = geometry.height * randomBetween(random, 0.12, 0.26);
      top.push({ x, y: center - thickness + randomBetween(random, -12, 12) });
      bottom.push({ x, y: center + thickness + randomBetween(random, -12, 12) });
    }

    context.beginPath();
    context.moveTo(top[0].x, top[0].y);
    for (let index = 1; index < top.length; index += 1) {
      const previous = top[index - 1];
      const point = top[index];
      context.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) * 0.5, (previous.y + point.y) * 0.5);
    }
    for (let index = bottom.length - 1; index >= 0; index -= 1) {
      const previous = bottom[index + 1] ?? bottom[index];
      const point = bottom[index];
      context.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) * 0.5, (previous.y + point.y) * 0.5);
    }
    context.closePath();
  }

  private pathFlare(
    context: CanvasRenderingContext2D,
    geometry: LightLeakEvent["geometry"],
    seed: number,
  ) {
    const random = createRandom(Math.floor(seed * 2600));
    const points = [
      { x: geometry.x, y: geometry.y + geometry.height * randomBetween(random, 0.18, 0.44) },
      { x: geometry.x + geometry.width * randomBetween(random, 0.3, 0.48), y: geometry.y + randomBetween(random, -10, 24) },
      { x: geometry.x + geometry.width * randomBetween(random, 0.78, 1.04), y: geometry.y + geometry.height * randomBetween(random, 0.2, 0.48) },
      { x: geometry.x + geometry.width * randomBetween(random, 0.68, 0.94), y: geometry.y + geometry.height * randomBetween(random, 0.56, 0.92) },
      { x: geometry.x + geometry.width * randomBetween(random, 0.18, 0.42), y: geometry.y + geometry.height * randomBetween(random, 0.62, 1.02) },
    ];

    pathIrregularLoop(context, points);
  }
}

class FilmEngine {
  private readonly context: CanvasRenderingContext2D;
  private readonly random: () => number;
  private readonly exposure: ExposureSystem;
  private readonly grain: GrainSystem;
  private readonly scratches: ScratchSystem;
  private readonly lightLeaks: LightLeakSystem;
  private readonly reducedMotion: boolean;
  private state: FilmState = {
    exposure: 1,
    instability: 0.35,
    contamination: 0.42,
    density: 0.5,
  };
  private size: FilmSize = { width: 0, height: 0, ratio: 1 };
  private lastTime = 0;

  constructor(context: CanvasRenderingContext2D, reducedMotion: boolean) {
    const seed = Math.floor((globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0] ?? Math.random() * 4294967295) >>> 0);
    this.context = context;
    this.random = createRandom(seed);
    this.exposure = new ExposureSystem(this.random);
    this.grain = new GrainSystem(this.random);
    this.scratches = new ScratchSystem(this.random);
    this.lightLeaks = new LightLeakSystem(this.random);
    this.reducedMotion = reducedMotion;
  }

  resize(size: FilmSize) {
    this.size = size;
    this.grain.resize(size, this.reducedMotion);
    this.scratches.resize();
    this.lightLeaks.resize(size);
  }

  triggerLightLeak(timeMs: number) {
    this.lightLeaks.trigger(timeMs / 1000, this.size, this.reducedMotion);
  }

  render(timeMs: number) {
    const time = timeMs / 1000;
    const delta = this.lastTime === 0 ? 1 / 60 : Math.min(0.08, time - this.lastTime);
    this.lastTime = time;
    this.state = this.exposure.update(time);

    const frame: FilmFrame = {
      ...this.size,
      context: this.context,
      delta,
      time,
      reducedMotion: this.reducedMotion,
      state: this.state,
    };

    this.context.clearRect(0, 0, this.size.width, this.size.height);
    this.exposure.render(frame);
    this.grain.update(frame);
    this.grain.render(frame);
    this.scratches.update(frame);
    this.scratches.render(frame);
    this.lightLeaks.update(frame);
    this.lightLeaks.render(frame);
  }
}

export function CanvasFilmOverlay({ lightLeakTriggerKey }: CanvasFilmOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FilmEngine | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (lightLeakTriggerKey === 0) {
      return;
    }

    engineRef.current?.triggerLightLeak(performance.now());
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

    const engine = new FilmEngine(context, reducedMotion);
    engineRef.current = engine;

    let animationFrame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      engine.resize({ width, height, ratio });
    };

    const drawFrame = (time: number) => {
      engine.render(time);
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    resize();
    drawFrame(performance.now());
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);

      if (engineRef.current === engine) {
        engineRef.current = null;
      }
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="canvas-film-overlay" aria-hidden="true" />;
}
