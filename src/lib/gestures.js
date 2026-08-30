const PINCH_START = 0.055;
const PINCH_CLICK = 0.038;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const fingerExtended = (landmarks, tip, pip) => landmarks[tip].y < landmarks[pip].y - 0.02;

const thumbExtended = (landmarks) => {
  const wrist = landmarks[0];
  const tip = landmarks[4];
  const ip = landmarks[3];
  return dist(wrist, tip) > dist(wrist, ip) * 1.12;
};

export function getPinch(landmarks) {
  const distance = dist(landmarks[4], landmarks[8]);
  const tightness = Math.max(0, Math.min(1, 1 - distance / PINCH_START));
  return {
    distance,
    tightness,
    isPinch: distance < PINCH_START,
    isClick: distance < PINCH_CLICK,
  };
}

export function classifyGesture(landmarks) {
  const pinch = getPinch(landmarks);
  if (pinch.isClick) return "Pinch click";
  if (pinch.isPinch) return "Pinching";

  const index = fingerExtended(landmarks, 8, 6);
  const middle = fingerExtended(landmarks, 12, 10);
  const ring = fingerExtended(landmarks, 16, 14);
  const pinky = fingerExtended(landmarks, 20, 18);
  const thumb = thumbExtended(landmarks);
  const up = [index, middle, ring, pinky].filter(Boolean).length;

  if (up === 0 && !thumb) return "Fist";
  if (index && !middle && !ring && !pinky) return "Pointing";
  if (index && middle && !ring && !pinky) return "Peace";
  if (up === 4 && thumb) return "Open palm";
  if (!index && !middle && !ring && pinky && thumb) return "Rock on";
  return "Hand";
}

export function toCanvasPoint(landmark, width, height) {
  return {
    x: (1 - landmark.x) * width,
    y: landmark.y * height,
  };
}

export function canvasToClient(canvas, x, y) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: rect.left + (x / canvas.width) * rect.width,
    y: rect.top + (y / canvas.height) * rect.height,
  };
}

export function hitDataAttr(clientX, clientY, attr) {
  const nodes = document.querySelectorAll(`[${attr}]`);
  for (const node of nodes) {
    const r = node.getBoundingClientRect();
    const pad = 10;
    if (
      clientX >= r.left - pad &&
      clientX <= r.right + pad &&
      clientY >= r.top - pad &&
      clientY <= r.bottom + pad
    ) {
      return { node, value: node.getAttribute(attr) };
    }
  }
  return null;
}
