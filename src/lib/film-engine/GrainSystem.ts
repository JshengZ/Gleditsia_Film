import { SCENE_PROFILES } from "./constants";
import type {
  CoarseGrainParticle,
  FilmFrame,
  FilmSize,
  FineGrainParticle,
} from "./types";
import { randomBetween, rgba } from "./utils";

export class GrainSystem {
  private readonly random: () => number;
  private readonly fine: FineGrainParticle[] = [];
  private readonly medium: FineGrainParticle[] = [];
  private readonly coarse: CoarseGrainParticle[] = [];

  constructor(random: () => number) {
    this.random = random;
  }

  resize(size: FilmSize, reducedMotion: boolean) {
    const target = reducedMotion
      ? Math.min(900, Math.max(280, Math.round((size.width * size.height) / 1500)))
      : Math.min(9000, Math.max(2200, Math.round((size.width * size.height) / 210)));
    const mediumTarget = reducedMotion
      ? Math.min(160, Math.max(70, Math.round((size.width * size.height) / 7200)))
      : Math.min(1300, Math.max(420, Math.round((size.width * size.height) / 1450)));

    this.fine.length = 0;
    this.medium.length = 0;

    for (let index = 0; index < target; index += 1) {
      this.fine.push(this.createFineParticle(size));
    }

    for (let index = 0; index < mediumTarget; index += 1) {
      this.medium.push(this.createMediumParticle(size));
    }

    this.coarse.length = 0;
  }

  update(frame: FilmFrame) {
    const { width, height, delta, state, reducedMotion, time } = frame;
    const driftScale = reducedMotion ? 0.12 : 1;

    for (const particle of this.fine) {
      const turbulence = Math.sin(time * 1.7 + particle.phase) * 0.18 * state.instability;
      particle.x += (particle.vx + turbulence) * delta * driftScale;
      particle.y += (particle.vy + Math.cos(time * 1.3 + particle.phase) * 0.12) * delta * driftScale;

      if (particle.x < -4) particle.x = width + this.random() * 4;
      if (particle.x > width + 4) particle.x = -this.random() * 4;
      if (particle.y < -4) particle.y = height + this.random() * 4;
      if (particle.y > height + 4) particle.y = -this.random() * 4;
    }

    for (const particle of this.medium) {
      const turbulence = Math.sin(time * 1.15 + particle.phase) * 0.28 * state.instability;
      particle.x += (particle.vx + turbulence) * delta * driftScale;
      particle.y += (particle.vy + Math.cos(time * 0.86 + particle.phase) * 0.18) * delta * driftScale;

      if (particle.x < -6) particle.x = width + this.random() * 6;
      if (particle.x > width + 6) particle.x = -this.random() * 6;
      if (particle.y < -6) particle.y = height + this.random() * 6;
      if (particle.y > height + 6) particle.y = -this.random() * 6;
    }

    for (let index = this.coarse.length - 1; index >= 0; index -= 1) {
      const particle = this.coarse[index];
      const age = time - particle.bornAt;

      if (age >= particle.life) {
        this.coarse.splice(index, 1);
        continue;
      }

      particle.x += particle.vx * delta * driftScale;
      particle.y += particle.vy * delta * driftScale;
    }

    if (reducedMotion) {
      return;
    }

    const profile = SCENE_PROFILES[state.scene];
    const spawnChance = delta * profile.coarseGrainRate * (0.82 + state.contamination * 1.05);

    if (this.random() < spawnChance) {
      const count = this.random() > 0.76 ? 2 + Math.floor(this.random() * 2) : 1;

      for (let index = 0; index < count; index += 1) {
        this.coarse.push(this.createCoarseParticle(frame));
      }
    }
  }

  render(frame: FilmFrame) {
    const { context, state, time } = frame;

    context.save();
    context.globalCompositeOperation = "source-over";

    for (const particle of this.fine) {
      const densityPatch =
        0.86 +
        Math.sin(particle.x * 0.0052 + particle.phase) * 0.24 +
        Math.cos(particle.y * 0.0044 - particle.phase * 0.7) * 0.2 +
        Math.sin((particle.x + particle.y) * 0.0017 + particle.phase * 1.8) * 0.18;
      const pulse = 0.92 + Math.sin(time * 1.7 + particle.phase) * 0.075;
      const alpha = particle.alpha * Math.max(0.34, densityPatch) * pulse * (0.96 + state.density * 0.58);
      const color = particle.polarity > 0 ? "235, 224, 202" : "5, 4, 3";

      context.fillStyle = rgba(color, alpha);
      context.fillRect(particle.x, particle.y, particle.radius, particle.radius);
    }

    for (const particle of this.medium) {
      const densityPatch =
        0.7 +
        Math.sin(particle.x * 0.0078 + particle.phase) * 0.26 +
        Math.cos(particle.y * 0.0068 - particle.phase) * 0.22;
      const pulse = 0.86 + Math.sin(time * 1.18 + particle.phase) * 0.1;
      const alpha = particle.alpha * Math.max(0.22, densityPatch) * pulse * (0.78 + state.density * 0.54);
      const color = particle.polarity > 0 ? "229, 211, 177" : "8, 6, 4";

      context.fillStyle = rgba(color, alpha);
      context.fillRect(particle.x, particle.y, particle.radius, particle.radius * (0.8 + (particle.phase % 0.45)));
    }

    for (const particle of this.coarse) {
      const age = time - particle.bornAt;
      const progress = Math.max(0, Math.min(age / particle.life, 1));
      const life = Math.sin(progress * Math.PI);
      const color = particle.polarity > 0 ? "236, 221, 188" : "4, 3, 2";

      context.fillStyle = rgba(color, particle.alpha * life * (0.68 + state.contamination * 0.48));
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
      radius: randomBetween(this.random, 0.46, 1.12),
      alpha: randomBetween(this.random, 0.03, 0.092) * (0.74 + densityBias * 0.66),
      vx: randomBetween(this.random, -2.6, 2.6),
      vy: randomBetween(this.random, -1.6, 1.9),
      phase: this.random() * Math.PI * 2,
      polarity: this.random() > 0.44 ? 1 : -1,
    };
  }

  private createMediumParticle(size: FilmSize): FineGrainParticle {
    const densityBias = this.random() ** 1.45;
    const x = this.random() * size.width;
    const y = this.random() * size.height;

    return {
      x,
      y,
      radius: randomBetween(this.random, 1.05, 2.35),
      alpha: randomBetween(this.random, 0.022, 0.066) * (0.68 + densityBias * 0.72),
      vx: randomBetween(this.random, -1.8, 1.8),
      vy: randomBetween(this.random, -1.1, 1.35),
      phase: this.random() * Math.PI * 2,
      polarity: this.random() > 0.34 ? 1 : -1,
    };
  }

  private createCoarseParticle(frame: FilmFrame): CoarseGrainParticle {
    const cluster = this.random() > 0.6;
    const x = cluster ? frame.width * (0.08 + this.random() * 0.84) : this.random() * frame.width;
    const y = cluster ? frame.height * (0.1 + this.random() * 0.78) : this.random() * frame.height;

    return {
      x,
      y,
      radius: randomBetween(this.random, 1.1, 2.85),
      alpha: randomBetween(this.random, 0.045, 0.155),
      bornAt: frame.time,
      life: randomBetween(this.random, 0.38, 1.85),
      vx: randomBetween(this.random, -2.4, 2.4),
      vy: randomBetween(this.random, -1.2, 1.8),
      polarity: this.random() > 0.56 ? 1 : -1,
    };
  }
}
