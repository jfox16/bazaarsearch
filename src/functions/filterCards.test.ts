import { describe, expect, it } from 'vitest';

import { createEntry, createFilter } from 'test/fixtures';

import { filterCards } from './filterCards';

const defaultSort = { field: 'name' as const, direction: 'asc' as const };
const allKinds = new Set(['item', 'skill'] as const);

describe('filterCards', () => {
  const entries = [
    createEntry({
      id: '1',
      name: 'Burn Hammer',
      kind: 'item',
      heroes: ['Vanessa'],
      tags: ['Weapon'],
      hiddenTags: ['Burn'],
      unifiedTooltips: ['Deal burn damage'],
      startingTier: 'Gold',
    }),
    createEntry({
      id: '2',
      name: 'Poison Dart',
      kind: 'item',
      heroes: ['Pygmalien'],
      tags: ['Weapon'],
      hiddenTags: ['Poison'],
      unifiedTooltips: ['Apply poison'],
      startingTier: 'Silver',
    }),
    createEntry({
      id: '3',
      name: 'Fire Skill',
      kind: 'skill',
      heroes: ['Vanessa'],
      tags: ['Skill'],
      hiddenTags: ['Burn'],
      unifiedTooltips: ['Channel burn'],
      startingTier: 'Bronze',
      size: null,
    }),
    createEntry({
      id: '4',
      name: 'Neutral Trinket',
      kind: 'item',
      heroes: ['Common'],
      tags: ['Toy'],
      hiddenTags: [],
      unifiedTooltips: ['Everyone can use this'],
      startingTier: 'Bronze',
    }),
  ];

  it('filters by kind', () => {
    const result = filterCards(
      entries,
      createFilter({ kinds: new Set(['skill']) }),
      defaultSort,
    );

    expect(result.map((entry) => entry.name)).toEqual(['Fire Skill']);
  });

  it('filters by inline tag groups', () => {
    const result = filterCards(
      entries,
      createFilter({
        kinds: allKinds,
        tagGroups: [{ values: ['Burn'], matchAll: true }],
      }),
      defaultSort,
    );

    expect(result.map((entry) => entry.name)).toEqual(['Burn Hammer', 'Fire Skill']);
  });

  it('filters by hero and includes neutral items by default', () => {
    const result = filterCards(
      entries,
      createFilter({ kinds: allKinds, heroes: new Set(['Vanessa']) }),
      defaultSort,
    );

    expect(result.map((entry) => entry.name)).toEqual([
      'Burn Hammer',
      'Fire Skill',
      'Neutral Trinket',
    ]);
  });

  it('excludes neutral items when showNeutral is false', () => {
    const result = filterCards(
      entries,
      createFilter({
        kinds: allKinds,
        heroes: new Set(['Vanessa']),
        showNeutral: false,
      }),
      defaultSort,
    );

    expect(result.map((entry) => entry.name)).toEqual(['Burn Hammer', 'Fire Skill']);
  });

  it('filters by tier range', () => {
    const result = filterCards(
      entries,
      createFilter({ kinds: allKinds, tierMax: 'Silver' }),
      defaultSort,
    );

    expect(result.map((entry) => entry.name)).toEqual(['Fire Skill', 'Neutral Trinket', 'Poison Dart']);
  });

  it('matches free-text against names and tooltips', () => {
    const result = filterCards(entries, createFilter({ text: 'poison' }), defaultSort);

    expect(result.map((entry) => entry.name)).toEqual(['Poison Dart']);
  });
});
