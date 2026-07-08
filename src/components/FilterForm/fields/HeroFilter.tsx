import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { useBazaarStore } from 'store/useBazaarStore';

export const HeroFilter = () => {
  const heroes = useBazaarStore((s) => s.facets.heroes);
  const selected = useBazaarStore((s) => s.filter.heroes);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Hero"
      options={heroes.map((h) => ({ value: h, label: h }))}
      selected={selected}
      onToggle={(value) => toggleFilter('heroes', value)}
    />
  );
};
