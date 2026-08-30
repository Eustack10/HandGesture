export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="modal-kicker">How it works</p>
        <h2 id="help-title">Pinch is the click</h2>
        <ul>
          <li>
            <strong>Point</strong> with your index finger at a control.
          </li>
          <li>
            <strong>Pinch</strong> thumb and index together to select it.
          </li>
          <li>
            In <strong>Draw</strong>, keep the pinch closed and move to paint.
          </li>
          <li>
            Filters stay on while you draw — they are independent.
          </li>
        </ul>
        <div className="keys">
          <span>1–6 filters</span>
          <span>D draw</span>
          <span>C clear</span>
          <span>S snapshot</span>
          <span>L skeleton</span>
          <span>? help</span>
        </div>
        <p className="modal-note">
          Video and landmarks never leave this machine. MediaPipe Hands runs in the browser.
        </p>
        <button type="button" className="btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
