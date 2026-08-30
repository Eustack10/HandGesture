import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { FILTER_CSS } from "./effects";
import { getPinch, toCanvasPoint } from "./gestures";

function glowDot(ctx, x, y, radius, fill, glow) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

export function renderFrame({
  ctx,
  canvas,
  drawCanvas,
  results,
  filterId,
  showLandmarks,
  drawing,
}) {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.filter = FILTER_CSS[filterId] || "none";
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(results.image, -width, 0, width, height);
  ctx.restore();
  ctx.filter = "none";

  if (drawCanvas) {
    ctx.drawImage(drawCanvas, 0, 0);
  }

  if (!results.multiHandLandmarks?.length) return null;

  const landmarks = results.multiHandLandmarks[0];
  const pinch = getPinch(landmarks);
  const index = toCanvasPoint(landmarks[8], width, height);
  const thumb = toCanvasPoint(landmarks[4], width, height);

  if (showLandmarks) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(34, 211, 238, 0.42)";
    ctx.lineCap = "round";
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const pa = toCanvasPoint(landmarks[a], width, height);
      const pb = toCanvasPoint(landmarks[b], width, height);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    landmarks.forEach((point, i) => {
      const p = toCanvasPoint(point, width, height);
      const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      glowDot(
        ctx,
        p.x,
        p.y,
        isTip ? 4.5 : 3,
        isTip ? "#ecfeff" : "#22d3ee",
        "rgba(34, 211, 238, 0.9)"
      );
    });
  }

  ctx.save();
  ctx.shadowColor = pinch.isClick ? "#4ade80" : "#22d3ee";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(thumb.x, thumb.y);
  ctx.lineTo(index.x, index.y);
  ctx.strokeStyle = pinch.isClick ? "#4ade80" : "rgba(255,255,255,0.9)";
  ctx.lineWidth = pinch.isClick ? 3.5 : 2;
  ctx.stroke();
  ctx.restore();

  const mx = (thumb.x + index.x) / 2;
  const my = (thumb.y + index.y) / 2;
  ctx.beginPath();
  ctx.arc(mx, my, 16, -Math.PI / 2, -Math.PI / 2 + pinch.tightness * Math.PI * 2);
  ctx.strokeStyle = pinch.isClick ? "#4ade80" : "#22d3ee";
  ctx.lineWidth = 3;
  ctx.stroke();

  glowDot(
    ctx,
    index.x,
    index.y,
    pinch.isClick ? 8 : 6,
    pinch.isClick ? "#4ade80" : "#22d3ee",
    pinch.isClick ? "#4ade80" : "#22d3ee"
  );

  if (drawing) {
    ctx.beginPath();
    ctx.arc(index.x, index.y, 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(248,250,252,0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  return { index, thumb, pinch, landmarks };
}
