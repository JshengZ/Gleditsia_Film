import { CanvasFilmOverlay } from "./CanvasFilmOverlay";

type FilmOverlayProps = {
  lightLeakTriggerKey: number;
};

export function FilmOverlay({ lightLeakTriggerKey }: FilmOverlayProps) {
  return <CanvasFilmOverlay lightLeakTriggerKey={lightLeakTriggerKey} />;
}
