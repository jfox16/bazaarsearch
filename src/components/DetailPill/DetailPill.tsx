import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';

import './DetailPill.scss';

const VIEWPORT_PADDING = 16;
const GAP = 8;
const CLOSE_DELAY_MS = 80;

interface DetailPillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  description: string | null;
  filterLabel: string;
  isOpen: boolean;
  onOpen: () => void;
  onFilter: () => void;
  onClose: () => void;
  children: ReactNode;
}

export const DetailPill = ({
  description,
  filterLabel,
  isOpen,
  onOpen,
  onFilter,
  onClose,
  children,
  className,
  ...buttonProps
}: DetailPillProps) => {
  const rootRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverId = useId();

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(onClose, CLOSE_DELAY_MS);
  }, [clearCloseTimer, onClose]);

  const handleOpen = useCallback(() => {
    clearCloseTimer();
    onOpen();
  }, [clearCloseTimer, onOpen]);

  const positionPopover = useCallback(() => {
    const root = rootRef.current;
    const popover = popoverRef.current;
    if (!root || !popover) return;

    const triggerRect = root.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;

    const centerX = triggerRect.left + triggerRect.width / 2;
    let left = centerX - popoverWidth / 2;
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - popoverWidth - VIEWPORT_PADDING),
    );

    let top = triggerRect.bottom + GAP;
    if (top + popoverHeight > window.innerHeight - VIEWPORT_PADDING) {
      top = triggerRect.top - popoverHeight - GAP;
    }

    popover.style.setProperty('--popover-x', `${left}px`);
    popover.style.setProperty('--popover-y', `${top}px`);
    root.dataset.placed = 'fixed';
  }, []);

  const clearPosition = useCallback(() => {
    const root = rootRef.current;
    const popover = popoverRef.current;
    if (!root || !popover) return;

    delete root.dataset.placed;
    popover.style.removeProperty('--popover-x');
    popover.style.removeProperty('--popover-y');
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearPosition();
      return;
    }

    positionPopover();
    requestAnimationFrame(positionPopover);

    window.addEventListener('scroll', positionPopover, true);
    window.addEventListener('resize', positionPopover);

    return () => {
      window.removeEventListener('scroll', positionPopover, true);
      window.removeEventListener('resize', positionPopover);
      clearPosition();
    };
  }, [clearPosition, isOpen, positionPopover]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const handleFilter = () => {
    onFilter();
    onClose();
  };

  return (
    <span
      ref={rootRef}
      className={`DetailPill${isOpen ? ' is-open' : ''}`}
      data-placed={isOpen ? 'fixed' : undefined}
      onMouseEnter={handleOpen}
      onMouseLeave={scheduleClose}
      onFocus={handleOpen}
      onBlur={scheduleClose}
    >
      <button type="button" className={className} aria-describedby={isOpen ? popoverId : undefined} {...buttonProps}>
        {children}
      </button>
      {isOpen && (
        <span
          ref={popoverRef}
          id={popoverId}
          className="DetailPill-popover"
          role="tooltip"
        >
          {description && <p className="DetailPill-description">{description}</p>}
          <button type="button" className="DetailPill-filter" onClick={handleFilter}>
            {filterLabel}
          </button>
        </span>
      )}
    </span>
  );
};
