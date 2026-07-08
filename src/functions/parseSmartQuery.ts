import type { BazaarFilter, Facets, Kind } from 'types/bazaar';

/**
 * Turns a free-text query into implicit facet filters.
 *
 * Typing something like "jules regen", "pyg large items", "loot" or "fire"
 * automatically toggles the matching hero/size/kind/tier/tag filters, while any
 * words that don't map to a facet are left behind as a plain name/text search.
 *
 * Matching is token-based (whitespace separated) and case-insensitive. Each
 * token resolves to at most one facet, checked in priority order:
 * kind → hero → size → tag → tier. Tags win over tiers so "gold" (a tag) does
 * not get swallowed by the Gold starting tier.
 */

const KIND_ALIASES: Record<string, Kind> = {
  item: 'item',
  items: 'item',
  skill: 'skill',
  skills: 'skill',
};

/** Short/nickname aliases for heroes (full names are matched from facets). */
const HERO_ALIASES: Record<string, string> = {
  pyg: 'Pygmalien',
  van: 'Vanessa',
  ness: 'Vanessa',
};

const SIZE_ALIASES: Record<string, string> = {
  small: 'Small',
  sm: 'Small',
  medium: 'Medium',
  med: 'Medium',
  large: 'Large',
  lg: 'Large',
  lrg: 'Large',
  big: 'Large',
};

/** Common synonyms that map onto a real tag name. */
const TAG_ALIASES: Record<string, string> = {
  fire: 'Burn',
  burning: 'Burn',
  dmg: 'Damage',
  economy: 'Income',
  econ: 'Income',
};

const lower = (value: string) => value.toLowerCase();

/** Build a lowercased lookup { alias/value -> canonical facet value }. */
const buildLookup = (values: string[], aliases: Record<string, string> = {}) => {
  const map = new Map<string, string>();
  for (const value of values) map.set(lower(value), value);
  for (const [alias, canonical] of Object.entries(aliases)) map.set(lower(alias), canonical);
  return map;
};

export interface SmartQueryResult {
  filter: BazaarFilter;
  /** Facet values that were auto-detected from the text, for UI feedback. */
  detected: {
    kinds: Kind[];
    heroes: string[];
    sizes: string[];
    tiers: string[];
    tags: string[];
  };
}

/**
 * Merges any facets detected in `filter.text` into the explicit filter sets and
 * strips the consumed words from the text query.
 */
export const parseSmartQuery = (filter: BazaarFilter, facets: Facets): SmartQueryResult => {
  const empty: SmartQueryResult['detected'] = {
    kinds: [],
    heroes: [],
    sizes: [],
    tiers: [],
    tags: [],
  };

  const raw = filter.text.trim();

  // Preserve the power-user OR syntax ("burn | poison") as plain text search.
  if (!raw || raw.includes('|')) {
    return { filter, detected: empty };
  }

  const heroLookup = buildLookup(facets.heroes, HERO_ALIASES);
  const sizeLookup = buildLookup(facets.sizes, SIZE_ALIASES);
  const tierLookup = buildLookup(facets.tiers);
  const tagLookup = buildLookup(facets.tags, TAG_ALIASES);
  const tagSet = new Set(facets.tags);

  const kinds = new Set(filter.kinds);
  const heroes = new Set(filter.heroes);
  const sizes = new Set(filter.sizes);
  const tiers = new Set(filter.tiers);
  const tags = new Set(filter.tags);

  const detected: SmartQueryResult['detected'] = {
    kinds: [],
    heroes: [],
    sizes: [],
    tiers: [],
    tags: [],
  };

  const addTag = (tag: string) => {
    tags.add(tag);
    detected.tags.push(tag);
    // Auto-include the matching "*Reference" tag so e.g. "regen" also surfaces
    // items that reference regen, mirroring intent.
    const ref = `${tag}Reference`;
    if (tagSet.has(ref)) tags.add(ref);
  };

  const leftover: string[] = [];

  for (const token of raw.split(/\s+/)) {
    const key = lower(token);

    const kind = KIND_ALIASES[key];
    if (kind) {
      kinds.add(kind);
      detected.kinds.push(kind);
      continue;
    }

    const hero = heroLookup.get(key);
    if (hero) {
      heroes.add(hero);
      detected.heroes.push(hero);
      continue;
    }

    const size = sizeLookup.get(key);
    if (size) {
      sizes.add(size);
      detected.sizes.push(size);
      continue;
    }

    // Tags win over tiers so "gold" (tag) isn't consumed by the Gold tier.
    const tag = tagLookup.get(key) ?? (key.endsWith('s') ? tagLookup.get(key.slice(0, -1)) : undefined);
    if (tag) {
      addTag(tag);
      continue;
    }

    const tier = tierLookup.get(key);
    if (tier) {
      tiers.add(tier);
      detected.tiers.push(tier);
      continue;
    }

    leftover.push(token);
  }

  const detectedAnything =
    detected.kinds.length ||
    detected.heroes.length ||
    detected.sizes.length ||
    detected.tiers.length ||
    detected.tags.length;

  if (!detectedAnything) {
    return { filter, detected: empty };
  }

  return {
    filter: {
      ...filter,
      text: leftover.join(' '),
      kinds,
      heroes,
      sizes,
      tiers,
      tags,
    },
    detected,
  };
};
