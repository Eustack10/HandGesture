"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ControlRail from "./components/ControlRail";
import DrawToolbar from "./components/DrawToolbar";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import HelpModal from "./components/HelpModal";
import Hud from "./components/Hud";
import PermissionScreen from "./components/PermissionScreen";
import { useHandCamera } from "./hooks/useHandCamera";
import { FILTERS } from "./lib/effects";
import {
  canvasToClient,
  classifyGesture,
  hitDataAttr,
} from "./lib/gestures";
import { renderFrame } from "./lib/renderFrame";
import "./App.css";

const CANVAS_W = 1280;
const CANVAS_H = 720;

function AppShell() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const stageRef = useRef(null);

  const filterRef = useRef("none");
  const drawingRef = useRef(false);
  const landmarksRef = useRef(true);
  const colorRef = useRef("#22d3ee");
  const brushRef = useRef(6);
  const lastPointRef = useRef(null);
  const clickedRef = useRef(false);
  const framesRef = useRef({ n: 0, t: performance.now(), fps: 0 });
  const uiTickRef = useRef(0);
  const toastTimerRef = useRef(0);

  const [filterId, setFilterId] = useState("none");
  const [drawing, setDrawing] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [color, setColor] = useState("#22d3ee");
  const [brush, setBrush] = useState(6);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [gesture, setGesture] = useState("—");
  const [fps, setFps] = useState(0);
  const [toast, setToast] = useState("");
  const [modelHint, setModelHint] = useState("");

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  const setFilter = useCallback(
    (id) => {
      filterRef.current = id;
      setFilterId(id);
    },
    []
  );

  const toggleDraw = useCallback(() => {
    drawingRef.current = !drawingRef.current;
    setDrawing(drawingRef.current);
    lastPointRef.current = null;
  }, []);

  const clearDraw = useCallback(() => {
    const draw = drawCanvasRef.current;
    if (!draw) return;
    draw.getContext("2d").clearRect(0, 0, draw.width, draw.height);
    lastPointRef.current = null;
    showToast("Canvas cleared");
  }, [showToast]);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.download = `gestura-${stamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Snapshot saved");
  }, [showToast]);

  const toggleLandmarks = useCallback(() => {
    landmarksRef.current = !landmarksRef.current;
    setShowLandmarks(landmarksRef.current);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      node.requestFullscreen?.().catch(() => {
        showToast("Fullscreen was blocked");
      });
    }
  }, [showToast]);

  const applyAction = useCallback(
    (action) => {
      if (!action) return;
      if (action.startsWith("filter:")) {
        setFilter(action.slice(7));
        return;
      }
      if (action === "tool:draw") {
        toggleDraw();
        return;
      }
      if (action === "tool:clear") {
        clearDraw();
      }
    },
    [clearDraw, setFilter, toggleDraw]
  );

  const onResults = useCallback(
    (results) => {
      const canvas = canvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      if (!canvas || !drawCanvas) return;
      const ctx = canvas.getContext("2d");

      const hand = renderFrame({
        ctx,
        canvas,
        drawCanvas,
        results,
        filterId: filterRef.current,
        showLandmarks: landmarksRef.current,
        drawing: drawingRef.current,
      });

      const now = performance.now();
      const bucket = framesRef.current;
      bucket.n += 1;
      if (now - bucket.t >= 500) {
        bucket.fps = Math.round((bucket.n * 1000) / (now - bucket.t));
        bucket.n = 0;
        bucket.t = now;
      }

      document.querySelectorAll("[data-action], [data-color], [data-brush]").forEach((el) => {
        el.classList.remove("is-aimed");
      });

      if (now - uiTickRef.current > 120) {
        uiTickRef.current = now;
        setTracking(Boolean(hand));
        setGesture(hand ? classifyGesture(hand.landmarks) : "—");
        setFps(bucket.fps);
      }

      if (!hand) {
        clickedRef.current = false;
        lastPointRef.current = null;
        return;
      }

      const { index, pinch } = hand;
      const client = canvasToClient(canvas, index.x, index.y);
      const actionHit = hitDataAttr(client.x, client.y, "data-action");
      const colorHit = hitDataAttr(client.x, client.y, "data-color");
      const brushHit = hitDataAttr(client.x, client.y, "data-brush");
      (actionHit || colorHit || brushHit)?.node.classList.add("is-aimed");

      if (drawingRef.current && pinch.isClick && !actionHit && !colorHit && !brushHit) {
        const dctx = drawCanvas.getContext("2d");
        dctx.strokeStyle = colorRef.current;
        dctx.lineWidth = brushRef.current;
        dctx.lineCap = "round";
        dctx.lineJoin = "round";
        dctx.shadowColor = colorRef.current;
        dctx.shadowBlur = 8;
        if (lastPointRef.current) {
          dctx.beginPath();
          dctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
          dctx.lineTo(index.x, index.y);
          dctx.stroke();
        }
        lastPointRef.current = { x: index.x, y: index.y };
      } else if (!pinch.isClick) {
        lastPointRef.current = null;
      }

      if (pinch.isClick && !clickedRef.current) {
        clickedRef.current = true;
        if (colorHit) {
          colorRef.current = colorHit.value;
          setColor(colorHit.value);
        } else if (brushHit) {
          const size = Number(brushHit.value);
          brushRef.current = size;
          setBrush(size);
        } else if (actionHit) {
          applyAction(actionHit.value);
        }
      }
      if (!pinch.isClick) clickedRef.current = false;
    },
    [applyAction]
  );

  const { permission, modelStatus, error, retry } = useHandCamera({
    videoRef,
    onResults,
  });

  useEffect(() => {
    if (modelStatus === "loading") setModelHint("Loading hand model…");
    else if (modelStatus === "ready") setModelHint("");
    else if (modelStatus === "error") setModelHint(error || "Tracking unavailable");
  }, [modelStatus, error]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === "escape") {
        setHelpOpen(false);
        return;
      }
      if (key === "?" || key === "/") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      const filter = FILTERS.find((item) => item.shortcut === e.key);
      if (filter) {
        setFilter(filter.id);
        return;
      }
      if (key === "d") toggleDraw();
      if (key === "c") clearDraw();
      if (key === "s") snapshot();
      if (key === "l") toggleLandmarks();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearDraw, setFilter, snapshot, toggleDraw, toggleLandmarks]);

  const filterLabel = FILTERS.find((item) => item.id === filterId)?.label || "Normal";
  const cameraReady = permission === "granted";
  const blocked = !cameraReady;

  return (
    <div className="app">
      <div className="ambient" />
      <Header
        permission={permission}
        modelStatus={modelStatus}
        tracking={tracking}
        onSnapshot={snapshot}
        onToggleLandmarks={toggleLandmarks}
        showLandmarks={showLandmarks}
        onToggleHelp={() => setHelpOpen((v) => !v)}
        onToggleFullscreen={toggleFullscreen}
      />

      <main className="workspace">
        <div className="stage" ref={stageRef}>
          <video
            ref={videoRef}
            className={cameraReady && modelStatus !== "ready" ? "preview" : "preview is-hidden"}
            playsInline
            muted
            autoPlay
          />
          <canvas
            ref={canvasRef}
            className={modelStatus === "ready" ? "stage-canvas" : "stage-canvas is-hidden"}
            width={CANVAS_W}
            height={CANVAS_H}
          />
          <canvas
            ref={drawCanvasRef}
            className="is-hidden"
            width={CANVAS_W}
            height={CANVAS_H}
          />

          {blocked && (
            <PermissionScreen
              permission={permission}
              error={error}
              onRetry={retry}
            />
          )}

          {cameraReady && modelStatus !== "ready" && (
            <div className="stage-overlay">
              {modelStatus === "error" ? (
                <>
                  <p>{modelHint || "Tracking unavailable"}</p>
                  <button type="button" className="btn-primary" onClick={retry}>
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <div className="spinner" />
                  <p>{modelHint || "Starting camera…"}</p>
                </>
              )}
            </div>
          )}

          {cameraReady && (
            <>
              <div className="vignette" />
              <ControlRail
                filterId={filterId}
                drawing={drawing}
                onFilter={setFilter}
                onToggleDraw={toggleDraw}
                onClear={clearDraw}
              />
              <DrawToolbar
                visible={drawing}
                color={color}
                brush={brush}
                onColor={(value) => {
                  colorRef.current = value;
                  setColor(value);
                }}
                onBrush={(value) => {
                  brushRef.current = value;
                  setBrush(value);
                }}
              />
              <Hud
                filterLabel={filterLabel}
                drawing={drawing}
                gesture={gesture}
                fps={fps}
                toast={toast}
              />
              <p className="pinch-hint">Pinch thumb + index to click · press ? for help</p>
            </>
          )}
        </div>
      </main>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
