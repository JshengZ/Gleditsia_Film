import type {
  FilmFrame,
  FilmLightLeakCue,
  FilmScene,
  FilmSize,
  LightLeakEvent,
  Point,
} from "./types";
import {
  createRandom,
  easeExposure,
  pathIrregularLoop,
  randomBetween,
  rgba,
} from "./utils";

type ExposurePatch = {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  alpha: number;
  angle: number;
  color: string;
  phase: number;
  shape: Point[];
};

type InternalLightLeakEvent = LightLeakEvent & {
  cue: FilmLightLeakCue;
  plume: Point[];
  wash: Point[];
  edge: Point[];
  patches: ExposurePatch[];
};

const LOWER_LEFT_EXPOSURE_COLORS = {
  core: "255, 214, 98",
  mid: "219, 71, 32",
  edge: "94, 21, 16",
};

export class LightLeakSystem {
  private readonly random: () => number;
  private readonly events: InternalLightLeakEvent[] = [];
  private readonly triggeredCues = new Set<FilmLightLeakCue>();
  private nextId = 1;
  private lastTriggerAt = -Infinity;

  constructor(random: () => number) {
    this.random = random;
  }

  resize(size: FilmSize) {
    this.events.length = 0;
    void size;
  }

  trigger(
    time: number,
    size: FilmSize,
    reducedMotion: boolean,
    scene: FilmScene,
    cue: FilmLightLeakCue,
  ) {
    if (size.width <= 0 || size.height <= 0 || this.triggeredCues.has(cue)) {
      return;
    }

    if (this.events.some((event) => time - event.startTime < event.duration)) {
      return;
    }

    if (time - this.lastTriggerAt < 0.6) {
      return;
    }

    void scene;
    this.triggeredCues.add(cue);
    this.lastTriggerAt = time;
    this.events.push(this.createEvent(time, size, reducedMotion, cue));
  }

  update(frame: FilmFrame) {
    for (let index = this.events.length - 1; index >= 0; index -= 1) {
      const event = this.events[index];

      if (frame.time - event.startTime > event.duration) {
        this.events.splice(index, 1);
      }
    }
  }

  render(frame: FilmFrame) {
    for (const event of this.events) {
      const progress = (frame.time - event.startTime) / event.duration;

      if (progress < 0 || progress > 1) {
        continue;
      }

      const strength = easeExposure(progress) * event.intensity;

      this.renderWash(frame, event, strength);
      this.renderExposurePatches(frame, event, strength);
      this.renderTransparencyBreakup(frame, event, strength);
      this.renderEdgeBurn(frame, event, strength);
      this.renderLeakGrain(frame, event, strength);
    }
  }

  private createEvent(
    startTime: number,
    size: FilmSize,
    reducedMotion: boolean,
    cue: FilmLightLeakCue,
  ): InternalLightLeakEvent {
    const width = size.width * randomBetween(this.random, 0.46, 0.56);
    const height = size.height * randomBetween(this.random, 0.62, 0.76);
    const event: LightLeakEvent = {
      id: this.nextId++,
      startTime,
      duration: reducedMotion
        ? randomBetween(this.random, 0.48, 0.58)
        : randomBetween(this.random, 0.78, 0.94),
      origin: "left-bottom",
      shape: "flare",
      x: -width * randomBetween(this.random, 0.05, 0.1),
      y: size.height - height * randomBetween(this.random, 0.88, 0.98),
      width,
      height,
      angle: randomBetween(this.random, -0.07, 0.025),
      intensity: randomBetween(this.random, 1.02, 1.16),
      softness: randomBetween(this.random, 0.82, 0.98),
      transparency: randomBetween(this.random, 0.82, 0.94),
      colors: LOWER_LEFT_EXPOSURE_COLORS,
      seed: this.random() * 10000,
    };

    return {
      ...event,
      cue,
      plume: this.createPlume(event, 1),
      wash: this.createPlume(event, 1.18),
      edge: this.createEdge(event),
      patches: this.createExposurePatches(event),
    };
  }

  private createPlume(event: LightLeakEvent, scale: number) {
    const random = createRandom(Math.floor(event.seed * 917 * scale + 23));
    const points: Point[] = [];
    const width = event.width * scale;
    const height = event.height * scale;
    const x = event.x;
    const y = event.y + event.height * (1 - scale) * 0.42;
    const upperCount = 9;
    const lowerCount = 8;

    points.push({
      x: x - width * 0.08,
      y: y + height * randomBetween(random, 0.36, 0.48),
    });

    for (let index = 1; index < upperCount; index += 1) {
      const t = index / (upperCount - 1);
      const reach = t ** 0.72;
      const lift = Math.sin(t * Math.PI) * randomBetween(random, 0.05, 0.12);

      points.push({
        x: x + width * reach * randomBetween(random, 0.74, 0.98),
        y:
          y +
          height *
            (0.43 - t * randomBetween(random, 0.23, 0.35) - lift) +
          randomBetween(random, -20, 18),
      });
    }

    for (let index = lowerCount - 1; index >= 0; index -= 1) {
      const t = index / (lowerCount - 1);
      const reach = t ** 0.68;
      const belly = Math.sin(t * Math.PI) * randomBetween(random, 0.04, 0.13);

      points.push({
        x: x + width * reach * randomBetween(random, 0.58, 0.86),
        y:
          y +
          height *
            (0.96 - t * randomBetween(random, 0.12, 0.24) + belly) +
          randomBetween(random, -18, 24),
      });
    }

    return points;
  }

  private createEdge(event: LightLeakEvent) {
    const random = createRandom(Math.floor(event.seed * 1229 + 71));
    const points: Point[] = [];
    const verticalCount = 8;
    const bottomCount = 6;

    for (let index = 0; index < verticalCount; index += 1) {
      const t = index / (verticalCount - 1);
      points.push({
        x: event.x + event.width * randomBetween(random, 0.015, 0.09),
        y: event.y + event.height * randomBetween(random, 0.42 + t * 0.46, 0.48 + t * 0.52),
      });
    }

    for (let index = 1; index < bottomCount; index += 1) {
      const t = index / (bottomCount - 1);
      points.push({
        x: event.x + event.width * randomBetween(random, 0.08 + t * 0.2, 0.14 + t * 0.3),
        y: event.y + event.height * randomBetween(random, 0.92, 1.04),
      });
    }

    return points;
  }

  private createExposurePatches(event: LightLeakEvent) {
    const random = createRandom(Math.floor(event.seed * 1427 + 103));
    const count = 46 + Math.floor(this.random() * 28);

    return Array.from({ length: count }, () => {
      const falloff = random() ** 1.65;
      const x = event.x + event.width * falloff * randomBetween(random, 0.08, 0.98);
      const y =
        event.y +
        event.height *
          (0.28 + (random() ** 0.56) * 0.72 - falloff * randomBetween(random, 0.02, 0.2));
      const sizeBias = 1 - falloff * 0.55;
      const color =
        random() > 0.74
          ? event.colors.core
          : random() > 0.36
            ? event.colors.mid
            : event.colors.edge;

      return {
        x,
        y,
        radiusX: event.width * randomBetween(random, 0.012, 0.062) * sizeBias,
        radiusY: event.height * randomBetween(random, 0.006, 0.032) * sizeBias,
        alpha: randomBetween(random, 0.015, 0.07) * sizeBias,
        angle: randomBetween(random, -0.8, 0.55),
        color,
        phase: random() * Math.PI * 2,
        shape: this.createPatchShape(random),
      };
    });
  }

  private createPatchShape(random: () => number) {
    const count = 6 + Math.floor(random() * 5);

    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const radius = randomBetween(random, 0.42, 1.08);

      return {
        x: Math.cos(angle) * radius * randomBetween(random, 0.72, 1.24),
        y: Math.sin(angle) * radius * randomBetween(random, 0.48, 1.12),
      };
    });
  }

  private renderWash(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const alpha = (0.052 + event.softness * 0.036) * strength * event.transparency;
    const originX = event.x + event.width * 0.02;
    const originY = event.y + event.height * 0.94;

    context.save();
    context.globalCompositeOperation = "screen";
    this.applyEventTransform(context, event, 0.18);
    pathIrregularLoop(context, event.wash);
    context.clip();

    const gradient = context.createRadialGradient(
      originX,
      originY,
      event.width * 0.02,
      originX + event.width * 0.18,
      originY - event.height * 0.1,
      event.width * 1.04,
    );
    gradient.addColorStop(0, rgba(event.colors.core, alpha * 0.82));
    gradient.addColorStop(0.18, rgba(event.colors.mid, alpha * 1.08));
    gradient.addColorStop(0.42, rgba(event.colors.edge, alpha * 0.68));
    gradient.addColorStop(0.72, rgba(event.colors.mid, alpha * 0.2));
    gradient.addColorStop(1, rgba(event.colors.mid, 0));

    context.fillStyle = gradient;
    context.fillRect(event.x - 16, event.y - 16, event.width * 1.24, event.height * 1.22);
    context.restore();
  }

  private renderExposurePatches(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context, time } = frame;

    context.save();
    context.globalCompositeOperation = "screen";
    this.applyEventTransform(context, event, 0.42);
    pathIrregularLoop(context, event.plume);
    context.clip();

    for (const patch of event.patches) {
      const shimmer = 0.86 + Math.sin(time * 1.6 + patch.phase) * 0.08;
      const alpha = patch.alpha * strength * event.transparency * shimmer;

      context.save();
      context.translate(patch.x, patch.y);
      context.rotate(patch.angle);
      context.scale(patch.radiusX, patch.radiusY);
      context.beginPath();
      patch.shape.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
          return;
        }

        context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.fillStyle = rgba(patch.color, alpha);
      context.fill();
      context.restore();
    }

    context.restore();
  }

  private renderEdgeBurn(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const random = createRandom(Math.floor(event.seed * 1753 + 211));
    const alpha = (0.096 + event.intensity * 0.052) * strength * event.transparency;

    context.save();
    context.globalCompositeOperation = "screen";
    this.applyEventTransform(context, event, 0.12);
    context.lineCap = "round";
    context.lineJoin = "round";

    for (let index = 0; index < 5; index += 1) {
      context.beginPath();
      context.lineWidth = randomBetween(random, 8, 34);
      context.strokeStyle = rgba(
        index < 2 ? event.colors.core : event.colors.mid,
        alpha * randomBetween(random, 0.2, 0.72),
      );

      const start = event.edge[0];
      if (!start) {
        continue;
      }

      context.moveTo(start.x - randomBetween(random, 18, 46), start.y + randomBetween(random, -12, 16));

      for (const point of event.edge) {
        context.lineTo(
          point.x + randomBetween(random, -8, 16),
          point.y + randomBetween(random, -18, 18),
        );
      }

      context.stroke();
    }

    context.restore();
  }

  private renderTransparencyBreakup(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context, time } = frame;
    const random = createRandom(Math.floor(event.seed * 1999 + Math.floor(time * 4)));
    const count = 18;

    context.save();
    this.applyEventTransform(context, event, 0.34);
    pathIrregularLoop(context, event.plume);
    context.clip();
    context.globalCompositeOperation = "destination-out";

    for (let index = 0; index < count; index += 1) {
      const reach = random() ** 1.18;
      const centerX = event.x + event.width * randomBetween(random, 0.1, 0.92) * reach;
      const centerY = event.y + event.height * randomBetween(random, 0.28, 0.98);
      const radiusX = event.width * randomBetween(random, 0.012, 0.064);
      const radiusY = event.height * randomBetween(random, 0.008, 0.05);
      const alpha = randomBetween(random, 0.035, 0.16) * strength * (0.72 + reach * 0.2);
      const points = this.createPatchShape(random);

      context.save();
      context.translate(centerX, centerY);
      context.rotate(randomBetween(random, -0.7, 0.55));
      context.scale(radiusX, radiusY);
      context.beginPath();
      points.forEach((point, pointIndex) => {
        if (pointIndex === 0) {
          context.moveTo(point.x, point.y);
          return;
        }

        context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.fillStyle = rgba("0, 0, 0", alpha);
      context.fill();
      context.restore();
    }

    context.restore();
  }

  private renderLeakGrain(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context, time } = frame;
    const random = createRandom(Math.floor(event.seed * 2129 + Math.floor(time * 18)));
    const count = 150 + Math.floor((event.width * event.height) / 5600);

    context.save();
    context.globalCompositeOperation = "source-over";
    this.applyEventTransform(context, event, 0.38);
    pathIrregularLoop(context, event.plume);
    context.clip();

    for (let index = 0; index < count; index += 1) {
      const reach = random() ** 1.42;
      const x = event.x + event.width * reach * randomBetween(random, 0.02, 1.02);
      const y = event.y + event.height * randomBetween(random, 0.2, 1.04);
      const distanceFade = Math.max(0.18, 1 - reach * 0.9);
      const alpha =
        randomBetween(random, 0.015, 0.068) *
        strength *
        event.transparency *
        distanceFade;
      const size = randomBetween(random, 0.55, reach < 0.42 ? 2.3 : 1.45);
      const color =
        index % 5 === 0
          ? event.colors.core
          : index % 2 === 0
            ? "245, 163, 83"
            : event.colors.mid;

      context.fillStyle = rgba(color, alpha);
      context.fillRect(x, y, size, size * randomBetween(random, 0.72, 1.35));
    }

    context.restore();
  }

  private applyEventTransform(
    context: CanvasRenderingContext2D,
    event: LightLeakEvent,
    scale: number,
  ) {
    const originX = event.x + event.width * 0.05;
    const originY = event.y + event.height * 0.92;

    context.translate(originX, originY);
    context.rotate(event.angle * scale);
    context.translate(-originX, -originY);
  }
}
