import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { useBazaarStore } from 'store/useBazaarStore';

export const SizeFilter = () => {
  const sizes = useBazaarStore((s) => s.facets.sizes);
  const selected = useBazaarStore((s) => s.filter.sizes);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Size"
      options={sizes.map((s) => ({ value: s, label: s }))}
      selected={selected}
      onToggle={(value) => toggleFilter('sizes', value)}
    />
  );
};
