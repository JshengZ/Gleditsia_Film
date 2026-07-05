import { DustSystem } from "./DustSystem";
import { ExposureSystem } from "./ExposureSystem";
import { GrainSystem } from "./GrainSystem";
import { LightLeakSystem } from "./LightLeakSystem";
import { ScratchSystem } from "./ScratchSystem";
import type { FilmEngineOptions, FilmFrame, FilmScene, FilmSize, FilmState } from "./types";
import { createRandom, createSessionSeed } from "./utils";

export class FilmEngine {
  private readonly context: CanvasRenderingContext2D;
  private readonly exposure: ExposureSystem;
  private readonly grain: GrainSystem;
  private readonly scratches: ScratchSystem;
  private readonly dust: DustSystem;
  private readonly lightLeaks: LightLeakSystem;
  private readonly reducedMotion: boolean;
  private scene: FilmScene;
  private state: FilmState = {
    time: 0,
    scene: "intro",
    exposure: 1,
    density: 0.5,
    instability: 0.35,
    contamination: 0.35,
  };
  private size: FilmSize = { width: 0, height: 0, ratio: 1 };
  private lastTime = 0;

  constructor(context: CanvasRenderingContext2D, options: FilmEngineOptions) {
    const random = createRandom(createSessionSeed());

    this.context = context;
    this.reducedMotion = options.reducedMotion;
    this.scene = options.scene ?? "intro";
    this.exposure = new ExposureSystem(random);
    this.grain = new GrainSystem(random);
    this.scratches = new ScratchSystem(random);
    this.dust = new DustSystem(random);
    this.lightLeaks = new LightLeakSystem(random);
  }

  setScene(scene: FilmScene) {
    this.scene = scene;
  }

  resize(size: FilmSize) {
    this.size = size;
    this.grain.resize(size, this.reducedMotion);
    this.scratches.resize();
    this.dust.resize();
    this.lightLeaks.resize(size);
  }

  triggerLightLeak(timeMs: number) {
    this.lightLeaks.trigger(timeMs / 1000, this.size, this.reducedMotion, this.scene);
  }

  render(timeMs: number) {
    const time = timeMs / 1000;
    const delta = this.lastTime === 0 ? 1 / 60 : Math.min(0.08, time - this.lastTime);
    this.lastTime = time;
    this.state = this.exposure.update(time, this.scene);

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
    this.dust.update(frame);
    this.dust.render(frame);
    this.scratches.update(frame);
    this.scratches.render(frame);
    this.lightLeaks.update(frame);
    this.lightLeaks.render(frame);
  }
}
