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
  private readonly coarse: CoarseGrainParticle[] = [];

  constructor(random: () => number) {
    this.random = random;
  }

  resize(size: FilmSize, reducedMotion: boolean) {
    const target = reducedMotion
      ? Math.min(720, Math.max(220, Math.round((size.width * size.height) / 1800)))
      : Math.min(6500, Math.max(1200, Math.round((size.width * size.height) / 260)));

    this.fine.length = 0;

    for (let index = 0; index < target; index += 1) {
      this.fine.push(this.createFineParticle(size));
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
    const spawnChance = delta * profile.coarseGrainRate * (0.58 + state.contamination * 0.82);

    if (this.random() < spawnChance) {
      const count = this.random() > 0.88 ? 2 : 1;

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
        0.78 +
        Math.sin(particle.x * 0.0052 + particle.phase) * 0.22 +
        Math.cos(particle.y * 0.0044 - particle.phase * 0.7) * 0.18 +
        Math.sin((particle.x + particle.y) * 0.0017 + particle.phase * 1.8) * 0.16;
      const pulse = 0.9 + Math.sin(time * 1.7 + particle.phase) * 0.07;
      const alpha = particle.alpha * Math.max(0.32, densityPatch) * pulse * (0.82 + state.density * 0.5);
      const color = particle.polarity > 0 ? "232, 222, 202" : "6, 5, 4";

      context.fillStyle = rgba(color, alpha);
      context.fillRect(particle.x, particle.y, particle.radius, particle.radius);
    }

    for (const particle of this.coarse) {
      const age = time - particle.bornAt;
      const progress = Math.max(0, Math.min(age / particle.life, 1));
      const life = Math.sin(progress * Math.PI);
      const color = particle.polarity > 0 ? "236, 221, 188" : "4, 3, 2";

      context.fillStyle = rgba(color, particle.alpha * life * (0.58 + state.contamination * 0.38));
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
      alpha: randomBetween(this.random, 0.024, 0.075) * (0.68 + densityBias * 0.6),
      vx: randomBetween(this.random, -2.6, 2.6),
      vy: randomBetween(this.random, -1.6, 1.9),
      phase: this.random() * Math.PI * 2,
      polarity: this.random() > 0.44 ? 1 : -1,
    };
  }

  private createCoarseParticle(frame: FilmFrame): CoarseGrainParticle {
    const cluster = this.random() > 0.6;
    const x = cluster ? frame.width * (0.08 + this.random() * 0.84) : this.random() * frame.width;
    const y = cluster ? frame.height * (0.1 + this.random() * 0.78) : this.random() * frame.height;

    return {
      x,
      y,
      radius: randomBetween(this.random, 0.8, 2.2),
      alpha: randomBetween(this.random, 0.035, 0.13),
      bornAt: frame.time,
      life: randomBetween(this.random, 0.24, 1.45),
      vx: randomBetween(this.random, -2.4, 2.4),
      vy: randomBetween(this.random, -1.2, 1.8),
      polarity: this.random() > 0.56 ? 1 : -1,
    };
  }
}
