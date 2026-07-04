type Rgb = {
  r: number;
  g: number;
  b: number;
};

function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace("#", "").trim();

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: Rgb) {
  const nextR = r / 255;
  const nextG = g / 255;
  const nextB = b / 255;
  const max = Math.max(nextR, nextG, nextB);
  const min = Math.min(nextR, nextG, nextB);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min);

    switch (max) {
      case nextR:
        hue = (nextG - nextB) / delta + (nextG < nextB ? 6 : 0);
        break;
      case nextG:
        hue = (nextB - nextR) / delta + 2;
        break;
      default:
        hue = (nextR - nextG) / delta + 4;
        break;
    }

    hue /= 6;
  }

  return {
    h: Math.round(hue * 360),
    s: saturation,
    l: lightness,
  };
}

export function muteColor(hex: string, alpha = 1) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return `hsla(28, 14%, 9%, ${alpha})`;
  }

  const hsl = rgbToHsl(rgb);
  const saturation = Math.round(Math.min(hsl.s * 34, 18));
  const lightness = Math.round(Math.min(Math.max(hsl.l * 28, 6), 15));

  return `hsla(${hsl.h}, ${saturation}%, ${lightness}%, ${alpha})`;
}

