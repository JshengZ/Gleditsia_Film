import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "public", "photos", "home");

const photos = [
  { file: "01.svg", kind: "landscape", motif: "bw-portrait-room", seed: 101, tone: ["#060606", "#25241f", "#ada493"] },
  { file: "02.svg", kind: "portrait", motif: "window-still-life", seed: 102, tone: ["#080706", "#302b23", "#b09973"] },
  { file: "03.svg", kind: "landscape", motif: "lake-horizon", seed: 103, tone: ["#07090a", "#26343a", "#a7aaa0"] },
  { file: "04.svg", kind: "portrait", motif: "side-portrait", seed: 104, tone: ["#050505", "#22211f", "#bdb5a8"] },
  { file: "05.svg", kind: "landscape", motif: "rain-street", seed: 105, tone: ["#070909", "#243238", "#a68262"] },
  { file: "06.svg", kind: "portrait", motif: "plant-still-life", seed: 106, tone: ["#0a0806", "#35281d", "#9d825a"] },
  { file: "07.svg", kind: "portrait", motif: "facade-detail", seed: 107, tone: ["#080807", "#36342e", "#9f9684"] },
  { file: "08.svg", kind: "portrait", motif: "tree-shadow", seed: 108, tone: ["#060807", "#242e24", "#98936e"] },
  { file: "09.svg", kind: "portrait", motif: "wind-portrait", seed: 109, tone: ["#080807", "#332f29", "#b0a188"] },
  { file: "10.svg", kind: "landscape", motif: "sea-rock", seed: 110, tone: ["#07090a", "#324247", "#aaa498"] },
  { file: "11.svg", kind: "square", motif: "interior-window", seed: 111, tone: ["#070706", "#2d2b26", "#ad9b76"] },
  { file: "12.svg", kind: "landscape", motif: "distant-field", seed: 112, tone: ["#0a0806", "#473923", "#a88c64"] },
  { file: "13.svg", kind: "portrait", motif: "plaster-passage", seed: 113, tone: ["#0b0806", "#5f4932", "#b79a70"] },
  { file: "14.svg", kind: "square", motif: "shore-detail", seed: 114, tone: ["#07090a", "#303d43", "#9f998e"] },
  { file: "15.svg", kind: "portrait", motif: "chair-light", seed: 115, tone: ["#080706", "#2f2b24", "#af986e"] },
  { file: "16.svg", kind: "portrait", motif: "narrow-alley", seed: 116, tone: ["#070604", "#51402f", "#b39970"] },
  { file: "17.svg", kind: "landscape", motif: "fog-river", seed: 117, tone: ["#070908", "#38423b", "#aaa596"] },
  { file: "18.svg", kind: "landscape", motif: "table-glass", seed: 118, tone: ["#0a0705", "#3d2c22", "#aa8e6d"] },
];

const sizes = {
  landscape: [1600, 1000],
  portrait: [1000, 1320],
  square: [1200, 1200],
};

function n(value) {
  return Number.parseFloat(value.toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function liftSubjectOpacity(svg, amount = 1.36) {
  return svg.replace(/opacity="([0-9.]+)"/g, (_match, value) => {
    const lifted = clamp(Number.parseFloat(value) * amount, 0, 0.68);
    return `opacity="${n(lifted)}"`;
  });
}

function dust(seed, width, height) {
  const dots = [];

  for (let index = 0; index < 110; index += 1) {
    const x = (seed * 127 + index * 211) % width;
    const y = (seed * 163 + index * 181) % height;
    const radius = 0.35 + ((seed + index) % 4) * 0.22;
    const opacity = 0.012 + ((seed + index) % 5) * 0.006;
    dots.push(
      `<circle cx="${x}" cy="${y}" r="${n(radius)}" fill="#efe2c6" opacity="${n(opacity)}"/>`,
    );
  }

  return dots.join("");
}

function scratches(seed, width, height) {
  return Array.from({ length: 4 }, (_, index) => {
    const x = Math.round(((seed * (index + 7) * 31) % width) * 0.96);
    const lean = ((index % 3) - 1) * 3;
    const opacity = 0.014 + index * 0.006;
    return `<line x1="${x}" y1="${height * 0.05}" x2="${x + lean}" y2="${height * 0.96}" stroke="#f4e6c8" stroke-width="${index === 0 ? 0.8 : 0.55}" opacity="${n(opacity)}"/>`;
  }).join("");
}

function tonalPlates(seed, width, height) {
  return Array.from({ length: 6 }, (_, index) => {
    const x = ((seed * 43 + index * 157) % width) - width * 0.14;
    const y = ((seed * 59 + index * 131) % height) - height * 0.1;
    const w = width * (0.18 + ((index + seed) % 5) * 0.04);
    const h = height * (0.16 + ((index + seed) % 4) * 0.045);
    const opacity = 0.012 + (index % 3) * 0.007;
    return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="#f4dfb8" opacity="${n(opacity)}" filter="url(#soft)"/>`;
  }).join("");
}

function edgeVignette(width, height) {
  const side = width * 0.2;
  const top = height * 0.18;

  return `
  <rect x="0" y="0" width="${side}" height="${height}" fill="#020201" opacity="0.18" filter="url(#soft)"/>
  <rect x="${width - side}" y="0" width="${side}" height="${height}" fill="#020201" opacity="0.16" filter="url(#soft)"/>
  <rect x="0" y="0" width="${width}" height="${top}" fill="#020201" opacity="0.1" filter="url(#soft)"/>
  <rect x="0" y="${height - top}" width="${width}" height="${top}" fill="#020201" opacity="0.22" filter="url(#soft)"/>`;
}

function windowBars(w, h, x, y, width, height, opacity = 0.12) {
  const light = clamp(opacity * 1.28, 0, 0.26);

  return `
    <rect x="${w * x}" y="${h * y}" width="${w * width}" height="${h * height}" fill="#ecd8ad" opacity="${n(light)}" filter="url(#soft)"/>
    <line x1="${w * (x + width * 0.48)}" y1="${h * y}" x2="${w * (x + width * 0.48)}" y2="${h * (y + height)}" stroke="#f1d9a9" stroke-width="${w * 0.004}" opacity="${n(light * 0.9)}"/>
    <line x1="${w * x}" y1="${h * (y + height * 0.52)}" x2="${w * (x + width)}" y2="${h * (y + height * 0.52)}" stroke="#f1d9a9" stroke-width="${w * 0.0035}" opacity="${n(light * 0.75)}"/>`;
}

function motifSvg(motif, width, height) {
  const w = width;
  const h = height;

  switch (motif) {
    case "bw-portrait-room":
      return `
        <rect x="${w * 0.08}" y="${h * 0.1}" width="${w * 0.82}" height="${h * 0.66}" fill="#d8d0bd" opacity="0.07"/>
        ${windowBars(w, h, 0.12, 0.14, 0.22, 0.42, 0.12)}
        <path d="M${w * 0.39} ${h} C${w * 0.39} ${h * 0.78}, ${w * 0.47} ${h * 0.68}, ${w * 0.58} ${h * 0.69} C${w * 0.65} ${h * 0.71}, ${w * 0.7} ${h * 0.84}, ${w * 0.72} ${h} Z" fill="#d7cdbc" opacity="0.15" filter="url(#soft)"/>
        <path d="M${w * 0.49} ${h * 0.27} C${w * 0.42} ${h * 0.31}, ${w * 0.39} ${h * 0.4}, ${w * 0.42} ${h * 0.49} L${w * 0.48} ${h * 0.55} L${w * 0.55} ${h * 0.53} L${w * 0.58} ${h * 0.45} L${w * 0.55} ${h * 0.35} C${w * 0.53} ${h * 0.3}, ${w * 0.51} ${h * 0.27}, ${w * 0.49} ${h * 0.27} Z" fill="#cfc6b6" opacity="0.16" filter="url(#soft)"/>
        <path d="M${w * 0.52} ${h * 0.24} C${w * 0.65} ${h * 0.31}, ${w * 0.68} ${h * 0.53}, ${w * 0.55} ${h * 0.62} L${w * 0.47} ${h * 0.58} L${w * 0.5} ${h * 0.45} L${w * 0.46} ${h * 0.38} L${w * 0.52} ${h * 0.24} Z" fill="#050504" opacity="0.46"/>`;
    case "window-still-life":
      return `
        ${windowBars(w, h, 0.12, 0.08, 0.46, 0.58, 0.14)}
        <path d="M${w * 0.12} ${h * 0.74} H${w * 0.86}" stroke="#e1c593" stroke-width="${h * 0.007}" opacity="0.22"/>
        <path d="M${w * 0.58} ${h * 0.72} C${w * 0.56} ${h * 0.61}, ${w * 0.6} ${h * 0.5}, ${w * 0.64} ${h * 0.47} C${w * 0.68} ${h * 0.52}, ${w * 0.71} ${h * 0.63}, ${w * 0.69} ${h * 0.72} Z" fill="#d3b07a" opacity="0.2"/>
        <path d="M${w * 0.64} ${h * 0.48} C${w * 0.58} ${h * 0.32}, ${w * 0.71} ${h * 0.28}, ${w * 0.68} ${h * 0.14}" fill="none" stroke="#e8d6a8" stroke-width="${w * 0.007}" opacity="0.22"/>
        <path d="M${w * 0.32} ${h * 0.75} L${w * 0.49} ${h * 0.7} L${w * 0.55} ${h * 0.78} L${w * 0.36} ${h * 0.84} Z" fill="#0a0806" opacity="0.28"/>`;
    case "lake-horizon":
      return `
        <rect x="0" y="${h * 0.42}" width="${w}" height="${h * 0.32}" fill="#c7c8bb" opacity="0.13" filter="url(#soft)"/>
        <line x1="0" y1="${h * 0.48}" x2="${w}" y2="${h * 0.46}" stroke="#e8dfcc" stroke-width="${h * 0.006}" opacity="0.2"/>
        <path d="M0 ${h * 0.4} L${w * 0.18} ${h * 0.36} L${w * 0.36} ${h * 0.39} L${w * 0.52} ${h * 0.35} L${w * 0.76} ${h * 0.41} L${w} ${h * 0.37}" fill="none" stroke="#d5cebc" stroke-width="${h * 0.01}" opacity="0.12"/>
        <path d="M${w * 0.55} ${h * 0.5} L${w * 0.61} ${h * 0.49} L${w * 0.65} ${h * 0.51} L${w * 0.58} ${h * 0.52} Z" fill="#070706" opacity="0.38"/>`;
    case "side-portrait":
      return `
        <rect x="${w * 0.08}" y="0" width="${w * 0.3}" height="${h}" fill="#fff0c8" opacity="0.045"/>
        <path d="M${w * 0.44} ${h * 0.26} L${w * 0.54} ${h * 0.2} L${w * 0.64} ${h * 0.28} L${w * 0.67} ${h * 0.39} L${w * 0.63} ${h * 0.48} L${w * 0.55} ${h * 0.54} L${w * 0.45} ${h * 0.5} L${w * 0.4} ${h * 0.39} Z" fill="#d4ccbd" opacity="0.17" filter="url(#soft)"/>
        <path d="M${w * 0.31} ${h} C${w * 0.36} ${h * 0.7}, ${w * 0.66} ${h * 0.69}, ${w * 0.72} ${h} Z" fill="#c4b8a8" opacity="0.13"/>
        <path d="M${w * 0.55} ${h * 0.24} L${w * 0.68} ${h * 0.32} L${w * 0.7} ${h * 0.55} L${w * 0.57} ${h * 0.66} L${w * 0.51} ${h * 0.55} L${w * 0.55} ${h * 0.24} Z" fill="#050505" opacity="0.38"/>`;
    case "rain-street":
      return `
        <rect x="${w * 0.1}" y="${h * 0.08}" width="${w * 0.24}" height="${h * 0.52}" fill="#cfc5b6" opacity="0.08"/>
        <rect x="${w * 0.62}" y="${h * 0.06}" width="${w * 0.25}" height="${h * 0.55}" fill="#cfc5b6" opacity="0.065"/>
        <g opacity="0.15">${Array.from({ length: 9 }, (_, i) => `<rect x="${w * (0.16 + i * 0.074)}" y="${h * (0.18 + (i % 2) * 0.05)}" width="${w * 0.02}" height="${h * 0.075}" fill="#ecdcc4" filter="url(#soft)"/>`).join("")}</g>
        <path d="M${w * 0.47} ${h * 0.46} C${w * 0.43} ${h * 0.54}, ${w * 0.43} ${h * 0.68}, ${w * 0.49} ${h * 0.74} C${w * 0.54} ${h * 0.66}, ${w * 0.53} ${h * 0.53}, ${w * 0.5} ${h * 0.46} Z" fill="#030302" opacity="0.62"/>
        ${Array.from({ length: 14 }, (_, i) => `<line x1="${w * (0.04 + i * 0.07)}" y1="${h * 0.08}" x2="${w * (0.02 + i * 0.07)}" y2="${h * 0.5}" stroke="#d8d1c2" stroke-width="${w * 0.0025}" opacity="${0.05 + (i % 3) * 0.02}"/>`).join("")}
        <path d="M0 ${h * 0.7} L${w * 0.36} ${h * 0.62} L${w} ${h * 0.68}" fill="none" stroke="#d49d68" stroke-width="${h * 0.012}" opacity="0.18" filter="url(#soft)"/>`;
    case "plant-still-life":
      return `
        <path d="M${w * 0.16} ${h * 0.74} H${w * 0.86}" stroke="#e0c28e" stroke-width="${h * 0.008}" opacity="0.18"/>
        <path d="M${w * 0.46} ${h * 0.74} C${w * 0.36} ${h * 0.62}, ${w * 0.4} ${h * 0.49}, ${w * 0.5} ${h * 0.42} C${w * 0.62} ${h * 0.48}, ${w * 0.65} ${h * 0.66}, ${w * 0.54} ${h * 0.76} Z" fill="#aa844f" opacity="0.2"/>
        ${Array.from({ length: 8 }, (_, i) => `<path d="M${w * 0.52} ${h * 0.43} C${w * (0.42 + i * 0.025)} ${h * (0.3 + i * 0.03)}, ${w * (0.56 + i * 0.025)} ${h * (0.23 + i * 0.035)}, ${w * (0.48 + i * 0.035)} ${h * (0.15 + i * 0.046)}" fill="none" stroke="#dec895" stroke-width="${w * 0.0055}" opacity="0.18"/>`).join("")}
        ${Array.from({ length: 5 }, (_, i) => `<path d="M${w * (0.42 + i * 0.06)} ${h * (0.32 + i * 0.035)} L${w * (0.48 + i * 0.06)} ${h * (0.27 + i * 0.035)} L${w * (0.51 + i * 0.055)} ${h * (0.35 + i * 0.026)} Z" fill="#d7c389" opacity="0.12"/>`).join("")}`;
    case "facade-detail":
      return `
        <rect x="${w * 0.16}" y="${h * 0.08}" width="${w * 0.6}" height="${h * 0.66}" fill="#d6cdbc" opacity="0.1"/>
        <path d="M${w * 0.16} ${h * 0.08} L${w * 0.76} ${h * 0.08} L${w * 0.62} ${h * 0.74} L${w * 0.16} ${h * 0.74} Z" fill="#060605" opacity="0.16"/>
        <g opacity="0.25">${Array.from({ length: 12 }, (_, i) => `<rect x="${w * (0.25 + (i % 3) * 0.16)}" y="${h * (0.18 + Math.floor(i / 3) * 0.12)}" width="${w * 0.07}" height="${h * 0.052}" fill="#080706"/>`).join("")}</g>
        <path d="M${w * 0.47} ${h * 0.67} C${w * 0.43} ${h * 0.76}, ${w * 0.46} ${h * 0.84}, ${w * 0.5} ${h * 0.88} C${w * 0.55} ${h * 0.8}, ${w * 0.53} ${h * 0.72}, ${w * 0.5} ${h * 0.67} Z" fill="#030302" opacity="0.5"/>`;
    case "tree-shadow":
      return `
        <rect x="${w * 0.18}" y="0" width="${w * 0.5}" height="${h}" fill="#d8d2bd" opacity="0.075"/>
        ${Array.from({ length: 14 }, (_, i) => `<path d="M${w * (0.02 + i * 0.07)} ${h} C${w * (0.18 + i * 0.04)} ${h * 0.58}, ${w * (0.1 + i * 0.06)} ${h * 0.32}, ${w * (0.3 + i * 0.038)} ${h * 0.06}" stroke="#d3cfa5" stroke-width="${w * 0.0055}" opacity="${0.1 + (i % 3) * 0.03}" fill="none"/>`).join("")}
        <path d="M${w * 0.08} ${h * 0.62} C${w * 0.36} ${h * 0.48}, ${w * 0.56} ${h * 0.72}, ${w * 0.86} ${h * 0.34}" stroke="#eadbb5" stroke-width="${w * 0.01}" opacity="0.08" fill="none"/>`;
    case "wind-portrait":
      return `
        <rect x="${w * 0.12}" y="0" width="${w * 0.18}" height="${h}" fill="#e7d5b6" opacity="0.055"/>
        <path d="M${w * 0.42} ${h * 0.23} L${w * 0.55} ${h * 0.2} L${w * 0.66} ${h * 0.31} L${w * 0.64} ${h * 0.48} L${w * 0.55} ${h * 0.6} L${w * 0.43} ${h * 0.56} L${w * 0.38} ${h * 0.42} Z" fill="#d0c3ab" opacity="0.16" filter="url(#soft)"/>
        <path d="M${w * 0.25} ${h} C${w * 0.3} ${h * 0.69}, ${w * 0.68} ${h * 0.65}, ${w * 0.74} ${h} Z" fill="#c2b196" opacity="0.13"/>
        ${Array.from({ length: 5 }, (_, i) => `<line x1="${w * (0.28 + i * 0.09)}" y1="${h * 0.18}" x2="${w * (0.34 + i * 0.08)}" y2="${h * 0.68}" stroke="#ddcbb0" stroke-width="${w * 0.0045}" opacity="${0.09 + i * 0.015}"/>`).join("")}
        <path d="M${w * 0.5} ${h * 0.23} L${w * 0.69} ${h * 0.35} L${w * 0.66} ${h * 0.56} L${w * 0.52} ${h * 0.65} L${w * 0.48} ${h * 0.5} Z" fill="#060504" opacity="0.32"/>`;
    case "sea-rock":
      return `
        <rect x="0" y="${h * 0.47}" width="${w}" height="${h * 0.26}" fill="#d0cdc0" opacity="0.1"/>
        <line x1="0" y1="${h * 0.51}" x2="${w}" y2="${h * 0.5}" stroke="#e1d7c5" stroke-width="${h * 0.007}" opacity="0.17"/>
        <path d="M${w * 0.18} ${h * 0.76} C${w * 0.23} ${h * 0.54}, ${w * 0.34} ${h * 0.64}, ${w * 0.42} ${h * 0.77} Z" fill="#0a0807" opacity="0.58"/>
        <path d="M${w * 0.6} ${h * 0.72} C${w * 0.67} ${h * 0.56}, ${w * 0.75} ${h * 0.66}, ${w * 0.8} ${h * 0.73} Z" fill="#0a0807" opacity="0.46"/>
        <path d="M0 ${h * 0.66} L${w * 0.3} ${h * 0.61} L${w * 0.62} ${h * 0.65} L${w} ${h * 0.6}" fill="none" stroke="#e8ddc7" stroke-width="${h * 0.01}" opacity="0.15"/>`;
    case "interior-window":
      return `
        ${windowBars(w, h, 0.18, 0.12, 0.46, 0.54, 0.12)}
        <path d="M${w * 0.66} ${h * 0.12} C${w * 0.56} ${h * 0.34}, ${w * 0.61} ${h * 0.52}, ${w * 0.67} ${h * 0.68}" stroke="#e5ce9d" stroke-width="${w * 0.008}" opacity="0.14" fill="none"/>
        <path d="M${w * 0.34} ${h * 0.68} H${w * 0.54} M${w * 0.36} ${h * 0.68} L${w * 0.3} ${h * 0.88} M${w * 0.52} ${h * 0.68} L${w * 0.61} ${h * 0.88}" stroke="#dec593" stroke-width="${w * 0.01}" opacity="0.16" fill="none"/>
        <path d="M${w * 0.64} ${h * 0.62} C${w * 0.6} ${h * 0.75}, ${w * 0.64} ${h * 0.84}, ${w * 0.7} ${h * 0.86} C${w * 0.74} ${h * 0.74}, ${w * 0.72} ${h * 0.66}, ${w * 0.68} ${h * 0.62} Z" fill="#080706" opacity="0.46"/>`;
    case "distant-field":
      return `
        <path d="M0 ${h * 0.5} L${w * 0.16} ${h * 0.43} L${w * 0.34} ${h * 0.51} L${w * 0.48} ${h * 0.39} L${w * 0.65} ${h * 0.52} L${w * 0.82} ${h * 0.44} L${w} ${h * 0.5} L${w} ${h} L0 ${h} Z" fill="#a4865c" opacity="0.18"/>
        <line x1="0" y1="${h * 0.58}" x2="${w}" y2="${h * 0.54}" stroke="#e0c396" stroke-width="${h * 0.009}" opacity="0.13"/>
        <path d="M${w * 0.58} ${h * 0.45} C${w * 0.68} ${h * 0.5}, ${w * 0.74} ${h * 0.55}, ${w * 0.86} ${h * 0.5}" fill="none" stroke="#070504" stroke-width="${h * 0.012}" opacity="0.16"/>`;
    case "plaster-passage":
      return `
        <rect x="${w * 0.1}" y="0" width="${w * 0.78}" height="${h}" fill="#c7ad82" opacity="0.1"/>
        <path d="M${w * 0.15} ${h} L${w * 0.45} ${h * 0.46} L${w * 0.59} ${h} Z" fill="#050403" opacity="0.38"/>
        <path d="M${w * 0.88} 0 L${w * 0.66} ${h} H${w} V0 Z" fill="#050403" opacity="0.16"/>
        <rect x="${w * 0.48}" y="${h * 0.3}" width="${w * 0.13}" height="${h * 0.14}" fill="#070504" opacity="0.34"/>
        <path d="M${w * 0.34} ${h * 0.66} C${w * 0.3} ${h * 0.76}, ${w * 0.34} ${h * 0.84}, ${w * 0.39} ${h * 0.89} C${w * 0.44} ${h * 0.79}, ${w * 0.42} ${h * 0.7}, ${w * 0.38} ${h * 0.66} Z" fill="#050403" opacity="0.58"/>`;
    case "shore-detail":
      return `
        <path d="M0 ${h * 0.6} L${w * 0.22} ${h * 0.53} L${w * 0.44} ${h * 0.66} L${w * 0.72} ${h * 0.55} L${w} ${h * 0.63}" fill="none" stroke="#d7cfbd" stroke-width="${h * 0.016}" opacity="0.18"/>
        <path d="M${w * 0.18} ${h * 0.76} L${w * 0.36} ${h * 0.62} L${w * 0.56} ${h * 0.68} L${w * 0.44} ${h * 0.82} Z" fill="#060504" opacity="0.34"/>
        <path d="M${w * 0.64} ${h * 0.55} L${w * 0.82} ${h * 0.62} L${w * 0.76} ${h * 0.72} L${w * 0.58} ${h * 0.67} Z" fill="#ddd5c2" opacity="0.12"/>`;
    case "chair-light":
      return `
        <rect x="${w * 0.58}" y="0" width="${w * 0.26}" height="${h}" fill="#efd9a8" opacity="0.075"/>
        <path d="M${w * 0.36} ${h * 0.5} H${w * 0.58} M${w * 0.38} ${h * 0.5} L${w * 0.32} ${h * 0.78} M${w * 0.56} ${h * 0.5} L${w * 0.66} ${h * 0.78} M${w * 0.5} ${h * 0.28} L${w * 0.57} ${h * 0.5}" stroke="#e2c795" stroke-width="${w * 0.011}" opacity="0.19" fill="none"/>
        <path d="M${w * 0.16} ${h * 0.68} L${w * 0.42} ${h * 0.6} L${w * 0.82} ${h * 0.58}" stroke="#f0d7a3" stroke-width="${h * 0.006}" opacity="0.11" fill="none"/>
        <path d="M${w * 0.62} ${h * 0.2} L${w * 0.84} ${h * 0.78} L${w * 0.65} ${h * 0.83} Z" fill="#e9d0a0" opacity="0.055"/>`;
    case "narrow-alley":
      return `
        <path d="M${w * 0.12} 0 L${w * 0.43} ${h} H0 V0 Z" fill="#bd9f74" opacity="0.13"/>
        <path d="M${w * 0.88} 0 L${w * 0.58} ${h} H${w} V0 Z" fill="#d0b98d" opacity="0.15"/>
        <path d="M${w * 0.45} ${h} L${w * 0.5} ${h * 0.42} L${w * 0.56} ${h} Z" fill="#060403" opacity="0.44"/>
        <path d="M${w * 0.49} ${h * 0.56} C${w * 0.44} ${h * 0.66}, ${w * 0.47} ${h * 0.8}, ${w * 0.52} ${h * 0.86} C${w * 0.58} ${h * 0.74}, ${w * 0.55} ${h * 0.62}, ${w * 0.52} ${h * 0.56} Z" fill="#050403" opacity="0.62"/>`;
    case "fog-river":
      return `
        <rect x="0" y="${h * 0.42}" width="${w}" height="${h * 0.24}" fill="#d2d0c2" opacity="0.12" filter="url(#soft)"/>
        ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${h * (0.5 + i * 0.034)}" x2="${w}" y2="${h * (0.48 + i * 0.03)}" stroke="#e5dfcc" stroke-width="${h * 0.005}" opacity="0.1"/>`).join("")}
        <path d="M${w * 0.72} ${h * 0.55} C${w * 0.78} ${h * 0.38}, ${w * 0.88} ${h * 0.35}, ${w * 0.96} ${h * 0.52}" stroke="#d4ceb9" stroke-width="${w * 0.007}" opacity="0.13" fill="none"/>
        <path d="M${w * 0.08} ${h * 0.67} L${w * 0.3} ${h * 0.58} L${w * 0.52} ${h * 0.65}" fill="none" stroke="#070706" stroke-width="${h * 0.01}" opacity="0.22"/>`;
    case "table-glass":
      return `
        <path d="M${w * 0.1} ${h * 0.66} H${w * 0.9}" stroke="#e0c391" stroke-width="${h * 0.012}" opacity="0.2"/>
        <path d="M${w * 0.6} ${h * 0.42} L${w * 0.68} ${h * 0.44} L${w * 0.67} ${h * 0.58} L${w * 0.61} ${h * 0.58} Z" fill="#d9a46e" opacity="0.2" filter="url(#soft)"/>
        <path d="M${w * 0.27} ${h * 0.57} L${w * 0.48} ${h * 0.53} L${w * 0.54} ${h * 0.61} L${w * 0.31} ${h * 0.67} Z" fill="#d8c096" opacity="0.12"/>
        <path d="M${w * 0.22} ${h * 0.58} C${w * 0.34} ${h * 0.48}, ${w * 0.44} ${h * 0.62}, ${w * 0.53} ${h * 0.54}" stroke="#e8d0a8" stroke-width="${w * 0.007}" opacity="0.14" fill="none"/>`;
    default:
      return "";
  }
}

function svgFor(photo) {
  const [width, height] = sizes[photo.kind];
  const [dark, mid, light] = photo.tone;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${photo.motif}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="0.58" stop-color="${mid}"/>
      <stop offset="1" stop-color="${light}"/>
    </linearGradient>
    <filter id="soft">
      <feGaussianBlur stdDeviation="${Math.max(width, height) * 0.006}"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" seed="${photo.seed}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.12"/>
      </feComponentTransfer>
    </filter>
    <filter id="tonalDisplace">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="${photo.seed + 19}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${Math.max(width, height) * 0.004}"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#paper)"/>
  <rect width="${width}" height="${height}" fill="#060504" opacity="0.055"/>
  <rect width="${width}" height="${height}" fill="#e6d1ad" opacity="0.028"/>
  <g filter="url(#tonalDisplace)">
    ${tonalPlates(photo.seed, width, height)}
    ${liftSubjectOpacity(motifSvg(photo.motif, width, height))}
  </g>
  ${edgeVignette(width, height)}
  <rect width="${width}" height="${height}" fill="#0a0806" opacity="0.028"/>
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.18"/>
  <g>${scratches(photo.seed, width, height)}</g>
  <g>${dust(photo.seed, width, height)}</g>
</svg>
`;
}

await mkdir(outputDir, { recursive: true });

await Promise.all(
  photos.map((photo) =>
    writeFile(path.join(outputDir, photo.file), svgFor(photo), "utf8"),
  ),
);

console.log(`Generated ${photos.length} photographic placeholders in ${outputDir}`);
