# Gleditsia Film

First Part prototype for the Gleditsia personal photography homepage.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Home Photos

Temporary quiet SVG placeholders live in `public/photos/home/`.

When the real photographs are ready, replace those files or update `src/data/homePhotos.ts`.

`UI_design/` is only a visual reference folder and should not be used as final homepage photo content.

## Key Files

- `src/components/homepage/HomeIntro.tsx`
- `src/data/homePhotos.ts`
- `src/lib/photoLayout.ts`
- `scripts/generate-placeholder-photos.mjs`

## Checks

```bash
npm run lint
npm run build
```
