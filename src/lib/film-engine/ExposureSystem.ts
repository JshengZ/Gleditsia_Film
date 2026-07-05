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
    const edgeAlpha = 0.012 + state.density * 0.018;
    const edgeDrift = Math.sin(time * 0.09 + this.offsets[0]) * 0.55;

    context.save();
    context.globalCompositeOperation = "source-over";
    context.lineCap = "butt";

    context.globalAlpha = 1;
    context.strokeStyle = rgba("18, 13, 9", edgeAlpha);
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(width * 0.006 + edgeDrift, 0);
    context.lineTo(width * 0.008 - edgeDrift * 0.4, height);
    context.moveTo(width * 0.992 - edgeDrift * 0.5, 0);
    context.lineTo(width * 0.99 + edgeDrift * 0.25, height);
    context.stroke();

    context.fillStyle = rgba("255, 214, 160", 0.003 + smoothstep(state.contamination) * 0.003);
    context.fillRect(0, 0, Math.max(1, width * 0.006), height);
    context.fillStyle = rgba("0, 0, 0", 0.006 + state.density * 0.006);
    context.fillRect(width - Math.max(1, width * 0.008), 0, Math.max(1, width * 0.008), height);

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
