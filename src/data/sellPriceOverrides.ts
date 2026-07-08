import type { Tier } from 'types/bazaar';

/**
 * Per-tier merchant sell prices for items whose value isn't in howbazaar and
 * doesn't match the generic size/tier formula (tooltip: "Sells for Gold").
 * Sourced from BazaarDB / wiki.
 */
export const SELL_PRICE_OVERRIDES: Record<string, Partial<Record<Tier, number>>> = {
  // Bag of Jewels
  '5ded844c-5279-4c30-9198-309fba0b651b': {
    Bronze: 3,
    Silver: 6,
    Gold: 12,
    Diamond: 24,
  },
  // Bar of Gold
  '5a9bd869-4614-4edf-941d-5f44e0bb1519': {
    Bronze: 5,
    Silver: 10,
    Gold: 20,
    Diamond: 40,
  },
  // Chunk of Gold
  '0c8298ad-3001-4631-9bed-df11a7425ced': {
    Bronze: 2,
    Silver: 4,
    Gold: 6,
    Diamond: 8,
  },
  // Pelt
  'fb41fdef-d83b-4674-8cb3-9a224aa8f84a': {
    Bronze: 2,
    Silver: 4,
    Gold: 6,
    Diamond: 8,
  },
  // Spare Change
  'f212afe2-08d1-40e3-978b-762d345bc7e5': {
    Bronze: 1,
    Silver: 2,
    Gold: 3,
    Diamond: 4,
  },
};
