import { BRUSH_SIZES, DRAW_COLORS } from "../lib/effects";

export default function DrawToolbar({ visible, color, brush, onColor, onBrush }) {
  if (!visible) return null;

  return (
    <div className="drawbar" role="toolbar" aria-label="Draw tools">
      <span className="drawbar-title">Ink</span>
      {DRAW_COLORS.map((value) => (
        <button
          key={value}
          type="button"
          className={`swatch ${color === value ? "is-active" : ""}`}
          style={{ "--swatch": value }}
          data-color={value}
          onClick={() => onColor(value)}
          aria-label={`Color ${value}`}
        />
      ))}
      <span className="drawbar-split" />
      {BRUSH_SIZES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`brush ${brush === item.size ? "is-active" : ""}`}
          data-brush={String(item.size)}
          onClick={() => onBrush(item.size)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
