export default function WidgetShell({ widget, isEditing, onRemove, children }) {
  return (
    <article className={`v2-widget v2-${widget.tone}`}>
      <div className="v2-widget-header">
        <span className="v2-widget-icon">{widget.icon}</span>
        <div>
          <h2>{widget.title}</h2>
          <p>{widget.description}</p>
        </div>
        {isEditing && (
          <button type="button" className="v2-remove" onClick={onRemove} aria-label={`${widget.title} widgetını kaldır`}>
            ×
          </button>
        )}
      </div>
      <div className="v2-widget-body">{children}</div>
    </article>
  );
}
