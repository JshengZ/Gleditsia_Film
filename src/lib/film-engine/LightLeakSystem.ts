import type {
  FilmFrame,
  FilmLightLeakCue,
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
  randomBetween,
  rgba,
} from "./utils";

type InternalLightLeakEvent = LightLeakEvent & {
  cue: FilmLightLeakCue;
  body: Point[];
  wash: Point[];
  edge: Point[];
};

const CLEAN_EDGE_COLORS = {
  core: "255, 205, 92",
  mid: "215, 65, 31",
  edge: "107, 22, 18",
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

    if (time - this.lastTriggerAt < 0.42) {
      return;
    }

    this.triggeredCues.add(cue);
    this.lastTriggerAt = time;
    this.events.push(this.createEvent(time, size, reducedMotion, scene, cue));
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
      this.renderCore(frame, event, strength);
      this.renderEdgeBurn(frame, event, strength);
      this.renderContaminationGrain(frame, event, strength);
    }
  }

  private createEvent(
    startTime: number,
    size: FilmSize,
    reducedMotion: boolean,
    scene: FilmScene,
    cue: FilmLightLeakCue,
  ): InternalLightLeakEvent {
    const origin: LightLeakOrigin =
      cue === "photo-developing" && this.random() > 0.42 ? "left-bottom" : "left";
    const shape: LightLeakShape = cue === "brand-move" ? "burn" : "wash";
    const width = size.width * randomBetween(this.random, 0.2, 0.25);
    const height = size.height * randomBetween(this.random, 0.96, 1.18);
    const y =
      origin === "left-bottom"
        ? size.height - height * randomBetween(this.random, 0.78, 0.96)
        : -height * randomBetween(this.random, 0.05, 0.16);
    const event: LightLeakEvent = {
      id: this.nextId++,
      startTime,
      duration: reducedMotion
        ? randomBetween(this.random, 0.32, 0.42)
        : cue === "brand-move"
          ? randomBetween(this.random, 0.42, 0.52)
          : randomBetween(this.random, 0.46, 0.58),
      origin,
      shape,
      x: -width * randomBetween(this.random, 0.02, 0.08),
      y,
      width,
      height,
      angle: randomBetween(this.random, -0.12, 0.1),
      intensity: cue === "brand-move" ? randomBetween(this.random, 0.86, 1.04) : randomBetween(this.random, 0.9, 1.12),
      softness: randomBetween(this.random, 0.72, 0.96),
      transparency: scene === "photo-developing" ? randomBetween(this.random, 0.7, 0.84) : randomBetween(this.random, 0.66, 0.8),
      colors: CLEAN_EDGE_COLORS,
      seed: this.random() * 10000,
    };

    return {
      ...event,
      cue,
      body: this.createBody(event, 1),
      wash: this.createBody(event, 1.2),
      edge: this.createEdge(event),
    };
  }

  private createBody(event: LightLeakEvent, scale: number) {
    const random = createRandom(Math.floor(event.seed * scale * 1300));
    const points: Point[] = [];
    const count = 8;
    const topBase = event.y + event.height * randomBetween(random, 0.02, 0.11);
    const bottomBase = event.y + event.height * randomBetween(random, 0.82, 0.98);
    const innerWidth = event.width * scale;

    points.push({
      x: event.x - event.width * 0.08,
      y: topBase + randomBetween(random, -18, 12),
    });

    for (let index = 1; index < count; index += 1) {
      const t = index / (count - 1);
      const curve = Math.sin(t * Math.PI);
      points.push({
        x: event.x + innerWidth * (0.48 + curve * randomBetween(random, 0.2, 0.44)),
        y: topBase + event.height * t * randomBetween(random, 0.03, 0.14) + randomBetween(random, -28, 24),
      });
    }

    for (let index = count - 1; index >= 1; index -= 1) {
      const t = index / (count - 1);
      const curve = Math.sin(t * Math.PI);
      points.push({
        x: event.x + innerWidth * (0.58 + curve * randomBetween(random, 0.16, 0.36)),
        y: bottomBase - event.height * (1 - t) * randomBetween(random, 0.02, 0.1) + randomBetween(random, -24, 28),
      });
    }

    points.push({
      x: event.x - event.width * 0.1,
      y: bottomBase + randomBetween(random, -14, 22),
    });

    return points;
  }

  private createEdge(event: LightLeakEvent) {
    const random = createRandom(Math.floor(event.seed * 2400 + 19));
    const points: Point[] = [];
    const count = 12;

    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);
      points.push({
        x: event.x + event.width * randomBetween(random, 0.02, 0.12),
        y: event.y + event.height * t + randomBetween(random, -18, 18),
      });
    }

    return points;
  }

  private renderWash(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const alpha = (0.038 + event.softness * 0.03) * strength * event.transparency;

    context.save();
    context.globalCompositeOperation = "source-over";
    this.applyEventTransform(context, event, 0.36);
    pathIrregularLoop(context, event.wash);

    const gradient = context.createLinearGradient(event.x, event.y, event.x + event.width * 1.25, event.y);
    gradient.addColorStop(0, rgba(event.colors.mid, alpha * 1.35));
    gradient.addColorStop(0.22, rgba(event.colors.edge, alpha * 0.78));
    gradient.addColorStop(0.72, rgba(event.colors.mid, alpha * 0.18));
    gradient.addColorStop(1, rgba(event.colors.mid, 0));

    context.fillStyle = gradient;
    context.fill();
    context.restore();
  }

  private renderCore(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const alpha = (0.074 + event.intensity * 0.074) * strength * event.transparency;

    context.save();
    context.globalCompositeOperation = "screen";
    this.applyEventTransform(context, event, 0.72);
    pathIrregularLoop(context, event.body);

    const gradient = context.createLinearGradient(event.x, event.y, event.x + event.width, event.y);
    gradient.addColorStop(0, rgba(event.colors.core, alpha * 0.82));
    gradient.addColorStop(0.16, rgba(event.colors.mid, alpha));
    gradient.addColorStop(0.48, rgba(event.colors.edge, alpha * 0.36));
    gradient.addColorStop(0.82, rgba(event.colors.edge, alpha * 0.08));
    gradient.addColorStop(1, rgba(event.colors.mid, 0));

    context.fillStyle = gradient;
    context.fill();
    context.restore();
  }

  private renderEdgeBurn(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const random = createRandom(Math.floor(event.seed * 3100));
    const edgeWidth = randomBetween(random, 20, 42);
    const alpha = (0.15 + event.intensity * 0.12) * strength * event.transparency;

    context.save();
    context.globalCompositeOperation = "screen";
    this.applyEventTransform(context, event, 0.18);
    context.beginPath();
    context.moveTo(event.x - edgeWidth * 0.28, event.y - 20);

    for (const point of event.edge) {
      context.lineTo(point.x + randomBetween(random, -2, 3), point.y);
    }

    context.lineTo(event.x - edgeWidth * 0.24, event.y + event.height + 20);
    context.closePath();

    const gradient = context.createLinearGradient(event.x - edgeWidth, event.y, event.x + edgeWidth, event.y);
    gradient.addColorStop(0, rgba(event.colors.core, alpha));
    gradient.addColorStop(0.28, rgba(event.colors.core, alpha * 0.72));
    gradient.addColorStop(0.58, rgba(event.colors.mid, alpha * 0.36));
    gradient.addColorStop(1, rgba(event.colors.mid, 0));

    context.fillStyle = gradient;
    context.fill();
    context.restore();
  }

  private renderContaminationGrain(frame: FilmFrame, event: InternalLightLeakEvent, strength: number) {
    const { context } = frame;
    const random = createRandom(Math.floor(event.seed * 4100 + frame.time * 12));
    const count = 42 + Math.floor((event.width * event.height) / 18000);

    context.save();
    context.globalCompositeOperation = "source-over";
    this.applyEventTransform(context, event, 0.72);
    pathIrregularLoop(context, event.body);
    context.clip();

    for (let index = 0; index < count; index += 1) {
      const x = randomBetween(random, event.x, event.x + event.width * 1.06);
      const y = randomBetween(random, event.y, event.y + event.height);
      const alpha = randomBetween(random, 0.012, 0.04) * strength * event.transparency;

      context.fillStyle = rgba(index % 3 === 0 ? event.colors.core : event.colors.mid, alpha);
      context.fillRect(x, y, randomBetween(random, 0.45, 1.3), randomBetween(random, 0.45, 1.3));
    }

    context.restore();
  }

  private applyEventTransform(
    context: CanvasRenderingContext2D,
    event: LightLeakEvent,
    scale: number,
  ) {
    context.translate(event.x + event.width * scale, event.y + event.height * 0.5);
    context.rotate(event.angle * scale);
    context.translate(-event.x - event.width * scale, -event.y - event.height * 0.5);
  }
}
