import type { BazaarEntry, BazaarFilter } from 'types/bazaar';

const TIER_ORDER: Record<string, number> = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Diamond: 3,
  Legendary: 4,
};

const matchesText = (entry: BazaarEntry, query: string): boolean => {
  // Support howbazaar-style OR search with "|" (e.g. "burn | poison").
  const terms = query
    .split('|')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = `${entry.name} ${entry.unifiedTooltips.join(' ')}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
};

export const filterCards = (entries: BazaarEntry[], filter: BazaarFilter): BazaarEntry[] => {
  const { text, kinds, heroes, sizes, tiers, tags, tagMatchAll } = filter;
  const query = text.trim();

  const result = entries.filter((entry) => {
    if (kinds.size && !kinds.has(entry.kind)) return false;
    if (heroes.size && !entry.heroes.some((h) => heroes.has(h))) return false;
    if (sizes.size && (!entry.size || !sizes.has(entry.size))) return false;
    if (tiers.size && (!entry.startingTier || !tiers.has(entry.startingTier))) return false;

    if (tags.size) {
      const entryTags = new Set([...entry.tags, ...entry.hiddenTags, ...entry.customTags]);
      if (tagMatchAll) {
        for (const tag of tags) if (!entryTags.has(tag)) return false;
      } else {
        let hasAny = false;
        for (const tag of tags) {
          if (entryTags.has(tag)) {
            hasAny = true;
            break;
          }
        }
        if (!hasAny) return false;
      }
    }

    if (query && !matchesText(entry, query)) return false;
    return true;
  });

  // Sort by starting tier, then name, for a stable, scannable grid.
  return result.sort((a, b) => {
    const ta = TIER_ORDER[a.startingTier ?? ''] ?? 99;
    const tb = TIER_ORDER[b.startingTier ?? ''] ?? 99;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });
};
