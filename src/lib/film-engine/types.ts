export type FilmScene =
  | "intro"
  | "title"
  | "copy"
  | "brand-move"
  | "photo-developing"
  | "settled";

export type FilmState = {
  time: number;
  scene: FilmScene;
  exposure: number;
  density: number;
  instability: number;
  contamination: number;
};

export type FilmSize = {
  width: number;
  height: number;
  ratio: number;
};

export type FilmFrame = FilmSize & {
  context: CanvasRenderingContext2D;
  delta: number;
  time: number;
  reducedMotion: boolean;
  state: FilmState;
};

export type FilmEngineOptions = {
  reducedMotion: boolean;
  scene?: FilmScene;
};

export type FilmSceneProfile = {
  exposure: number;
  density: number;
  instability: number;
  contamination: number;
  coarseGrainRate: number;
  scratchRate: number;
  dustRate: number;
  ambientLeakChance: number;
};

export type FineGrainParticle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  polarity: -1 | 1;
};

export type CoarseGrainParticle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  bornAt: number;
  life: number;
  vx: number;
  vy: number;
  polarity: -1 | 1;
};

export type ScratchKind = "flash" | "hairline" | "broken";

export type ScratchSegment = {
  start: number;
  end: number;
};

export type ScratchEvent = {
  id: number;
  x: number;
  y: number;
  length: number;
  width: number;
  opacity: number;
  life: number;
  age: number;
  kind: ScratchKind;
  flicker: number;
  broken: boolean;
  driftX: number;
  seed: number;
  segments: ScratchSegment[];
};

export type LightLeakOrigin =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "corner"
  | "random";

export type LightLeakShape = "band" | "wash" | "burn" | "flare";

export type LightLeakColors = {
  core: string;
  mid: string;
  edge: string;
};

export type LightLeakEvent = {
  id: number;
  startTime: number;
  duration: number;
  origin: LightLeakOrigin;
  shape: LightLeakShape;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  intensity: number;
  softness: number;
  transparency: number;
  colors: LightLeakColors;
  seed: number;
};

export type Point = {
  x: number;
  y: number;
};
