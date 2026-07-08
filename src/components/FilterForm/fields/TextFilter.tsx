import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

import { useDebouncedValue } from 'hooks/useDebouncedValue';
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
      ...detected.heroes,
      ...detected.sizes,
      ...detected.tiers,
      ...detected.tags,
    ],
    [detected],
  );

  return (
    <div className="TextFilter">
      <div className="TextFilter-box">
        <Search className="TextFilter-icon" size={16} aria-hidden />
        <input
          className="TextFilter-input"
          type="text"
          placeholder="Search — try jules regen, pyg large, loot..."
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
