import { useEffect } from 'react';
import { X } from 'lucide-react';

import { FilterForm } from 'components/FilterForm/FilterForm';
import { useBazaarStore } from 'store/useBazaarStore';

import './MobileFilterDrawer.scss';

export const MobileFilterDrawer = () => {
  const open = useBazaarStore((s) => s.filterFormOpen);
  const setOpen = useBazaarStore((s) => s.setFilterFormOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="MobileFilterDrawer-overlay" onClick={() => setOpen(false)} role="presentation">
      <div className="MobileFilterDrawer" onClick={(e) => e.stopPropagation()}>
        <div className="MobileFilterDrawer-header">
          <span>Filters</span>
          <button
            type="button"
            className="MobileFilterDrawer-close"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        <div className="MobileFilterDrawer-body">
          <FilterForm />
        </div>
      </div>
    </div>
  );
};
