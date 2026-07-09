import type { BazaarEntry, Tier } from 'types/bazaar';

const TIER_ORDER: Tier[] = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary'];

/** Quality tiers that have at least one tooltip, in ascending order. */
export const getActiveTiers = (entry: BazaarEntry): Tier[] =>
  TIER_ORDER.filter((tier) => (entry.tiers[tier] ?? []).length > 0);
