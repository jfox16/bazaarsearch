import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { HERO_HINT, heroChipHint } from 'data/filterHints';
import { formatHeroLabel } from 'functions/formatHeroLabel';
import { useBazaarStore } from 'store/useBazaarStore';

export const HeroFilter = () => {
  const heroes = useBazaarStore((s) => s.facets.heroes);
  const selected = useBazaarStore((s) => s.filter.heroes);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Hero"
      hint={HERO_HINT}
      options={heroes.map((h) => ({ value: h, label: formatHeroLabel(h), hint: heroChipHint(h) }))}
      selected={selected}
      onToggle={(value) => toggleFilter('heroes', value)}
    />
  );
};
