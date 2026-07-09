import { describe, expect, it } from 'vitest';

import { createFilter, testFacets } from 'test/fixtures';

import { parseSmartQuery } from './parseSmartQuery';

describe('parseSmartQuery', () => {
  it('parses tag filters from t: syntax', () => {
    const result = parseSmartQuery(createFilter({ text: 't:burn' }), testFacets);

    expect(result.filter.text).toBe('');
    expect(result.filter.tagGroups).toEqual([
      { values: ['Burn'], matchAll: true },
    ]);
    expect(result.detected.tags).toContain('Burn');
  });

  it('parses OR groups with pipe syntax', () => {
    const result = parseSmartQuery(createFilter({ text: 't:burn|poison' }), testFacets);

    expect(result.filter.tagGroups).toEqual([
      { values: ['Burn', 'Poison'], matchAll: false },
    ]);
  });

  it('parses name and tooltip filters', () => {
    const result = parseSmartQuery(createFilter({ text: 'n:hammer o:burn' }), testFacets);

    expect(result.filter.nameGroups).toEqual([{ values: ['hammer'], matchAll: true }]);
    expect(result.filter.tooltipGroups).toEqual([{ values: ['burn'], matchAll: true }]);
  });

  it('parses exact name and tier range filters', () => {
    const result = parseSmartQuery(createFilter({ text: 'n=Hammer r<=s' }), testFacets);

    expect(result.filter.nameExact).toBe('Hammer');
    expect(result.filter.tierMax).toBe('Silver');
    expect(result.filter.tiers.size).toBe(0);
  });

  it('auto-resolves plain hero aliases', () => {
    const result = parseSmartQuery(createFilter({ text: 'van' }), testFacets);

    expect(result.filter.text).toBe('');
    expect([...result.filter.heroes]).toEqual(['Vanessa']);
    expect(result.detected.heroes).toContain('Vanessa');
  });

  it('preserves quoted text for free-text search', () => {
    const result = parseSmartQuery(createFilter({ text: 'van "burn damage"' }), testFacets);

    expect(result.filter.text).toBe('burn damage');
    expect([...result.filter.heroes]).toEqual(['Vanessa']);
  });

  it('returns the original filter when nothing is recognized', () => {
    const filter = createFilter({ text: 'xyzzy unknown' });
    const result = parseSmartQuery(filter, testFacets);

    expect(result.filter).toBe(filter);
    expect(result.detected).toEqual({
      kinds: [],
      heroes: [],
      sizes: [],
      tiers: [],
      types: [],
      tags: [],
    });
  });
});
