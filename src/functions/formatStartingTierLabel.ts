import type { Tier } from 'types/bazaar';

/** Display label for an item/skill starting tier in the detail pill. */
export const formatStartingTierLabel = (tier: Tier): string => {
  if (tier === 'Bronze' || tier === 'Silver' || tier === 'Gold') return `${tier}+`;
  return tier;
};
