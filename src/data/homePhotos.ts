export type HomePhotoKind = "landscape" | "portrait" | "square";

export type HomePhotoTone =
  | "bw"
  | "warm"
  | "cool"
  | "neutral"
  | "green"
  | "brown";

export type HomePhotoPriority = "hero" | "supporting" | "ambient";

export type HomePhoto = {
  id: string;
  src: string;
  alt: string;
  kind: HomePhotoKind;
  tone: HomePhotoTone;
  priority: HomePhotoPriority;
  placeholderType:
    | "black-and-white"
    | "street"
    | "landscape"
    | "portrait"
    | "still-life"
    | "architecture"
    | "quiet-mood";
};

export const INTRO_LINES = [
  "A quiet archive of light,",
  "time, and passing traces.",
  "Every frame remembers.",
];

export const homePhotos: HomePhoto[] = [
  {
    id: "home-01",
    src: "/photos/home/01.svg",
    alt: "Placeholder black and white portrait in a quiet room",
    kind: "landscape",
    tone: "bw",
    priority: "hero",
    placeholderType: "black-and-white",
  },
  {
    id: "home-02",
    src: "/photos/home/02.svg",
    alt: "Placeholder window still life photograph",
    kind: "portrait",
    tone: "neutral",
    priority: "supporting",
    placeholderType: "still-life",
  },
  {
    id: "home-03",
    src: "/photos/home/03.svg",
    alt: "Placeholder dark lake horizon photograph",
    kind: "landscape",
    tone: "warm",
    priority: "supporting",
    placeholderType: "landscape",
  },
  {
    id: "home-04",
    src: "/photos/home/04.svg",
    alt: "Placeholder low key portrait photograph",
    kind: "portrait",
    tone: "bw",
    priority: "supporting",
    placeholderType: "portrait",
  },
  {
    id: "home-05",
    src: "/photos/home/05.svg",
    alt: "Placeholder rainy street scene photograph",
    kind: "landscape",
    tone: "cool",
    priority: "supporting",
    placeholderType: "street",
  },
  {
    id: "home-06",
    src: "/photos/home/06.svg",
    alt: "Placeholder plant still life photograph",
    kind: "portrait",
    tone: "brown",
    priority: "supporting",
    placeholderType: "still-life",
  },
  {
    id: "home-07",
    src: "/photos/home/07.svg",
    alt: "Placeholder city building photograph",
    kind: "portrait",
    tone: "bw",
    priority: "ambient",
    placeholderType: "architecture",
  },
  {
    id: "home-08",
    src: "/photos/home/08.svg",
    alt: "Placeholder tree shadow and plant photograph",
    kind: "portrait",
    tone: "green",
    priority: "ambient",
    placeholderType: "quiet-mood",
  },
  {
    id: "home-09",
    src: "/photos/home/09.svg",
    alt: "Placeholder wind portrait photograph",
    kind: "portrait",
    tone: "neutral",
    priority: "hero",
    placeholderType: "portrait",
  },
  {
    id: "home-10",
    src: "/photos/home/10.svg",
    alt: "Placeholder sea horizon photograph",
    kind: "landscape",
    tone: "cool",
    priority: "hero",
    placeholderType: "landscape",
  },
  {
    id: "home-11",
    src: "/photos/home/11.svg",
    alt: "Placeholder interior window light photograph",
    kind: "square",
    tone: "bw",
    priority: "ambient",
    placeholderType: "quiet-mood",
  },
  {
    id: "home-12",
    src: "/photos/home/12.svg",
    alt: "Placeholder distant mountain and field photograph",
    kind: "landscape",
    tone: "brown",
    priority: "ambient",
    placeholderType: "landscape",
  },
  {
    id: "home-13",
    src: "/photos/home/13.svg",
    alt: "Placeholder plaster wall architecture photograph",
    kind: "portrait",
    tone: "warm",
    priority: "supporting",
    placeholderType: "architecture",
  },
  {
    id: "home-14",
    src: "/photos/home/14.svg",
    alt: "Placeholder shoreline detail photograph",
    kind: "square",
    tone: "cool",
    priority: "ambient",
    placeholderType: "quiet-mood",
  },
  {
    id: "home-15",
    src: "/photos/home/15.svg",
    alt: "Placeholder interior chair and light photograph",
    kind: "portrait",
    tone: "neutral",
    priority: "ambient",
    placeholderType: "still-life",
  },
  {
    id: "home-16",
    src: "/photos/home/16.svg",
    alt: "Placeholder narrow alley photograph",
    kind: "portrait",
    tone: "warm",
    priority: "supporting",
    placeholderType: "architecture",
  },
  {
    id: "home-17",
    src: "/photos/home/17.svg",
    alt: "Placeholder fog river photograph",
    kind: "landscape",
    tone: "green",
    priority: "ambient",
    placeholderType: "quiet-mood",
  },
  {
    id: "home-18",
    src: "/photos/home/18.svg",
    alt: "Placeholder table and glass photograph",
    kind: "landscape",
    tone: "brown",
    priority: "ambient",
    placeholderType: "still-life",
  },
];
