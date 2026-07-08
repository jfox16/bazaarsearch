import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';

import './Tooltip.scss';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

const VIEWPORT_PADDING = 16;
const GAP = 8;

export const Tooltip = ({ content, children, side = 'top', className }: TooltipProps) => {
  const rootRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);

  const positionContent = useCallback(() => {
    const root = rootRef.current;
    const contentEl = contentRef.current;
    if (!root || !contentEl) return;

    const triggerRect = root.getBoundingClientRect();
    const contentWidth = contentEl.offsetWidth;
    const contentHeight = contentEl.offsetHeight;

    const centerX = triggerRect.left + triggerRect.width / 2;
    let left = centerX - contentWidth / 2;
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - contentWidth - VIEWPORT_PADDING),
    );

    const top =
      side === 'top'
        ? triggerRect.top - contentHeight - GAP
        : triggerRect.bottom + GAP;

    contentEl.style.setProperty('--tooltip-x', `${left}px`);
    contentEl.style.setProperty('--tooltip-y', `${top}px`);
    root.dataset.placed = 'fixed';
  }, [side]);

  const clearPosition = useCallback(() => {
    const root = rootRef.current;
    const contentEl = contentRef.current;
    if (!root || !contentEl) return;

    delete root.dataset.placed;
    contentEl.style.removeProperty('--tooltip-x');
    contentEl.style.removeProperty('--tooltip-y');
  }, []);

  const show = useCallback(() => {
    positionContent();
    requestAnimationFrame(positionContent);
    window.addEventListener('scroll', positionContent, true);
    window.addEventListener('resize', positionContent);
  }, [positionContent]);

  const hide = useCallback(() => {
    clearPosition();
    window.removeEventListener('scroll', positionContent, true);
    window.removeEventListener('resize', positionContent);
  }, [clearPosition, positionContent]);

  useEffect(
    () => () => {
      window.removeEventListener('scroll', positionContent, true);
      window.removeEventListener('resize', positionContent);
    },
    [positionContent],
  );

  return (
    <span
      ref={rootRef}
      className={`Tooltip${className ? ` ${className}` : ''}`}
      data-side={side}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span ref={contentRef} className="Tooltip-content" role="tooltip">
        {content}
      </span>
    </span>
  );
};

interface HintTriggerProps {
  label: string;
  size?: number;
}

export const HintTrigger = ({ label, size = 13 }: HintTriggerProps) => (
  <button type="button" className="Tooltip-trigger" aria-label={label}>
    <CircleHelp size={size} aria-hidden />
  </button>
);
