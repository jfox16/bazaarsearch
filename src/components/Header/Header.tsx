import { SlidersHorizontal } from 'lucide-react';

import { useBazaarStore } from 'store/useBazaarStore';
import { useIsMobile } from 'hooks/useIsMobile';

import './Header.scss';

export const Header = () => {
  const isMobile = useIsMobile();
  const setFilterFormOpen = useBazaarStore((s) => s.setFilterFormOpen);

  return (
    <header className="Header">
      <div className="Header-brand">
        <span className="Header-mark">B</span>
        <span className="Header-title">Bazaar Search</span>
      </div>
      {isMobile && (
        <button
          type="button"
          className="Header-filterBtn"
          onClick={() => setFilterFormOpen(true)}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      )}
    </header>
  );
};
