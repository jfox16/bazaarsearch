import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { KIND_HINT } from 'data/filterHints';
import { useBazaarStore } from 'store/useBazaarStore';

const OPTIONS = [
  { value: 'item', label: 'Items' },
  { value: 'skill', label: 'Skills' },
];

export const KindFilter = () => {
  const selected = useBazaarStore((s) => s.filter.kinds) as Set<string>;
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Kind"
      hint={KIND_HINT}
      options={OPTIONS}
      selected={selected}
      onToggle={(value) => toggleFilter('kinds', value)}
    />
  );
};
