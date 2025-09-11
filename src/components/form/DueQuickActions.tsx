export function DueQuickActions({
  onToday18,
  onTomorrow09,
  onNoDue,
  disabled = false,
  className = '',
}: {
  onToday18: () => void;
  onTomorrow09: () => void;
  onNoDue: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`quick-actions ${className}`} role="group" aria-label="Quick due presets">
      <button type="button" className="btn-ghost quick-btn" onClick={onToday18} disabled={disabled}>
        <span>Today</span><span>18:00</span>
      </button>
      <button type="button" className="btn-ghost quick-btn" onClick={onTomorrow09} disabled={disabled}>
        <span>Tomorrow</span><span>09:00</span>
      </button>
      <button type="button" className="btn-ghost quick-btn quick-btn--wide" onClick={onNoDue} disabled={disabled}>
        <span>No due</span>
      </button>
    </div>
  );
}
