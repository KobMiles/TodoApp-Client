import React from 'react';

export function FormErrorSummary({
  errors,
  heading = 'Please fix the following errors',
  id = 'form-error-summary',
  onClose,
}: {
  errors: Record<string, string>;
  heading?: string;
  id?: string;
  onClose?: () => void;
}) {
  const items = React.useMemo(
    () => Array.from(new Set(Object.values(errors).filter(Boolean))),
    [errors]
  );
  if (items.length === 0) return null;

  return (
    <div id={id} role="alert" aria-live="polite" className="field-error-summary">
      <div className="field-error-summary__head">
        <strong>{heading}</strong>
        {onClose && (
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Dismiss errors">
            ×
          </button>
        )}
      </div>
      <ul className="field-error-summary__list">
        {items.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
