import { CanvasFilmOverlay } from "./CanvasFilmOverlay";
import type { FilmScene } from "@/lib/film-engine/types";

type FilmOverlayProps = {
  lightLeakTriggerKey: number;
  scene: FilmScene;
};

export function FilmOverlay({ lightLeakTriggerKey, scene }: FilmOverlayProps) {
  return <CanvasFilmOverlay lightLeakTriggerKey={lightLeakTriggerKey} scene={scene} />;
}
