export const FILTERS = [
  { id: "none", label: "Normal", shortcut: "1", icon: "normal" },
  { id: "grayscale", label: "Gray", shortcut: "2", icon: "gray" },
  { id: "bw", label: "B&W", shortcut: "3", icon: "bw" },
  { id: "blur", label: "Blur", shortcut: "4", icon: "blur" },
  { id: "neon", label: "Neon", shortcut: "5", icon: "neon" },
  { id: "invert", label: "Invert", shortcut: "6", icon: "invert" },
];

export const FILTER_CSS = {
  none: "none",
  grayscale: "grayscale(1) contrast(1.06)",
  bw: "grayscale(1) contrast(1.9) brightness(1.06)",
  blur: "blur(6px)",
  neon: "saturate(1.9) contrast(1.18) brightness(1.08)",
  invert: "invert(1) hue-rotate(180deg)",
};

export const DRAW_COLORS = [
  "#f8fafc",
  "#fb7185",
  "#22d3ee",
  "#facc15",
  "#a78bfa",
  "#4ade80",
];

export const BRUSH_SIZES = [
  { id: "s", size: 3, label: "S" },
  { id: "m", size: 6, label: "M" },
  { id: "l", size: 12, label: "L" },
];
