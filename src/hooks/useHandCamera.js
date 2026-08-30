import { useCallback, useEffect, useRef, useState } from "react";

function mapGetUserMediaError(err) {
  const name = err?.name || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      permission: "denied",
      message:
        "Camera access was blocked. Allow the camera for this site in your browser settings, then retry.",
    };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      permission: "unavailable",
      message: "No camera was found. Plug in a webcam and try again.",
    };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      permission: "unavailable",
      message:
        "The camera is already in use by another app. Close it, then retry.",
    };
  }
  if (name === "SecurityError") {
    return {
      permission: "unsupported",
      message: "Camera access requires a secure context (HTTPS or localhost).",
    };
  }
  return {
    permission: "error",
    message: err?.message || "Could not start the camera.",
  };
}

export function useHandCamera({ videoRef, onResults }) {
  const [permission, setPermission] = useState("prompt");
  const [modelStatus, setModelStatus] = useState("idle");
  const [error, setError] = useState(null);

  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef = useRef(0);
  const aliveRef = useRef(false);
  const busyRef = useRef(false);

  const stop = useCallback(() => {
    aliveRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    try {
      handsRef.current?.close();
    } catch {
      /* MediaPipe close is best-effort */
    }
    handsRef.current = null;
  }, []);

  const start = useCallback(async () => {
    stop();
    aliveRef.current = true;
    setError(null);
    setModelStatus("loading");

    if (!window.isSecureContext) {
      setPermission("unsupported");
      setModelStatus("error");
      setError("Camera needs HTTPS or localhost.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      setModelStatus("error");
      setError("This browser does not support camera access.");
      return;
    }

    setPermission("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (!aliveRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setPermission("granted");
    } catch (err) {
      const mapped = mapGetUserMediaError(err);
      setPermission(mapped.permission);
      setModelStatus("error");
      setError(mapped.message);
      return;
    }

    try {
      const { Hands } = await import("@mediapipe/hands");
      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
        selfieMode: false,
      });

      let announcedReady = false;
      hands.onResults((results) => {
        if (!announcedReady) {
          announcedReady = true;
          setModelStatus("ready");
        }
        onResultsRef.current?.(results);
      });

      handsRef.current = hands;
      await hands.initialize();
      if (!aliveRef.current) return;

      const tick = async () => {
        if (!aliveRef.current) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2 && !busyRef.current) {
          busyRef.current = true;
          try {
            await hands.send({ image: video });
          } catch (err) {
            if (aliveRef.current) {
              setModelStatus("error");
              setError(
                err?.message ||
                  "Hand tracking failed. Check your network (model files load from a CDN)."
              );
            }
          } finally {
            busyRef.current = false;
          }
        }
        if (aliveRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setModelStatus("error");
      setError(
        err?.message ||
          "Could not load the MediaPipe Hands model. Check your connection and retry."
      );
    }
  }, [stop, videoRef]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  return { permission, modelStatus, error, retry: start };
}
