import type { BazaarEntry, BazaarFilter, MatchGroup, SortOptions, Tier } from 'types/bazaar';

import { CARD_DESCRIPTIONS } from 'data/cardDescriptions';
import { NEUTRAL_HERO_POOL } from 'functions/formatHeroLabel';

import { sortEntries } from './sortEntries';

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
  const description = CARD_DESCRIPTIONS[entry.name] ?? '';
  const haystack =
    `${entry.name} ${description} ${entry.unifiedTooltips.join(' ')}`.toLowerCase();
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

const matchesSetFilter = (entryValues: Set<string>, selected: Set<string>): boolean => {
  if (!selected.size) return true;
  return [...selected].some((value) => entryValues.has(value));
};

const matchesHeroFilter = (
  entryHeroes: string[],
  selected: Set<string>,
  showNeutral: boolean,
): boolean => {
  if (!selected.size) return true;
  if (entryHeroes.some((hero) => selected.has(hero))) return true;
  return showNeutral && entryHeroes.includes(NEUTRAL_HERO_POOL);
};

export const filterCards = (
  entries: BazaarEntry[],
  filter: BazaarFilter,
  sort: SortOptions,
): BazaarEntry[] => {
  const {
    text,
    kinds,
    heroes,
    sizes,
    tiers,
    types,
    tags,
    nameGroups,
    nameExact,
    tooltipGroups,
    tagGroups,
    tierMin,
    tierMax,
    showNeutral,
  } = filter;
  const query = text.trim();

  const result = entries.filter((entry) => {
    if (kinds.size && !kinds.has(entry.kind)) return false;
    if (!matchesHeroFilter(entry.heroes, heroes, showNeutral)) return false;
    if (sizes.size && (!entry.size || !sizes.has(entry.size))) return false;
    if (!matchesTier(entry.startingTier, tiers, tierMin, tierMax)) return false;

    const entryTags = new Set([...entry.tags, ...entry.hiddenTags, ...entry.customTags]);
    const entryTypes = new Set(entry.tags);

    if (!matchesSetFilter(entryTypes, types)) return false;

    if (!matchesSetFilter(entryTags, tags)) return false;

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

  return sortEntries(result, sort);
};
