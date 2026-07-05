"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FilmEngine } from "@/lib/film-engine/FilmEngine";
import type { FilmScene } from "@/lib/film-engine/types";

type CanvasFilmOverlayProps = {
  lightLeakTriggerKey: number;
  scene: FilmScene;
};

export function CanvasFilmOverlay({ lightLeakTriggerKey, scene }: CanvasFilmOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FilmEngine | null>(null);
  const sceneRef = useRef<FilmScene>(scene);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    sceneRef.current = scene;
    engineRef.current?.setScene(scene);
  }, [scene]);

  useEffect(() => {
    if (lightLeakTriggerKey === 0) {
      return;
    }

    engineRef.current?.triggerLightLeak(performance.now());
  }, [lightLeakTriggerKey]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const engine = new FilmEngine(context, {
      reducedMotion,
      scene: sceneRef.current,
    });
    engineRef.current = engine;

    let animationFrame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      engine.resize({ width, height, ratio });
    };

    const drawFrame = (time: number) => {
      engine.render(time);
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    resize();
    drawFrame(performance.now());
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);

      if (engineRef.current === engine) {
        engineRef.current = null;
      }
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="canvas-film-overlay" aria-hidden="true" />;
}
