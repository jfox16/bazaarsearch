import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { TAG_HINT, tagChipHint } from 'data/filterHints';
import { useBazaarStore } from 'store/useBazaarStore';

export const TagFilter = () => {
  const tags = useBazaarStore((s) => s.facets.tags);
  const selected = useBazaarStore((s) => s.filter.tags);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Tags"
      hint={TAG_HINT}
      options={tags.map((t) => ({ value: t, label: t, hint: tagChipHint(t) }))}
      selected={selected}
      onToggle={(value) => toggleFilter('tags', value)}
      scroll
    />
  );
};
