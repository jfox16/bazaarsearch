import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

import { useBazaarStore } from 'store/useBazaarStore';
import type { SortField } from 'types/bazaar';

import './SortBar.scss';

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'rarity', label: 'Rarity' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'kind', label: 'Kind' },
  { value: 'hero', label: 'Hero' },
];

export const SortBar = () => {
  const sort = useBazaarStore((s) => s.sort);
  const setSortField = useBazaarStore((s) => s.setSortField);
  const toggleSortDirection = useBazaarStore((s) => s.toggleSortDirection);

  return (
    <div className="SortBar">
      <label className="SortBar-label" htmlFor="sort-field">
        Sort by
      </label>
      <select
        id="sort-field"
        className="SortBar-select"
        value={sort.field}
        onChange={(e) => setSortField(e.target.value as SortField)}
      >
        {SORT_FIELDS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="SortBar-direction"
        onClick={toggleSortDirection}
        aria-label={sort.direction === 'asc' ? 'Sort ascending' : 'Sort descending'}
        title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sort.direction === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
      </button>
    </div>
  );
};
