import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { useBazaarStore } from 'store/useBazaarStore';

import './TagFilter.scss';

export const TagFilter = () => {
  const tags = useBazaarStore((s) => s.facets.tags);
  const selected = useBazaarStore((s) => s.filter.tags);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);
  const tagMatchAll = useBazaarStore((s) => s.filter.tagMatchAll);
  const setTagMatchAll = useBazaarStore((s) => s.setTagMatchAll);

  const matchToggle = (
    <div className="TagFilter-match" role="group" aria-label="Tag match mode">
      <button
        type="button"
        className="TagFilter-matchBtn"
        data-active={!tagMatchAll}
        onClick={() => setTagMatchAll(false)}
      >
        Any
      </button>
      <button
        type="button"
        className="TagFilter-matchBtn"
        data-active={tagMatchAll}
        onClick={() => setTagMatchAll(true)}
      >
        All
      </button>
    </div>
  );

  return (
    <ChipToggleGroup
      label="Tags"
      options={tags.map((t) => ({ value: t, label: t }))}
      selected={selected}
      onToggle={(value) => toggleFilter('tags', value)}
      action={matchToggle}
      scroll
    />
  );
};
