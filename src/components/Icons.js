export default function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "normal":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </svg>
      );
    case "gray":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16" />
        </svg>
      );
    case "bw":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16" fill="currentColor" />
        </svg>
      );
    case "blur":
      return (
        <svg {...common}>
          <circle cx="8" cy="12" r="3.2" />
          <circle cx="14.5" cy="12" r="4.2" opacity="0.55" />
        </svg>
      );
    case "neon":
      return (
        <svg {...common}>
          <path d="M13 3L6 14h6l-1 7 7-11h-6l1-7z" />
        </svg>
      );
    case "invert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
        </svg>
      );
    case "draw":
      return (
        <svg {...common}>
          <path d="M4 20l4.5-1.2L19 8.3a2.2 2.2 0 0 0-3.1-3.1L5.4 15.7 4 20z" />
          <path d="M14.6 6.4l3 3" />
        </svg>
      );
    case "clear":
      return (
        <svg {...common}>
          <path d="M5 7h14M9 7V5h6v2M8 7l.8 12h6.4L16 7" />
        </svg>
      );
    case "snap":
      return (
        <svg {...common}>
          <path d="M4 8h3l1.4-2h7.2L17 8h3v11H4V8z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
      );
    case "landmarks":
      return (
        <svg {...common}>
          <circle cx="8" cy="7" r="1.4" fill="currentColor" />
          <circle cx="16" cy="8" r="1.4" fill="currentColor" />
          <circle cx="12" cy="16" r="1.4" fill="currentColor" />
          <path d="M8 7l4 9 4-8" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M9.6 9.4a2.4 2.4 0 1 1 3.8 2c-.8.5-1.4 1-1.4 2v.4" />
          <circle cx="12" cy="17" r="0.7" fill="currentColor" />
        </svg>
      );
    case "fullscreen":
      return (
        <svg {...common}>
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8z" />
          <circle cx="12" cy="13.2" r="3.4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}
