import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { SIZE_HINT } from 'data/filterHints';
import { useBazaarStore } from 'store/useBazaarStore';

export const SizeFilter = () => {
  const sizes = useBazaarStore((s) => s.facets.sizes);
  const selected = useBazaarStore((s) => s.filter.sizes);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Size"
      hint={SIZE_HINT}
      options={sizes.map((s) => ({ value: s, label: s }))}
      selected={selected}
      onToggle={(value) => toggleFilter('sizes', value)}
    />
  );
};
