import { describe, expect, it } from 'vitest';

import { createFilter } from 'test/fixtures';

import {
  applyUrlFilterState,
  parseUrlSearchParams,
  serializeFilterToSearch,
} from './filterUrlParams';

describe('filterUrlParams', () => {
  it('parses URL search params into filter and sort state', () => {
    const { filter, sort } = parseUrlSearchParams(
      '?q=hammer&kind=item,skill&hero=Vanessa&size=Medium&tier=Gold&type=Weapon&tag=Burn&neutral=0&sort=name&dir=desc',
    );

    expect(filter).toEqual({
      text: 'hammer',
      kinds: ['item', 'skill'],
      heroes: ['Vanessa'],
      sizes: ['Medium'],
      tiers: ['Gold'],
      types: ['Weapon'],
      tags: ['Burn'],
      showNeutral: false,
    });
    expect(sort).toEqual({ field: 'name', direction: 'desc' });
  });

  it('ignores invalid enum values', () => {
    const { filter, sort } = parseUrlSearchParams('?kind=foo&size=Huge&tier=Mythic&sort=price&dir=up');

    expect(filter.kinds).toEqual([]);
    expect(filter.sizes).toEqual([]);
    expect(filter.tiers).toEqual([]);
    expect(sort).toEqual({ field: 'rarity', direction: 'asc' });
  });

  it('serializes non-default filter and sort values', () => {
    const search = serializeFilterToSearch(
      createFilter({
        text: 'burn hammer',
        kinds: new Set(['item', 'skill']),
        heroes: new Set(['Vanessa']),
        sizes: new Set(['Medium']),
        tiers: new Set(['Gold']),
        types: new Set(['Weapon']),
        tags: new Set(['Burn']),
        showNeutral: false,
      }),
      { field: 'name', direction: 'desc' },
    );

    expect(search).toBe(
      'q=burn+hammer&kind=item%2Cskill&hero=Vanessa&size=Medium&tier=Gold&type=Weapon&tag=Burn&neutral=0&sort=name&dir=desc',
    );
  });

  it('round-trips chip filters through parse and serialize', () => {
    const original = createFilter({
      text: 'burn',
      heroes: new Set(['Vanessa']),
      tags: new Set(['Burn']),
    });
    const sort = { field: 'rarity' as const, direction: 'asc' as const };

    const parsed = parseUrlSearchParams(`?${serializeFilterToSearch(original, sort)}`);
    const roundTripped = applyUrlFilterState(original, parsed.filter);

    expect(roundTripped.text).toBe('burn');
    expect([...roundTripped.heroes]).toEqual(['Vanessa']);
    expect([...roundTripped.tags]).toEqual(['Burn']);
  });
});
