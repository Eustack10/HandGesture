import Icon from "./Icons";

const COPY = {
  prompt: {
    title: "Camera access needed",
    body: "Gestura uses your webcam to track a hand on-device. Nothing is uploaded.",
  },
  requesting: {
    title: "Waiting for permission",
    body: "Your browser should show a camera prompt. Choose Allow to continue.",
  },
  denied: {
    title: "Camera is blocked",
    body: "Allow camera access for this site, then retry. Look for the camera icon in the address bar.",
  },
  unavailable: {
    title: "No camera available",
    body: "Connect a webcam, make sure another app is not using it, then retry.",
  },
  unsupported: {
    title: "Camera not supported",
    body: "Use a recent Chrome, Edge, or Safari build on HTTPS or localhost.",
  },
  error: {
    title: "Could not start camera",
    body: "Something went wrong while opening the camera.",
  },
};

export default function PermissionScreen({ permission, error, onRetry }) {
  const copy = COPY[permission] || COPY.error;
  const showRetry = permission !== "requesting";

  return (
    <div className="gate" role="status">
      <div className="gate-card">
        <div className="gate-icon">
          <Icon name="camera" />
        </div>
        <p className="gate-kicker">Camera status</p>
        <h1>{copy.title}</h1>
        <p>{error || copy.body}</p>
        <div className="gate-privacy">
          <Icon name="shield" />
          <span>Hand tracking runs locally in this browser.</span>
        </div>
        {showRetry && (
          <button type="button" className="btn-primary" onClick={onRetry}>
            Retry camera
          </button>
        )}
      </div>
    </div>
  );
}
