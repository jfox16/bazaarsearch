import { useEffect } from 'react';
import { X } from 'lucide-react';

import './Modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Render the content region as a transparent, layout-neutral container: no
   * box styling and no built-in close button. The children own their layout,
   * chrome and close affordance (e.g. the card detail's two-column view).
   */
  bare?: boolean;
}

export const Modal = ({ isOpen, onClose, children, bare }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="Modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={bare ? 'Modal-content is-bare' : 'Modal-content'}
        role="dialog"
        aria-modal
      >
        {!bare && (
          <button type="button" className="Modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};
