import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { Tooltip } from 'components/Tooltip/Tooltip';
import { TAG_HINT, TAG_MATCH_ALL_HINT, TAG_MATCH_ANY_HINT, tagChipHint } from 'data/filterHints';
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
      <Tooltip content={TAG_MATCH_ANY_HINT}>
        <button
          type="button"
          className="TagFilter-matchBtn"
          data-active={!tagMatchAll}
          onClick={() => setTagMatchAll(false)}
        >
          Any
        </button>
      </Tooltip>
      <Tooltip content={TAG_MATCH_ALL_HINT}>
        <button
          type="button"
          className="TagFilter-matchBtn"
          data-active={tagMatchAll}
          onClick={() => setTagMatchAll(true)}
        >
          All
        </button>
      </Tooltip>
    </div>
  );

  return (
    <ChipToggleGroup
      label="Tags"
      hint={TAG_HINT}
      options={tags.map((t) => ({ value: t, label: t, hint: tagChipHint(t) }))}
      selected={selected}
      onToggle={(value) => toggleFilter('tags', value)}
      action={matchToggle}
      scroll
    />
  );
};
