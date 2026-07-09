import type { BazaarEntry, Size, SortOptions, Tier } from 'types/bazaar';

const TIER_ORDER: Record<Tier, number> = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Diamond: 3,
  Legendary: 4,
};

const SIZE_ORDER: Record<Size, number> = {
  Small: 0,
  Medium: 1,
  Large: 2,
};

const compareField = (a: BazaarEntry, b: BazaarEntry, field: SortOptions['field']): number => {
  switch (field) {
    case 'rarity': {
      const ta = a.startingTier ? TIER_ORDER[a.startingTier] : 99;
      const tb = b.startingTier ? TIER_ORDER[b.startingTier] : 99;
      return ta - tb;
    }
    case 'name':
      return a.name.localeCompare(b.name);
    case 'size': {
      const sa = a.size ? SIZE_ORDER[a.size] : 99;
      const sb = b.size ? SIZE_ORDER[b.size] : 99;
      return sa - sb;
    }
    case 'kind':
      return a.kind.localeCompare(b.kind);
    case 'hero': {
      const ha = a.heroes[0] ?? '';
      const hb = b.heroes[0] ?? '';
      return ha.localeCompare(hb) || a.name.localeCompare(b.name);
    }
  }
};

export const sortEntries = (entries: BazaarEntry[], sort: SortOptions): BazaarEntry[] => {
  const dir = sort.direction === 'asc' ? 1 : -1;

  return [...entries].sort((a, b) => {
    const cmp = compareField(a, b, sort.field);
    if (cmp !== 0) return cmp * dir;
    return a.name.localeCompare(b.name);
  });
};
