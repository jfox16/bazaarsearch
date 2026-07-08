import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { TYPE_HINT, kindChipHint } from 'data/filterHints';
import { useBazaarStore } from 'store/useBazaarStore';

const OPTIONS = [
  { value: 'item', label: 'Items', hint: kindChipHint('item') },
  { value: 'skill', label: 'Skills', hint: kindChipHint('skill') },
];

export const KindFilter = () => {
  const selected = useBazaarStore((s) => s.filter.kinds) as Set<string>;
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Type"
      hint={TYPE_HINT}
      options={OPTIONS}
      selected={selected}
      onToggle={(value) => toggleFilter('kinds', value)}
    />
  );
};
