import { FILTERS } from "../lib/effects";
import Icon from "./Icons";

export default function ControlRail({ filterId, drawing, onFilter, onToggleDraw, onClear }) {
  return (
    <aside className="rail" aria-label="Effects and tools">
      {FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`rail-btn ${filterId === item.id ? "is-active" : ""}`}
          data-action={`filter:${item.id}`}
          aria-pressed={filterId === item.id}
          onClick={() => onFilter(item.id)}
          title={`${item.label} (${item.shortcut})`}
        >
          <span className="rail-icon">
            <Icon name={item.icon} />
          </span>
          <span className="rail-meta">
            <span className="rail-label">{item.label}</span>
            <span className="rail-key">{item.shortcut}</span>
          </span>
        </button>
      ))}

      <div className="rail-split" />

      <button
        type="button"
        className={`rail-btn ${drawing ? "is-active" : ""}`}
        data-action="tool:draw"
        aria-pressed={drawing}
        onClick={onToggleDraw}
        title="Draw (D)"
      >
        <span className="rail-icon">
          <Icon name="draw" />
        </span>
        <span className="rail-meta">
          <span className="rail-label">Draw</span>
          <span className="rail-key">D</span>
        </span>
      </button>

      <button
        type="button"
        className="rail-btn"
        data-action="tool:clear"
        onClick={onClear}
        title="Clear drawing (C)"
      >
        <span className="rail-icon">
          <Icon name="clear" />
        </span>
        <span className="rail-meta">
          <span className="rail-label">Clear</span>
          <span className="rail-key">C</span>
        </span>
      </button>
    </aside>
  );
}
