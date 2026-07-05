import { SCENE_PROFILES } from "./constants";
import type { FilmFrame, FilmSize, ScratchEvent, ScratchKind, ScratchSegment } from "./types";
import { randomBetween, rgba } from "./utils";

type ReelLineEvent = {
  id: number;
  x: number;
  opacity: number;
  width: number;
  age: number;
  life: number;
  drift: number;
  seed: number;
  segments: ScratchSegment[];
};

export class ScratchSystem {
  private readonly random: () => number;
  private readonly events: ScratchEvent[] = [];
  private readonly reelLines: ReelLineEvent[] = [];
  private nextId = 1;

  constructor(random: () => number) {
    this.random = random;
  }

  resize(size?: FilmSize) {
    this.events.length = 0;
    this.reelLines.length = 0;

    if (size) {
      this.createReelLines(size);
    }
  }

  update(frame: FilmFrame) {
    const { delta, reducedMotion, state } = frame;

    for (let index = this.events.length - 1; index >= 0; index -= 1) {
      const event = this.events[index];
      event.age += delta;

      if (event.age > event.life) {
        this.events.splice(index, 1);
      }
    }

    for (const line of this.reelLines) {
      line.age += delta;

      if (line.age > line.life) {
        line.age = 0;
        line.x += randomBetween(this.random, -8, 8);
        line.opacity = randomBetween(this.random, 0.018, 0.045);
        line.segments = this.createSegments(true);
      }
    }

    if (reducedMotion) {
      return;
    }

    const profile = SCENE_PROFILES[state.scene];
    const spawnChance = delta * profile.scratchRate * (0.7 + state.instability * 0.6 + state.contamination * 0.32);

    if (this.random() < spawnChance) {
      this.events.push(this.createScratch(frame));
    }
  }

  render(frame: FilmFrame) {
    const { context, time } = frame;

    context.save();
    context.lineCap = "round";
    context.globalCompositeOperation = "source-over";

    for (const line of this.reelLines) {
      const drift = Math.sin(time * 0.72 + line.seed) * line.drift;
      const pulse = 0.72 + Math.sin(time * 2.1 + line.seed) * 0.24;
      const x = line.x + drift;

      context.lineWidth = line.width;
      context.strokeStyle = rgba("222, 210, 184", line.opacity * pulse);

      for (const segment of line.segments) {
        context.beginPath();
        context.moveTo(x, frame.height * segment.start);
        context.lineTo(x + Math.sin(segment.end * 6 + line.seed) * 0.28, frame.height * segment.end);
        context.stroke();
      }
    }

    for (const event of this.events) {
      const progress = Math.max(0, Math.min(event.age / event.life, 1));
      const blink = Math.sin((time + event.seed) * event.flicker * 38) > -0.16 ? 1 : 0.2;
      const life = Math.sin(progress * Math.PI);
      const opacity = event.opacity * life * blink;
      const x = event.x + Math.sin(event.age * 4.2 + event.seed) * event.driftX;

      context.lineWidth = event.width;
      context.strokeStyle = rgba(event.kind === "flash" ? "238, 228, 204" : "220, 210, 190", opacity);

      if (event.broken) {
        for (const segment of event.segments) {
          const y0 = event.y + event.length * segment.start;
          const y1 = event.y + event.length * segment.end;
          context.beginPath();
          context.moveTo(x + Math.sin(segment.start * 9 + event.seed) * 0.42, y0);
          context.lineTo(x + Math.sin(segment.end * 9 + event.seed) * 0.42, y1);
          context.stroke();
        }
      } else {
        context.beginPath();
        context.moveTo(x, event.y);
        context.lineTo(x + Math.sin(event.age + event.seed) * 0.45, event.y + event.length);
        context.stroke();
      }
    }

    context.restore();
  }

  private createScratch(frame: FilmFrame): ScratchEvent {
    const kind = this.pickKind();
    const isFlash = kind === "flash";
    const broken = kind === "broken" || this.random() > 0.66;
    const length = randomBetween(
      this.random,
      frame.height * (isFlash ? 0.08 : 0.18),
      frame.height * (kind === "hairline" ? 0.88 : 0.62),
    );
    const y = randomBetween(this.random, -frame.height * 0.06, frame.height - length * 0.45);
    const segments = this.createSegments(broken);

    return {
      id: this.nextId++,
      x: randomBetween(this.random, frame.width * -0.02, frame.width * 1.02),
      y,
      length,
      width: randomBetween(this.random, 0.35, isFlash ? 0.85 : 1.05),
      opacity: randomBetween(this.random, 0.018, isFlash ? 0.1 : 0.065),
      life: isFlash ? randomBetween(this.random, 2 / 60, 6 / 60) : randomBetween(this.random, 0.4, 1.2),
      age: 0,
      kind,
      flicker: randomBetween(this.random, 0.5, 1.8),
      broken,
      driftX: randomBetween(this.random, 0.16, 0.9),
      seed: this.random() * Math.PI * 2,
      segments,
    };
  }

  private createReelLines(size: FilmSize) {
    const count = size.width < 760 ? 1 : 2;
    const anchors = count === 1 ? [0.22] : [0.18, 0.74];

    for (const anchor of anchors) {
      this.reelLines.push({
        id: this.nextId++,
        x: size.width * anchor + randomBetween(this.random, -14, 14),
        opacity: randomBetween(this.random, 0.018, 0.044),
        width: randomBetween(this.random, 0.45, 0.85),
        age: this.random() * 2,
        life: randomBetween(this.random, 2.8, 6.4),
        drift: randomBetween(this.random, 0.22, 0.72),
        seed: this.random() * Math.PI * 2,
        segments: this.createSegments(true),
      });
    }
  }

  private pickKind(): ScratchKind {
    const value = this.random();

    if (value > 0.78) return "flash";
    if (value > 0.46) return "broken";
    return "hairline";
  }

  private createSegments(broken: boolean): ScratchSegment[] {
    if (!broken) {
      return [{ start: 0, end: 1 }];
    }

    const segmentCount = 2 + Math.floor(this.random() * 4);

    return Array.from({ length: segmentCount }, () => {
      const start = this.random() * 0.82;
      const span = randomBetween(this.random, 0.04, 0.2);

      return { start, end: Math.min(1, start + span) };
    }).sort((a, b) => a.start - b.start);
  }
}
