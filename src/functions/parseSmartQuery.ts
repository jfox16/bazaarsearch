import type { BazaarFilter, Facets, Kind, MatchGroup, Tier } from 'types/bazaar';

import {
  HERO_ALIASES,
  KIND_ALIASES,
  SIZE_ALIASES,
  TAG_ALIASES,
  TIER_ALIASES,
} from './searchAliases';

/**
 * Parses BazaarDB-style inline search filters from the text query.
 *
 * Filters use a key, an operator, and a value — e.g. `t:burn`, `n:hammer`,
 * `r<=s`, `s:m`. Space-separated filters are ANDed. Within a value, `|` is OR
 * and `&` is AND.
 *
 * @see https://bazaardb.gg/docs
 *
 * Supported filters:
 * - n  — partial name match (`n=hammer` for exact)
 * - t  — tag, hero, or type (`t:item`, `t:vanessa`, `t:burn|poison`)
 * - s  — size (`s`, `m`, `l` or full names)
 * - r  — starting tier (`b`, `s`, `g`, `d`, `l`; supports <= and >=)
 * - o  — tooltip text (`o:burn|poison`)
 *
 * Plain words without a filter prefix are auto-resolved as hero, tag, size, tier,
 * or type when recognized; any other words are combined and matched against
 * names and descriptions. Use quotes to skip alias detection — e.g. `jules "burn"`.
 */

import { tokenizeSearchQuery, type SearchQueryToken } from './tokenizeSearchQuery';

const FILTER_TOKEN_RE = /^(-)?([a-z]{1,2})(<=|>=|:|<|>|=)(.+)$/i;

const lower = (value: string) => value.toLowerCase();

const buildLookup = (values: string[], aliases: Record<string, string> = {}) => {
  const map = new Map<string, string>();
  for (const value of values) map.set(lower(value), value);
  for (const [alias, canonical] of Object.entries(aliases)) map.set(lower(alias), canonical);
  return map;
};

const splitFilterValues = (raw: string): MatchGroup => {
  if (raw.includes('&')) {
    return { values: raw.split('&').map((v) => v.trim()).filter(Boolean), matchAll: true };
  }
  if (raw.includes('|')) {
    return { values: raw.split('|').map((v) => v.trim()).filter(Boolean), matchAll: false };
  }
  return { values: [raw.trim()].filter(Boolean), matchAll: true };
};

interface ParsedFilterToken {
  key: string;
  op: string;
  value: string;
  negate: boolean;
}

const parseFilterToken = (token: string): ParsedFilterToken | null => {
  const match = token.match(FILTER_TOKEN_RE);
  if (!match) return null;
  const [, negatePrefix, key, op, value] = match;
  if (!value) return null;
  return { key: key.toLowerCase(), op, value, negate: negatePrefix === '-' };
};

export interface SmartQueryResult {
  filter: BazaarFilter;
  /** Facet values auto-detected from inline filters, for UI feedback. */
  detected: {
    kinds: Kind[];
    heroes: string[];
    sizes: string[];
    tiers: string[];
    types: string[];
    tags: string[];
  };
}

const emptyDetected = (): SmartQueryResult['detected'] => ({
  kinds: [],
  heroes: [],
  sizes: [],
  tiers: [],
  types: [],
  tags: [],
});

/**
 * Merges inline `filter:value` tokens from `filter.text` into the explicit filter
 * state and strips consumed tokens from the text query.
 */
export const parseSmartQuery = (filter: BazaarFilter, facets: Facets): SmartQueryResult => {
  const raw = filter.text.trim();
  if (!raw) return { filter, detected: emptyDetected() };

  const heroLookup = buildLookup(facets.heroes, HERO_ALIASES);
  const typeLookup = buildLookup(facets.types);
  const typeSet = new Set(facets.types);
  const tagLookup = buildLookup(facets.tags, TAG_ALIASES);
  const tagSet = new Set(facets.tags);

  const kinds = new Set(filter.kinds);
  const heroes = new Set(filter.heroes);
  const sizes = new Set(filter.sizes);
  const tiers = new Set(filter.tiers);
  const types = new Set(filter.types);
  const tags = new Set(filter.tags);
  const tagGroups = [...filter.tagGroups];
  const nameGroups = [...filter.nameGroups];
  const tooltipGroups = [...filter.tooltipGroups];

  let nameExact = filter.nameExact;
  let tierMin = filter.tierMin;
  let tierMax = filter.tierMax;

  const detected: SmartQueryResult['detected'] = emptyDetected();

  const resolveTagValues = (group: MatchGroup): MatchGroup => {
    const values: string[] = [];
    for (const part of group.values) {
      const key = lower(part);
      const kind = KIND_ALIASES[key];
      if (kind) {
        kinds.clear();
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

      const type =
        typeLookup.get(key) ?? (key.endsWith('s') ? typeLookup.get(key.slice(0, -1)) : undefined);
      if (type) {
        types.add(type);
        values.push(type);
        detected.types.push(type);
        continue;
      }

      const tag =
        tagLookup.get(key) ?? (key.endsWith('s') ? tagLookup.get(key.slice(0, -1)) : undefined);
      if (tag) {
        values.push(tag);
        if (typeSet.has(tag)) {
          types.add(tag);
          detected.types.push(tag);
        } else {
          tags.add(tag);
          detected.tags.push(tag);
        }
        const ref = `${tag}Reference`;
        if (tagSet.has(ref)) values.push(ref);
        continue;
      }
    }
    return { ...group, values };
  };

  const resolveTier = (value: string): Tier | undefined => TIER_ALIASES[lower(value)];

  const resolvePlainToken = (token: string): boolean => {
    const heroesBefore = heroes.size;
    const kindsBefore = kinds.size;
    const typesBefore = types.size;
    const tagsBefore = tags.size;

    const group = { values: [token], matchAll: true };
    const resolved = resolveTagValues(group);
    if (resolved.values.length) {
      tagGroups.push(resolved);
      return true;
    }
    if (
      heroes.size > heroesBefore ||
      kinds.size > kindsBefore ||
      types.size > typesBefore ||
      tags.size > tagsBefore
    ) {
      return true;
    }

    const size = SIZE_ALIASES[lower(token)];
    if (size) {
      sizes.add(size);
      detected.sizes.push(size);
      return true;
    }

    const tier = resolveTier(token);
    if (tier) {
      tiers.add(tier);
      detected.tiers.push(tier);
      return true;
    }

    return false;
  };

  const leftover: SearchQueryToken[] = [];

  for (const token of tokenizeSearchQuery(raw)) {
    if (token.quoted) {
      leftover.push(token);
      continue;
    }

    const parsed = parseFilterToken(token.value);
    if (!parsed || parsed.negate) {
      leftover.push(token);
      continue;
    }

    const { key, op, value } = parsed;
    const group = splitFilterValues(value);

    switch (key) {
      case 'n': {
        if (op === '=') {
          nameExact = value;
        } else {
          nameGroups.push(group);
        }
        break;
      }

      case 't': {
        const resolved = resolveTagValues(group);
        if (resolved.values.length) tagGroups.push(resolved);
        break;
      }

      case 's': {
        for (const part of group.values) {
          const size = SIZE_ALIASES[lower(part)];
          if (size) {
            sizes.add(size);
            detected.sizes.push(size);
          }
        }
        break;
      }

      case 'r': {
        const tier = resolveTier(group.values[0] ?? value);
        if (!tier) break;

        if (op === ':' || op === '=') {
          tiers.add(tier);
          detected.tiers.push(tier);
        } else if (op === '<=' || op === '<') {
          tierMax = tier;
          detected.tiers.push(`<=${tier}`);
        } else if (op === '>=' || op === '>') {
          tierMin = tier;
          detected.tiers.push(`>=${tier}`);
        }
        break;
      }

      case 'o': {
        tooltipGroups.push(group);
        break;
      }

      default:
        leftover.push(token);
    }
  }

  const textParts: string[] = [];
  for (const token of leftover) {
    if (token.quoted) {
      if (token.value) textParts.push(token.value);
      continue;
    }
    if (!resolvePlainToken(token.value)) textParts.push(token.value);
  }

  const searchText = textParts.join(' ');
  const hasQuotedTokens = leftover.some((token) => token.quoted);

  const detectedAnything =
    detected.kinds.length ||
    detected.heroes.length ||
    detected.sizes.length ||
    detected.tiers.length ||
    detected.types.length ||
    detected.tags.length ||
    nameGroups.length > filter.nameGroups.length ||
    tooltipGroups.length > filter.tooltipGroups.length ||
    tagGroups.length > filter.tagGroups.length ||
    nameExact !== filter.nameExact ||
    tierMin !== filter.tierMin ||
    tierMax !== filter.tierMax;

  if (!detectedAnything && !hasQuotedTokens && searchText === raw) {
    return { filter, detected: emptyDetected() };
  }

  return {
    filter: {
      ...filter,
      text: searchText,
      kinds,
      heroes,
      sizes,
      tiers,
      types,
      tags,
      tagGroups,
      nameGroups,
      tooltipGroups,
      nameExact,
      tierMin,
      tierMax,
    },
    detected,
  };
};
