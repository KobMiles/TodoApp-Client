import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  initialFocusId?: string;
}

export function Modal({ open, title, onClose, children, initialFocusId }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);

    const id = initialFocusId ? `#${initialFocusId}` : '';
    requestAnimationFrame(() => {
      const target = id ? (document.querySelector(id) as HTMLElement | null) : null;
      (target ?? closeRef.current)?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal" aria-hidden={!open}>
      <div className="modal__backdrop" onClick={() => onCloseRef.current()} />
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal__panel">
        <div className="modal__header">
          <h3 id="modal-title">{title}</h3>
          <button ref={closeRef} className="btn-ghost" onClick={() => onCloseRef.current()} aria-label="Close dialog">
            Close
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
