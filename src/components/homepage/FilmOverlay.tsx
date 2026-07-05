import { CanvasFilmOverlay } from "./CanvasFilmOverlay";
import type { FilmLightLeakRequest, FilmScene } from "@/lib/film-engine/types";

type FilmOverlayProps = {
  lightLeakRequest: FilmLightLeakRequest | null;
  scene: FilmScene;
};

export function FilmOverlay({ lightLeakRequest, scene }: FilmOverlayProps) {
  return <CanvasFilmOverlay lightLeakRequest={lightLeakRequest} scene={scene} />;
}
