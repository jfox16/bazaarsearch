import { ChipToggleGroup } from 'components/FilterForm/ChipToggleGroup';
import { TIER_HINT, tierChipHint } from 'data/filterHints';
import { useBazaarStore } from 'store/useBazaarStore';

export const TierFilter = () => {
  const tiers = useBazaarStore((s) => s.facets.tiers);
  const selected = useBazaarStore((s) => s.filter.tiers);
  const toggleFilter = useBazaarStore((s) => s.toggleFilter);

  return (
    <ChipToggleGroup
      label="Starting Tier"
      hint={TIER_HINT}
      options={tiers.map((t) => ({ value: t, label: t, hint: tierChipHint(t) }))}
      selected={selected}
      onToggle={(value) => toggleFilter('tiers', value)}
    />
  );
};
