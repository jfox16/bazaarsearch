import type { BazaarEntry, BazaarFilter, Facets } from 'types/bazaar';

export const createEntry = (overrides: Partial<BazaarEntry> = {}): BazaarEntry => ({
  id: 'test-id',
  name: 'Test Card',
  kind: 'item',
  size: 'Medium',
  startingTier: 'Gold',
  heroes: ['Vanessa'],
  tags: ['Weapon'],
  hiddenTags: ['Burn'],
  customTags: [],
  tiers: {},
  unifiedTooltips: ['Deal 10 burn damage'],
  imageUrl: '',
  ...overrides,
});

export const createFilter = (overrides: Partial<BazaarFilter> = {}): BazaarFilter => ({
  text: '',
  kinds: new Set(['item']),
  heroes: new Set(),
  sizes: new Set(),
  tiers: new Set(),
  types: new Set(),
  tags: new Set(),
  nameGroups: [],
  nameExact: null,
  tooltipGroups: [],
  tagGroups: [],
  tierMin: null,
  tierMax: null,
  showNeutral: true,
  ...overrides,
});

export const testFacets: Facets = {
  heroes: ['Vanessa', 'Pygmalien', 'Dooley'],
  sizes: ['Small', 'Medium', 'Large'],
  tiers: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary'],
  types: ['Weapon', 'Potion', 'Toy'],
  tags: ['Weapon', 'Potion', 'Toy', 'Burn', 'Poison'],
  enchantments: [],
};
