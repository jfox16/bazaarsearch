import { CARD_DESCRIPTIONS } from 'data/cardDescriptions';
import type { BazaarEntry } from 'types/bazaar';

/**
 * The curated short description for a statless card, shown in the tile list
 * view. Returns null when no description has been written yet (the map is
 * intentionally incomplete), in which case nothing is rendered.
 */
export const getCardBlurb = (entry: BazaarEntry): string | null => {
  return CARD_DESCRIPTIONS[entry.name] ?? null;
};
