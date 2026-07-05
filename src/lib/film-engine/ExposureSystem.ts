import { SCENE_PROFILES } from "./constants";
import type { FilmFrame, FilmScene, FilmState } from "./types";
import { clamp, rgba, smoothstep } from "./utils";

export class ExposureSystem {
  private readonly random: () => number;
  private readonly phases: number[];
  private readonly offsets: number[];

  constructor(random: () => number) {
    this.random = random;
    this.phases = Array.from({ length: 8 }, () => this.random() * 1000);
    this.offsets = Array.from({ length: 5 }, () => this.random() * Math.PI * 2);
  }

  update(time: number, scene: FilmScene): FilmState {
    const profile = SCENE_PROFILES[scene];
    const slowExposure = this.noise(time * 0.13, 0) * 0.62 + this.noise(time * 0.035, 1) * 0.38;
    const tinyGateVariance = this.noise(time * 0.85, 2);
    const contamination = this.noise(time * 0.08, 3);
    const density = this.noise(time * 0.055, 4);
    const instability = this.noise(time * 0.45, 5);

    return {
      time,
      scene,
      exposure: clamp(profile.exposure + slowExposure * 0.018 + tinyGateVariance * 0.004, 0.94, 1.05),
      density: clamp(profile.density + density * 0.08, 0.25, 0.82),
      instability: clamp(profile.instability + instability * 0.1, 0.18, 0.76),
      contamination: clamp(profile.contamination + contamination * 0.1, 0.18, 0.78),
    };
  }

  render(frame: FilmFrame) {
    const { context, width, height, state, time } = frame;
    const exposureLift = (state.exposure - 0.98) * 0.16;
    const warmth = 0.0025 + state.contamination * 0.004 + exposureLift;
    const density = 0.004 + state.density * 0.007;

    context.save();
    context.globalCompositeOperation = "source-over";

    const topShift = Math.sin(time * 0.11 + this.offsets[0]) * width * 0.035;
    const lowShift = Math.cos(time * 0.07 + this.offsets[1]) * width * 0.026;

    context.fillStyle = rgba("255, 228, 184", warmth);
    context.beginPath();
    context.moveTo(-width * 0.05 + topShift, 0);
    context.bezierCurveTo(width * 0.2, height * 0.13, width * 0.72, height * 0.05, width * 1.05, height * 0.2);
    context.lineTo(width * 1.05, height * 0.42);
    context.bezierCurveTo(width * 0.72, height * 0.32, width * 0.3, height * 0.4, -width * 0.05, height * 0.26);
    context.closePath();
    context.fill();

    context.fillStyle = rgba("0, 0, 0", density);
    context.beginPath();
    context.moveTo(-width * 0.06, height * 0.72);
    context.bezierCurveTo(width * 0.2 + lowShift, height * 0.68, width * 0.66, height * 0.86, width * 1.06, height * 0.78);
    context.lineTo(width * 1.06, height * 1.06);
    context.lineTo(-width * 0.06, height * 1.06);
    context.closePath();
    context.fill();

    context.globalAlpha = 0.04 + state.density * 0.026;
    context.strokeStyle = rgba("22, 17, 12", 0.22);
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(width * 0.006, 0);
    context.bezierCurveTo(width * 0.003, height * 0.32, width * 0.012, height * 0.62, width * 0.008, height);
    context.moveTo(width * 0.994, 0);
    context.bezierCurveTo(width * 0.988, height * 0.38, width, height * 0.72, width * 0.99, height);
    context.stroke();

    context.globalAlpha = 0.012 + smoothstep(state.contamination) * 0.012;
    context.fillStyle = rgba("255, 214, 160", 0.22);
    context.fillRect(0, 0, width * 0.012, height);

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
