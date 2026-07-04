import { forwardRef } from "react";

export const ScrollCue = forwardRef<HTMLDivElement>(function ScrollCue(_, ref) {
  return (
    <div ref={ref} className="scroll-cue" aria-hidden="true">
      <span>SCROLL</span>
    </div>
  );
});

