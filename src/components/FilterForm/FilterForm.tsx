import { X } from 'lucide-react';

import { DataStatus } from 'components/DataStatus/DataStatus';
import { isDefaultKinds } from 'functions/filterDefaults';
import { useBazaarStore, useFilteredEntries } from 'store/useBazaarStore';

import { TextFilter } from './fields/TextFilter';
import { KindFilter } from './fields/KindFilter';
import { HeroFilter } from './fields/HeroFilter';
import { SizeFilter } from './fields/SizeFilter';
import { TierFilter } from './fields/TierFilter';
import { TypeFilter } from './fields/TypeFilter';
import { TagFilter } from './fields/TagFilter';

import './FilterForm.scss';

export const FilterForm = () => {
  const filter = useBazaarStore((s) => s.filter);
  const clearFilters = useBazaarStore((s) => s.clearFilters);
  const textFilterKey = useBazaarStore((s) => s.textFilterKey);
  const totalCount = useBazaarStore((s) => s.entries.length);
  const filtered = useFilteredEntries();

  const isActive =
    filter.text.trim() !== '' ||
    !isDefaultKinds(filter.kinds) ||
    filter.heroes.size > 0 ||
    filter.sizes.size > 0 ||
    filter.tiers.size > 0 ||
    filter.types.size > 0 ||
    filter.tags.size > 0;

  return (
    <div className="FilterForm">
      <div className="FilterForm-count">
        <strong>{filtered.length.toLocaleString()}</strong> of {totalCount.toLocaleString()}
        {isActive && (
          <button type="button" className="FilterForm-clear" onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      <TextFilter key={textFilterKey} />
      <KindFilter />
      <HeroFilter />
      <SizeFilter />
      <TierFilter />
      <TypeFilter />
      <TagFilter />

      <DataStatus />
    </div>
  );
};
