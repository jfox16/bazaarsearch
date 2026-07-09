import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { HERO_HINT } from 'data/filterHints';
import { formatHeroLabel } from 'functions/formatHeroLabel';
import { useBazaarStore } from 'store/useBazaarStore';

import './HeroFilter.scss';

export const HeroFilter = () => {
  const heroes = useBazaarStore((s) => s.facets.heroes);
  const selected = useBazaarStore((s) => s.filter.heroes);
  const showNeutral = useBazaarStore((s) => s.filter.showNeutral);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);
  const setShowNeutral = useBazaarStore((s) => s.setShowNeutral);

  return (
    <ChipToggleGroup
      label="Hero"
      hint={HERO_HINT}
      headerExtra={
        <label className="HeroFilter-neutral">
          <input
            type="checkbox"
            checked={showNeutral}
            onChange={(e) => setShowNeutral(e.target.checked)}
          />
          Show Neutral
        </label>
      }
      options={heroes.map((h) => ({ value: h, label: formatHeroLabel(h) }))}
      selected={selected}
      onToggle={(value) => toggleFilter('heroes', value)}
    />
  );
};
