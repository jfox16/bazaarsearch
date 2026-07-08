import { SELL_PRICE_OVERRIDES } from 'data/sellPriceOverrides';
import type { BazaarEntry, Size, Tier } from 'types/bazaar';

const TIER_ORDER: Tier[] = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary'];

const TIER_INDEX: Record<Tier, number> = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Diamond: 3,
  Legendary: 4,
};

const SIZE_SLOTS: Record<Size, number> = {
  Small: 1,
  Medium: 2,
  Large: 3,
};

const ECONOMY_TAGS = new Set(['Value', 'Income', 'Economy', 'EconomyReference']);

const hasEconomyBonus = (entry: BazaarEntry): boolean =>
  [...entry.tags, ...entry.hiddenTags, ...entry.customTags].some((tag) => ECONOMY_TAGS.has(tag));

/**
 * Base merchant sell price for an item at a given quality tier.
 * Derived from size, starting rarity, and economy-related tags; upgrades double
 * the exponent step-wise as quality increases.
 */
export const getSellPrice = (entry: BazaarEntry, qualityTier: Tier): number | null => {
  if (entry.kind !== 'item' || !entry.size || !entry.startingTier) return null;

  const qualityIndex = TIER_INDEX[qualityTier];
  const startIndex = TIER_INDEX[entry.startingTier];
  const slots = SIZE_SLOTS[entry.size];

  if (qualityIndex < startIndex) return null;

  const override = SELL_PRICE_OVERRIDES[entry.id]?.[qualityTier];
  if (override !== undefined) return override;

  if (startIndex >= 2) return 2 ** qualityIndex;

  if (startIndex >= 1) return 2 ** (qualityIndex - startIndex + slots);

  if (hasEconomyBonus(entry) && slots === 3) return slots * 2 ** qualityIndex;

  if (hasEconomyBonus(entry)) return 2 ** (qualityIndex + 1);

  return 2 ** qualityIndex;
};

/** Sell price at the item's starting quality tier. */
export const getBaseSellPrice = (entry: BazaarEntry): number | null => {
  if (!entry.startingTier) return null;
  return getSellPrice(entry, entry.startingTier);
};

/** Sell prices for each quality tier this item can reach (starting tier upward). */
export const getSellPricesByTier = (entry: BazaarEntry): Partial<Record<Tier, number>> => {
  if (entry.kind !== 'item' || !entry.startingTier) return {};

  const startIndex = TIER_INDEX[entry.startingTier];
  const prices: Partial<Record<Tier, number>> = {};

  for (const tier of TIER_ORDER.slice(startIndex)) {
    const price = getSellPrice(entry, tier);
    if (price !== null) prices[tier] = price;
  }

  return prices;
};
