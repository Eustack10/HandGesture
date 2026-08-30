import Icon from "./Icons";

function Pill({ tone, label, detail }) {
  return (
    <span className={`pill pill-${tone}`}>
      <span className="pill-dot" />
      <span className="pill-label">{label}</span>
      {detail && <span className="pill-detail">{detail}</span>}
    </span>
  );
}

function cameraPill(permission) {
  if (permission === "granted") return { tone: "ok", label: "Camera", detail: "Live" };
  if (permission === "requesting") return { tone: "warn", label: "Camera", detail: "Asking" };
  if (permission === "denied") return { tone: "bad", label: "Camera", detail: "Blocked" };
  if (permission === "unavailable") return { tone: "bad", label: "Camera", detail: "Missing" };
  if (permission === "unsupported") return { tone: "bad", label: "Camera", detail: "Unsupported" };
  if (permission === "error") return { tone: "bad", label: "Camera", detail: "Error" };
  return { tone: "muted", label: "Camera", detail: "Idle" };
}

function modelPill(modelStatus) {
  if (modelStatus === "ready") return { tone: "ok", label: "Model", detail: "Ready" };
  if (modelStatus === "loading") return { tone: "warn", label: "Model", detail: "Loading" };
  if (modelStatus === "error") return { tone: "bad", label: "Model", detail: "Failed" };
  return { tone: "muted", label: "Model", detail: "Idle" };
}

export default function Header({
  permission,
  modelStatus,
  tracking,
  onSnapshot,
  onToggleLandmarks,
  showLandmarks,
  onToggleHelp,
  onToggleFullscreen,
}) {
  const cam = cameraPill(permission);
  const model = modelPill(modelStatus);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">G</div>
        <div>
          <h1>Gestura</h1>
          <p>On-device hand tracking · pinch to control</p>
        </div>
      </div>

      <div className="status-row" aria-live="polite">
        <Pill {...cam} />
        <Pill {...model} />
        <Pill
          tone={tracking ? "ok" : "muted"}
          label="Hand"
          detail={tracking ? "Tracking" : "Searching"}
        />
      </div>

      <div className="top-actions">
        <button type="button" className="ghost-btn" onClick={onSnapshot} title="Save snapshot (S)">
          <Icon name="snap" />
          <span>Snap</span>
        </button>
        <button
          type="button"
          className={`ghost-btn ${showLandmarks ? "is-on" : ""}`}
          onClick={onToggleLandmarks}
          title="Toggle skeleton (L)"
        >
          <Icon name="landmarks" />
          <span>Bones</span>
        </button>
        <button type="button" className="ghost-btn" onClick={onToggleFullscreen} title="Fullscreen">
          <Icon name="fullscreen" />
        </button>
        <button type="button" className="ghost-btn" onClick={onToggleHelp} title="Help (?)">
          <Icon name="help" />
        </button>
      </div>
    </header>
  );
}
