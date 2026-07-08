import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { useBazaarStore } from 'store/useBazaarStore';

export const TierFilter = () => {
  const tiers = useBazaarStore((s) => s.facets.tiers);
  const selected = useBazaarStore((s) => s.filter.tiers);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Starting Tier"
      options={tiers.map((t) => ({ value: t, label: t }))}
      selected={selected}
      onToggle={(value) => toggleFilter('tiers', value)}
    />
  );
};
