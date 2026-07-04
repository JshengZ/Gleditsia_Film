export function FilmGrainOverlay() {
  return (
    <div className="film-grain-overlay" aria-hidden="true">
      <span className="film-grain-overlay__field film-grain-overlay__field--coarse" />
      <span className="film-grain-overlay__field film-grain-overlay__field--fine" />
      <span className="film-grain-overlay__field film-grain-overlay__field--dust" />
    </div>
  );
}
