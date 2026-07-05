import { SCENE_PROFILES } from "./constants";
import type { FilmFrame } from "./types";
import { randomBetween, rgba } from "./utils";

type DustMote = {
  id: number;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  life: number;
  age: number;
  vx: number;
  vy: number;
  seed: number;
};

export class DustSystem {
  private readonly random: () => number;
  private readonly motes: DustMote[] = [];
  private nextId = 1;

  constructor(random: () => number) {
    this.random = random;
  }

  resize() {
    this.motes.length = 0;
  }

  update(frame: FilmFrame) {
    const { delta, state, reducedMotion } = frame;

    for (let index = this.motes.length - 1; index >= 0; index -= 1) {
      const mote = this.motes[index];
      mote.age += delta;
      mote.x += mote.vx * delta;
      mote.y += mote.vy * delta;

      if (mote.age > mote.life) {
        this.motes.splice(index, 1);
      }
    }

    if (reducedMotion) {
      return;
    }

    const profile = SCENE_PROFILES[state.scene];
    const spawnChance = delta * profile.dustRate * (0.65 + state.contamination * 0.75);

    if (this.random() < spawnChance) {
      this.motes.push(this.createDust(frame));
    }
  }

  render(frame: FilmFrame) {
    const { context } = frame;

    context.save();
    context.globalCompositeOperation = "source-over";

    for (const mote of this.motes) {
      const progress = Math.max(0, Math.min(mote.age / mote.life, 1));
      const life = Math.sin(progress * Math.PI);

      context.fillStyle = rgba("230, 220, 196", mote.alpha * life);
      context.beginPath();
      context.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  private createDust(frame: FilmFrame): DustMote {
    return {
      id: this.nextId++,
      x: this.random() * frame.width,
      y: this.random() * frame.height,
      radius: randomBetween(this.random, 0.6, 1.8),
      alpha: randomBetween(this.random, 0.018, 0.052),
      life: randomBetween(this.random, 0.38, 1.9),
      age: 0,
      vx: randomBetween(this.random, -1.4, 1.4),
      vy: randomBetween(this.random, -0.6, 1.2),
      seed: this.random() * Math.PI * 2,
    };
  }
}
