export default function Hud({ filterLabel, drawing, gesture, fps, toast }) {
  return (
    <>
      <div className="hud">
        <div className="hud-chip">
          <span className="hud-kicker">Look</span>
          <strong>{filterLabel}</strong>
        </div>
        <div className="hud-chip">
          <span className="hud-kicker">Tool</span>
          <strong>{drawing ? "Draw" : "Select"}</strong>
        </div>
        <div className="hud-chip">
          <span className="hud-kicker">Gesture</span>
          <strong>{gesture}</strong>
        </div>
        <div className="hud-chip">
          <span className="hud-kicker">FPS</span>
          <strong>{fps || "—"}</strong>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
