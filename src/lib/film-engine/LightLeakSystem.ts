import { LIGHT_LEAK_COLORS, SCENE_PROFILES } from "./constants";
import type {
  FilmFrame,
  FilmScene,
  FilmSize,
  LightLeakEvent,
  LightLeakOrigin,
  LightLeakShape,
  Point,
} from "./types";
import {
  createRandom,
  easeExposure,
  pathIrregularLoop,
  pick,
  randomBetween,
  rgba,
  strokeSmoothPath,
} from "./utils";

type InternalLightLeakEvent = LightLeakEvent & {
  boundary: Point[];
  washBoundary: Point[];
  edge: Point[];
};

export class LightLeakSystem {
  private readonly random: () => number;
  private readonly events: InternalLightLeakEvent[] = [];
  private nextId = 1;
  private nextAmbientAt = 0;

  constructor(random: () => number) {
    this.random = random;
  }

  resize(size: FilmSize) {
    this.events.length = 0;
    this.nextAmbientAt = randomBetween(this.random, 9, 18);
    void size;
  }

  trigger(time: number, size: FilmSize, reducedMotion: boolean, scene: FilmScene) {
    if (size.width <= 0 || size.height <= 0) {
      return;
    }

    this.events.push(this.createEvent(time, size, reducedMotion, true, scene));
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

    const profile = SCENE_PROFILES[frame.state.scene];

    if (this.random() < profile.ambientLeakChance) {
      this.events.push(this.createEvent(frame.time, frame, frame.reducedMotion, false, frame.state.scene));
    }

    this.nextAmbientAt = frame.time + randomBetween(this.random, 12, 26);
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
      this.renderContaminationGrain(frame, event, strength);
    }
  }

  private createEvent(
    startTime: number,
    size: FilmSize,
    reducedMotion: boolean,
    deliberate: boolean,
    scene: FilmScene,
  ): InternalLightLeakEvent {
    const origin = deliberate
      ? pick(this.random, ["left", "right", "top", "bottom", "corner", "random"] as const)
      : pick(this.random, ["left", "right", "top", "bottom", "corner"] as const);
    const shape = pick(this.random, ["band", "wash", "burn", "flare"] as const);
    const colors = pick(this.random, LIGHT_LEAK_COLORS);
    const geometry = this.createGeometry(size, origin, shape);
    const seed = this.random() * 10000;
    const profile = SCENE_PROFILES[scene];
    const event: LightLeakEvent = {
      id: this.nextId++,
      startTime,
      duration: reducedMotion
        ? randomBetween(this.random, 0.35, 0.5)
        : deliberate
          ? randomBetween(this.random, 0.45, 0.78)
          : randomBetween(this.random, 0.35, 0.9),
      origin,
      shape,
      ...geometry,
      intensity: deliberate
        ? randomBetween(this.random, 0.72, 1.0) * (0.95 + profile.contamination * 0.18)
        : randomBetween(this.random, 0.32, 0.64),
      softness: randomBetween(this.random, 0.65, 1),
      transparency: randomBetween(this.random, 0.72, 0.94),
      colors,
      seed,
    };

    return {
      ...event,
      boundary: this.createBoundary(event, false),
      washBoundary: this.createBoundary(event, true),
      edge: this.createEdgeTrace(event),
    };
  }

  private createGeometry(
    size: FilmSize,
    origin: LightLeakOrigin,
    shape: LightLeakShape,
  ): Pick<LightLeakEvent, "x" | "y" | "width" | "height" | "angle"> {
    const widthScale =
      shape === "wash"
        ? randomBetween(this.random, 0.28, 0.5)
        : shape === "burn"
          ? randomBetween(this.random, 0.2, 0.38)
          : randomBetween(this.random, 0.24, 0.48);
    const heightScale =
      shape === "band"
        ? randomBetween(this.random, 0.34, 0.82)
        : shape === "flare"
          ? randomBetween(this.random, 0.28, 0.7)
          : randomBetween(this.random, 0.32, 0.76);
    const leakWidth = size.width * widthScale;
    const leakHeight = size.height * heightScale;
    const angle = randomBetween(this.random, -0.55, 0.55);
    const resolvedOrigin =
      origin === "random"
        ? pick(this.random, ["left", "right", "top", "bottom"] as const)
        : origin;

    switch (resolvedOrigin) {
      case "right":
        return {
          x: size.width - leakWidth * randomBetween(this.random, 0.55, 0.88),
          y: randomBetween(this.random, -leakHeight * 0.2, size.height - leakHeight * 0.44),
          width: leakWidth,
          height: leakHeight,
          angle: angle + randomBetween(this.random, -0.1, 0.18),
        };
      case "top":
        return {
          x: randomBetween(this.random, -leakWidth * 0.16, size.width - leakWidth * 0.44),
          y: -leakHeight * randomBetween(this.random, 0.18, 0.42),
          width: leakWidth,
          height: leakHeight,
          angle: angle + Math.PI / 2,
        };
      case "bottom":
        return {
          x: randomBetween(this.random, -leakWidth * 0.16, size.width - leakWidth * 0.44),
          y: size.height - leakHeight * randomBetween(this.random, 0.56, 0.82),
          width: leakWidth,
          height: leakHeight,
          angle: angle + Math.PI / 2,
        };
      case "corner": {
        const left = this.random() > 0.5;
        const top = this.random() > 0.5;

        return {
          x: left ? -leakWidth * randomBetween(this.random, 0.18, 0.38) : size.width - leakWidth * randomBetween(this.random, 0.58, 0.86),
          y: top ? -leakHeight * randomBetween(this.random, 0.16, 0.36) : size.height - leakHeight * randomBetween(this.random, 0.58, 0.82),
          width: leakWidth,
          height: leakHeight,
          angle: angle + (left ? -0.18 : 0.18),
        };
      }
      case "left":
      default:
        return {
          x: -leakWidth * randomBetween(this.random, 0.18, 0.42),
          y: randomBetween(this.random, -leakHeight * 0.2, size.height - leakHeight * 0.44),
          width: leakWidth,
          height: leakHeight,
          angle,
        };
    }
  }

  private createBoundary(event: LightLeakEvent, wash: boolean) {
    const random = createRandom(Math.floor(event.seed * (wash ? 1700 : 1000)));
    const points: Point[] = [];
    const count = event.shape === "band" ? 13 : 17;
    const cx = event.x + event.width * 0.5;
    const cy = event.y + event.height * 0.5;
    const scale = wash ? 1.22 + event.softness * 0.18 : 1;

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const rx = event.width * randomBetween(random, 0.32, 0.58) * scale;
      const ry = event.height * randomBetween(random, 0.25, 0.54) * scale;
      const pinch = event.shape === "burn" && index % 3 === 0 ? randomBetween(random, 0.58, 0.78) : 1;

      points.push({
        x: cx + Math.cos(angle) * rx * pinch,
        y: cy + Math.sin(angle) * ry * pinch,
      });
    }

    return points;
  }

  private createEdgeTrace(event: LightLeakEvent) {
    const random = createRandom(Math.floor(event.seed * 2300 + 31));
    const points: Point[] = [];
    const count = 11;

    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);

      if (event.origin === "right") {
        points.push({
          x: event.x + event.width * randomBetween(random, 0.7, 0.98),
          y: event.y + event.height * t + randomBetween(random, -18, 18),
        });
      } else if (event.origin === "top") {
        points.push({
          x: event.x + event.width * t + randomBetween(random, -18, 18),
          y: event.y + event.height * randomBetween(random, 0.08, 0.28),
        });
      } else if (event.origin === "bottom") {
        points.push({
          x: event.x + event.width * t + randomBetween(random, -18, 18),
          y: event.y + event.height * randomBetween(random, 0.7, 0.95),
        });
      } else {
        points.push({
          x: event.x + event.width * randomBetween(random, 0.04, 0.26),
          y: event.y + event.height * t + randomBetween(random, -18, 18),
        });
      }
    }

    return points;
  }

  private renderWash(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const alpha = (0.03 + event.softness * 0.032) * strength * event.transparency;
    const gradientLine = this.getGradientLine(event);

    context.save();
    context.globalCompositeOperation = "source-over";
    context.translate(event.x + event.width * 0.5, event.y + event.height * 0.5);
    context.rotate(event.angle * 0.32);
    context.translate(-event.x - event.width * 0.5, -event.y - event.height * 0.5);
    pathIrregularLoop(context, event.washBoundary);

    const gradient = context.createLinearGradient(
      gradientLine.x0,
      gradientLine.y0,
      gradientLine.x1,
      gradientLine.y1,
    );
    gradient.addColorStop(0, rgba(event.colors.mid, alpha));
    gradient.addColorStop(0.46, rgba(event.colors.core, alpha * 0.42));
    gradient.addColorStop(1, rgba(event.colors.mid, 0));

    context.fillStyle = gradient;
    context.fill();
    context.restore();
  }

  private renderCore(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const alpha = (0.08 + event.intensity * 0.09) * strength * event.transparency;
    const gradientLine = this.getGradientLine(event);

    context.save();
    context.globalCompositeOperation = "screen";
    context.translate(event.x + event.width * 0.5, event.y + event.height * 0.5);
    context.rotate(event.angle);
    context.translate(-event.x - event.width * 0.5, -event.y - event.height * 0.5);
    this.pathCore(context, event);

    const gradient = context.createLinearGradient(
      gradientLine.x0,
      gradientLine.y0,
      gradientLine.x1,
      gradientLine.y1,
    );
    gradient.addColorStop(0, rgba(event.colors.core, alpha));
    gradient.addColorStop(0.18, rgba(event.colors.mid, alpha * 0.74));
    gradient.addColorStop(0.52, rgba(event.colors.edge, alpha * 0.28));
    gradient.addColorStop(1, rgba(event.colors.core, 0));

    context.fillStyle = gradient;
    context.fill();
    context.restore();
  }

  private getGradientLine(event: LightLeakEvent) {
    if (event.origin === "right") {
      return {
        x0: event.x + event.width,
        y0: event.y + event.height * 0.5,
        x1: event.x,
        y1: event.y + event.height * 0.5,
      };
    }

    if (event.origin === "top") {
      return {
        x0: event.x + event.width * 0.5,
        y0: event.y,
        x1: event.x + event.width * 0.5,
        y1: event.y + event.height,
      };
    }

    if (event.origin === "bottom") {
      return {
        x0: event.x + event.width * 0.5,
        y0: event.y + event.height,
        x1: event.x + event.width * 0.5,
        y1: event.y,
      };
    }

    if (event.origin === "corner") {
      const fromLeft = event.x < 0;
      const fromTop = event.y < 0;

      return {
        x0: fromLeft ? event.x : event.x + event.width,
        y0: fromTop ? event.y : event.y + event.height,
        x1: fromLeft ? event.x + event.width : event.x,
        y1: fromTop ? event.y + event.height : event.y,
      };
    }

    if (event.origin === "random" && event.y < 0) {
      return {
        x0: event.x + event.width * 0.5,
        y0: event.y,
        x1: event.x + event.width * 0.5,
        y1: event.y + event.height,
      };
    }

    if (event.origin === "random" && event.x > event.width * 0.5) {
      return {
        x0: event.x + event.width,
        y0: event.y + event.height * 0.5,
        x1: event.x,
        y1: event.y + event.height * 0.5,
      };
    }

    return {
      x0: event.x,
      y0: event.y + event.height * 0.5,
      x1: event.x + event.width,
      y1: event.y + event.height * 0.5,
    };
  }

  private renderEdgeBurn(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const edgeAlpha = (0.05 + event.intensity * 0.048) * strength * event.transparency;
    const random = createRandom(Math.floor(event.seed * 911));

    context.save();
    context.globalCompositeOperation = "source-over";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = rgba(event.colors.edge, edgeAlpha);
    context.lineWidth = randomBetween(random, 1.1, 3.6);
    strokeSmoothPath(context, event.edge);

    context.strokeStyle = rgba(event.colors.core, edgeAlpha * 0.42);
    context.lineWidth = 0.75;
    strokeSmoothPath(context, event.edge);
    context.restore();
  }

  private renderContaminationGrain(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const random = createRandom(Math.floor(event.seed * 4100 + frame.time * 16));
    const count = 18 + Math.floor(event.width * event.height / 32000);

    context.save();
    context.globalCompositeOperation = "screen";
    this.pathCore(context, event);
    context.clip();

    for (let index = 0; index < count; index += 1) {
      const x = randomBetween(random, event.x, event.x + event.width);
      const y = randomBetween(random, event.y, event.y + event.height);
      const alpha = randomBetween(random, 0.012, 0.036) * strength;

      context.fillStyle = rgba(event.colors.core, alpha);
      context.fillRect(x, y, randomBetween(random, 0.4, 1.2), randomBetween(random, 0.4, 1.2));
    }

    context.restore();
  }

  private pathCore(context: CanvasRenderingContext2D, event: InternalLightLeakEvent) {
    if (event.shape === "band") {
      this.pathBand(context, event);
      return;
    }

    if (event.shape === "flare") {
      this.pathFlare(context, event);
      return;
    }

    pathIrregularLoop(context, event.boundary);
  }

  private pathBand(context: CanvasRenderingContext2D, event: LightLeakEvent) {
    const random = createRandom(Math.floor(event.seed * 2200));
    const top: Point[] = [];
    const bottom: Point[] = [];
    const count = 7;

    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);
      const x = event.x + event.width * t;
      const center = event.y + event.height * (0.28 + Math.sin(t * Math.PI) * 0.12);
      const thickness = event.height * randomBetween(random, 0.08, 0.22);
      top.push({ x, y: center - thickness + randomBetween(random, -14, 14) });
      bottom.push({ x, y: center + thickness + randomBetween(random, -14, 14) });
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

  private pathFlare(context: CanvasRenderingContext2D, event: LightLeakEvent) {
    const random = createRandom(Math.floor(event.seed * 2600));
    const points = [
      { x: event.x, y: event.y + event.height * randomBetween(random, 0.16, 0.42) },
      { x: event.x + event.width * randomBetween(random, 0.26, 0.48), y: event.y + randomBetween(random, -12, 22) },
      { x: event.x + event.width * randomBetween(random, 0.74, 1.02), y: event.y + event.height * randomBetween(random, 0.2, 0.48) },
      { x: event.x + event.width * randomBetween(random, 0.66, 0.92), y: event.y + event.height * randomBetween(random, 0.56, 0.92) },
      { x: event.x + event.width * randomBetween(random, 0.16, 0.4), y: event.y + event.height * randomBetween(random, 0.62, 1.02) },
    ];

    pathIrregularLoop(context, points);
  }
}
