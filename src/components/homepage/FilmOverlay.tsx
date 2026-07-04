import { FilmGrainOverlay } from "./FilmGrainOverlay";
import { FilmScratchesOverlay } from "./FilmScratchesOverlay";
import { FilmFlickerOverlay } from "./FilmFlickerOverlay";
import { FilmGateWeaveLayer } from "./FilmGateWeaveLayer";
import { FilmLightLeakBurst } from "./FilmLightLeakBurst";

type FilmOverlayProps = {
  lightLeakTriggerKey: number;
};

export function FilmOverlay({ lightLeakTriggerKey }: FilmOverlayProps) {
  return (
    <>
      <div className="film-density-layer" aria-hidden="true" />
      <FilmGateWeaveLayer />
      <FilmFlickerOverlay />
      <FilmGrainOverlay />
      <FilmScratchesOverlay />
      <div className="film-chemical-overlay" aria-hidden="true" />
      <FilmLightLeakBurst triggerKey={lightLeakTriggerKey} />
    </>
  );
}
