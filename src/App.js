import React, { useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);

  const clickedRef = useRef(false);
  const effectRef = useRef("none");
  const lastPointRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawCanvas = drawCanvasRef.current;
    const drawCtx = drawCanvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* ================= VIDEO EFFECT ================= */
    switch (effectRef.current) {
      case "grayscale":
        ctx.filter = "grayscale(100%)";
        break;
      case "bw":
        ctx.filter = "grayscale(100%) contrast(200%)";
        break;
      case "blur":
        ctx.filter = "blur(3px)";
        break;
      default:
        ctx.filter = "none";
    }

    /* ================= MIRRORED VIDEO ================= */
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(
      results.image,
      -canvas.width,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();
    ctx.filter = "none";

    /* ================= DRAW LAYER ================= */
    ctx.drawImage(drawCanvas, 0, 0);

    /* ================= ROUND BUTTONS (RIGHT) ================= */
    const buttons = [
      { id: "none", label: "N", y: 80 },
      { id: "grayscale", label: "G", y: 150 },
      { id: "bw", label: "BW", y: 220 },
      { id: "blur", label: "B", y: 290 },
      { id: "draw", label: "✏️", y: 360 },
      { id: "clear", label: "🧹", y: 430 },
    ];

    const btnX = canvas.width - 50;
    const radius = 22;

    buttons.forEach((btn) => {
      ctx.beginPath();
      ctx.arc(btnX, btn.y, radius, 0, Math.PI * 2);
      ctx.fillStyle =
        effectRef.current === btn.id ? "green" : "rgba(0,0,0,0.6)";
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(btn.label, btnX, btn.y);
    });

    /* ================= HAND TRACKING ================= */
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        /* ===== ADDED: ALL LANDMARK DOTS (BLACK) ===== */
        landmarks.forEach((point) => {
          const px = (1 - point.x) * canvas.width;
          const py = point.y * canvas.height;

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#000";
          ctx.fill();
        });

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        const thumbX = (1 - thumbTip.x) * canvas.width;
        const thumbY = thumbTip.y * canvas.height;
        const x = (1 - indexTip.x) * canvas.width;
        const y = indexTip.y * canvas.height;

        const distance = Math.hypot(
          thumbTip.x - indexTip.x,
          thumbTip.y - indexTip.y
        );

        const isClick = distance < 0.04;

        /* ===== LINK LINE (THUMB ↔ INDEX) ===== */
        ctx.beginPath();
        ctx.moveTo(thumbX, thumbY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = isClick ? "#00ff00" : "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* ===== DRAW MODE ===== */
        if (effectRef.current === "draw" && isClick) {
          drawCtx.strokeStyle = "#fff";
          drawCtx.lineWidth = 4;
          drawCtx.lineCap = "round";

          if (lastPointRef.current) {
            drawCtx.beginPath();
            drawCtx.moveTo(
              lastPointRef.current.x,
              lastPointRef.current.y
            );
            drawCtx.lineTo(x, y);
            drawCtx.stroke();
          }

          lastPointRef.current = { x, y };
        } else {
          lastPointRef.current = null;
        }

        /* ===== BUTTON CLICK ===== */
        if (isClick && !clickedRef.current) {
          clickedRef.current = true;

          buttons.forEach((btn) => {
            const d = Math.hypot(x - btnX, y - btn.y);

            if (d < radius) {
              if (btn.id === "clear") {
                drawCtx.clearRect(
                  0,
                  0,
                  drawCanvas.width,
                  drawCanvas.height
                );
              } else {
                effectRef.current = btn.id;
              }
            }
          });
        }

        if (!isClick) clickedRef.current = false;
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Hand Gesture Effects + Draw (Mirrored)</h2>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
      <canvas
        ref={drawCanvasRef}
        width="640"
        height="480"
        style={{ display: "none" }}
      />
    </div>
  );
}
