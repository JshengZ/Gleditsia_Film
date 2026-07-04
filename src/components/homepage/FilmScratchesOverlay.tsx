import type { CSSProperties } from "react";

const persistentScratches = [
  { id: "p1", x: 18, top: 8, h: 54, strength: 0.8, delay: -0.4, duration: 4.8 },
  { id: "p2", x: 63, top: 19, h: 48, strength: 0.58, delay: -2.1, duration: 6.4 },
  { id: "p3", x: 84, top: 4, h: 72, strength: 0.46, delay: -3.3, duration: 7.8 },
];

const burstScratches = [
  { id: "b1", x: 29, top: 12, h: 46, strength: 0.82, delay: -2.6, duration: 9.5 },
  { id: "b2", x: 72, top: 34, h: 34, strength: 0.64, delay: -6.8, duration: 12 },
];

export function FilmScratchesOverlay() {
  return (
    <div className="film-scratches-overlay" aria-hidden="true">
      {persistentScratches.map((scratch) => (
        <span
          key={scratch.id}
          className="film-scratch"
          style={{
            "--scratch-x": `${scratch.x}%`,
            "--scratch-top": `${scratch.top}%`,
            "--scratch-h": `${scratch.h}%`,
            "--scratch-strength": `${scratch.strength}`,
            "--scratch-delay": `${scratch.delay}s`,
            "--scratch-duration": `${scratch.duration}s`,
          } as CSSProperties}
        />
      ))}
      {burstScratches.map((scratch) => (
        <span
          key={scratch.id}
          className="film-scratch-burst"
          style={{
            "--scratch-x": `${scratch.x}%`,
            "--scratch-top": `${scratch.top}%`,
            "--scratch-h": `${scratch.h}%`,
            "--scratch-strength": `${scratch.strength}`,
            "--scratch-delay": `${scratch.delay}s`,
            "--scratch-duration": `${scratch.duration}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
