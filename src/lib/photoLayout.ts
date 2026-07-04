export type MosaicLayoutItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  rotate: number;
  z: number;
};

export type ResponsiveMosaicLayout = {
  desktop: MosaicLayoutItem;
  tablet?: MosaicLayoutItem;
  mobile?: MosaicLayoutItem;
};

export const desktopMosaicLayout: MosaicLayoutItem[] = [
  { id: "home-01", x: 6.0, y: 14.0, w: 28.0, rotate: -1.15, z: 5 },
  { id: "home-02", x: 23.4, y: 29.0, w: 13.0, rotate: 0.76, z: 8 },
  { id: "home-03", x: 37.8, y: 7.4, w: 19.5, rotate: -0.34, z: 3 },
  { id: "home-04", x: 56.5, y: 8.8, w: 15.2, rotate: 0.48, z: 7 },
  { id: "home-05", x: 67.2, y: 17.2, w: 25.8, rotate: 0.9, z: 5 },
  { id: "home-06", x: 86.2, y: 8.0, w: 11.0, rotate: -0.7, z: 4 },
  { id: "home-07", x: 10.8, y: 41.2, w: 14.4, rotate: 0.88, z: 8 },
  { id: "home-08", x: 30.8, y: 45.0, w: 11.8, rotate: -0.5, z: 6 },
  { id: "home-09", x: 41.0, y: 31.0, w: 19.2, rotate: -0.18, z: 12 },
  { id: "home-10", x: 31.0, y: 19.8, w: 29.2, rotate: 0.26, z: 9 },
  { id: "home-11", x: 57.8, y: 35.4, w: 12.6, rotate: 0.65, z: 13 },
  { id: "home-12", x: 65.4, y: 41.6, w: 20.6, rotate: -0.62, z: 7 },
  { id: "home-13", x: 76.4, y: 53.2, w: 15.2, rotate: 0.48, z: 9 },
  { id: "home-14", x: 88.0, y: 62.0, w: 9.8, rotate: -0.86, z: 4 },
  { id: "home-15", x: 48.8, y: 59.2, w: 11.6, rotate: 0.32, z: 8 },
  { id: "home-16", x: 61.4, y: 62.0, w: 16.4, rotate: -0.24, z: 6 },
  { id: "home-17", x: 29.2, y: 73.6, w: 26.8, rotate: 0.38, z: 5 },
  { id: "home-18", x: 73.2, y: 78.0, w: 17.6, rotate: 0.62, z: 4 },
];

export const tabletMosaicLayout: MosaicLayoutItem[] = [
  { id: "home-01", x: 3.2, y: 12.4, w: 34.0, rotate: -1.05, z: 5 },
  { id: "home-02", x: 28.4, y: 32.0, w: 17.2, rotate: 0.62, z: 7 },
  { id: "home-03", x: 43.6, y: 8.0, w: 26.0, rotate: -0.34, z: 4 },
  { id: "home-04", x: 72.6, y: 11.2, w: 20.0, rotate: 0.34, z: 6 },
  { id: "home-05", x: 57.2, y: 28.0, w: 36.0, rotate: 0.64, z: 5 },
  { id: "home-07", x: 5.2, y: 39.4, w: 19.0, rotate: 0.72, z: 7 },
  { id: "home-08", x: 24.8, y: 46.2, w: 17.2, rotate: -0.46, z: 4 },
  { id: "home-09", x: 39.2, y: 39.2, w: 25.0, rotate: -0.16, z: 10 },
  { id: "home-10", x: 25.4, y: 22.8, w: 37.0, rotate: 0.22, z: 8 },
  { id: "home-12", x: 3.0, y: 68.0, w: 33.5, rotate: 0.62, z: 4 },
  { id: "home-13", x: 67.4, y: 54.8, w: 23.2, rotate: 0.42, z: 8 },
  { id: "home-15", x: 44.8, y: 63.2, w: 17.2, rotate: -0.18, z: 5 },
  { id: "home-16", x: 58.8, y: 70.4, w: 23.0, rotate: 0.24, z: 4 },
  { id: "home-17", x: 24.0, y: 78.0, w: 36.0, rotate: -0.3, z: 3 },
];

export const mobileMosaicLayout: MosaicLayoutItem[] = [
  { id: "home-01", x: -7.0, y: 13.6, w: 55.0, rotate: -1.0, z: 4 },
  { id: "home-03", x: 39.0, y: 9.6, w: 48.0, rotate: 0.55, z: 3 },
  { id: "home-04", x: 63.5, y: 25.0, w: 35.0, rotate: -0.4, z: 5 },
  { id: "home-05", x: 3.5, y: 31.2, w: 56.0, rotate: 0.8, z: 4 },
  { id: "home-09", x: 30.0, y: 42.0, w: 46.0, rotate: -0.15, z: 8 },
  { id: "home-10", x: 9.0, y: 54.0, w: 65.0, rotate: 0.3, z: 6 },
  { id: "home-11", x: 68.0, y: 58.5, w: 30.0, rotate: 0.65, z: 7 },
  { id: "home-13", x: 57.0, y: 70.0, w: 38.0, rotate: -0.5, z: 5 },
  { id: "home-17", x: 7.0, y: 79.0, w: 58.0, rotate: 0.45, z: 3 },
];

const desktopById = new Map(desktopMosaicLayout.map((item) => [item.id, item]));
const tabletById = new Map(tabletMosaicLayout.map((item) => [item.id, item]));
const mobileById = new Map(mobileMosaicLayout.map((item) => [item.id, item]));

export function getMosaicLayout(id: string): ResponsiveMosaicLayout | null {
  const desktop = desktopById.get(id);

  if (!desktop) {
    return null;
  }

  return {
    desktop,
    tablet: tabletById.get(id),
    mobile: mobileById.get(id),
  };
}
