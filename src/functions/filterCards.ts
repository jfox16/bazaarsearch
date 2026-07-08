import type { BazaarEntry, BazaarFilter, MatchGroup, Tier } from 'types/bazaar';

const TIER_ORDER: Record<Tier, number> = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Diamond: 3,
  Legendary: 4,
};

const matchesGroup = (haystack: string, group: MatchGroup): boolean => {
  const text = haystack.toLowerCase();
  const test = (value: string) => text.includes(value.toLowerCase());
  return group.matchAll ? group.values.every(test) : group.values.some(test);
};

const matchesTagGroup = (entryTags: Set<string>, group: MatchGroup): boolean => {
  const test = (value: string) => entryTags.has(value);
  return group.matchAll ? group.values.every(test) : group.values.some(test);
};

const matchesText = (entry: BazaarEntry, query: string): boolean => {
  const haystack = `${entry.name} ${entry.unifiedTooltips.join(' ')}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
};

const matchesTier = (
  tier: Tier | null,
  tiers: Set<Tier>,
  tierMin: Tier | null,
  tierMax: Tier | null,
): boolean => {
  if (!tier) return tiers.size === 0 && tierMin === null && tierMax === null;
  const order = TIER_ORDER[tier];
  if (tiers.size && !tiers.has(tier)) return false;
  if (tierMin && order < TIER_ORDER[tierMin]) return false;
  if (tierMax && order > TIER_ORDER[tierMax]) return false;
  return true;
};

export const filterCards = (entries: BazaarEntry[], filter: BazaarFilter): BazaarEntry[] => {
  const {
    text,
    kinds,
    heroes,
    sizes,
    tiers,
    tags,
    tagMatchAll,
    nameGroups,
    nameExact,
    tooltipGroups,
    tagGroups,
    tierMin,
    tierMax,
  } = filter;
  const query = text.trim();

  const result = entries.filter((entry) => {
    if (kinds.size && !kinds.has(entry.kind)) return false;
    if (heroes.size && !entry.heroes.some((h) => heroes.has(h))) return false;
    if (sizes.size && (!entry.size || !sizes.has(entry.size))) return false;
    if (!matchesTier(entry.startingTier, tiers, tierMin, tierMax)) return false;

    const entryTags = new Set([...entry.tags, ...entry.hiddenTags, ...entry.customTags]);

    if (tags.size) {
      if (tagMatchAll) {
        for (const tag of tags) if (!entryTags.has(tag)) return false;
      } else if (![...tags].some((tag) => entryTags.has(tag))) {
        return false;
      }
    }

    for (const group of tagGroups) {
      if (!matchesTagGroup(entryTags, group)) return false;
    }

    if (nameExact && entry.name.toLowerCase() !== nameExact.toLowerCase()) return false;

    for (const group of nameGroups) {
      if (!matchesGroup(entry.name, group)) return false;
    }

    const tooltipText = entry.unifiedTooltips.join(' ');
    for (const group of tooltipGroups) {
      if (!matchesGroup(tooltipText, group)) return false;
    }

    if (query && !matchesText(entry, query)) return false;
    return true;
  });

  return result.sort((a, b) => {
    const ta = a.startingTier ? TIER_ORDER[a.startingTier] : 99;
    const tb = b.startingTier ? TIER_ORDER[b.startingTier] : 99;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });
};
