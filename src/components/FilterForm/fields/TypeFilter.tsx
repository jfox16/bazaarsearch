import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { ITEM_TYPE_HINT, typeChipHint } from 'data/filterHints';
import { useBazaarStore } from 'store/useBazaarStore';

export const TypeFilter = () => {
  const types = useBazaarStore((s) => s.facets.types);
  const selected = useBazaarStore((s) => s.filter.types);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Type"
      hint={ITEM_TYPE_HINT}
      options={types.map((t) => ({ value: t, label: t, hint: typeChipHint(t) }))}
      selected={selected}
      onToggle={(value) => toggleFilter('types', value)}
      scroll
    />
  );
};
