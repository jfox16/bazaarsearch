import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

import { Tooltip } from 'components/Tooltip/Tooltip';
import { SEARCH_HINT } from 'data/filterHints';

import { useDebouncedValue } from 'hooks/useDebouncedValue';
import { formatHeroLabel } from 'functions/formatHeroLabel';
import { useBazaarStore, useDetectedFilters } from 'store/useBazaarStore';

import './TextFilter.scss';

export const TextFilter = () => {
  const setText = useBazaarStore((s) => s.setText);
  const [value, setValue] = useState('');
  const debounced = useDebouncedValue(value, 150);

  useEffect(() => {
    setText(debounced);
  }, [debounced, setText]);

  const detected = useDetectedFilters();
  const detectedLabels = useMemo(
    () => [
      ...detected.kinds,
      ...detected.heroes.map(formatHeroLabel),
      ...detected.sizes,
      ...detected.tiers,
      ...detected.tags,
    ],
    [detected],
  );

  return (
    <div className="TextFilter">
      <div className="TextFilter-box">
        <Tooltip content={SEARCH_HINT} side="bottom">
          <span className="TextFilter-help" tabIndex={0} aria-label="Search help">
            <Search className="TextFilter-icon" size={16} aria-hidden />
          </span>
        </Tooltip>
        <input
          className="TextFilter-input"
          type="text"
          placeholder="jules food  or  pyg large"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Search items and skills"
        />
        {value && (
          <button
            type="button"
            className="TextFilter-clear"
            onClick={() => setValue('')}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {detectedLabels.length > 0 && (
        <div className="TextFilter-detected" aria-label="Filters detected from search">
          {detectedLabels.map((label) => (
            <span key={label} className="TextFilter-chip">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
