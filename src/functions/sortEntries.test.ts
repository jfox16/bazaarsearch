import { describe, expect, it } from 'vitest';

import { createEntry } from 'test/fixtures';

import { sortEntries } from './sortEntries';

describe('sortEntries', () => {
  const entries = [
    createEntry({ name: 'Zeta', startingTier: 'Gold' }),
    createEntry({ name: 'Alpha', startingTier: 'Bronze' }),
    createEntry({ name: 'Beta', startingTier: 'Silver' }),
  ];

  it('sorts by name ascending', () => {
    const sorted = sortEntries(entries, { field: 'name', direction: 'asc' });
    expect(sorted.map((entry) => entry.name)).toEqual(['Alpha', 'Beta', 'Zeta']);
  });

  it('sorts by name descending', () => {
    const sorted = sortEntries(entries, { field: 'name', direction: 'desc' });
    expect(sorted.map((entry) => entry.name)).toEqual(['Zeta', 'Beta', 'Alpha']);
  });

  it('sorts by rarity ascending with name as tiebreaker', () => {
    const sorted = sortEntries(entries, { field: 'rarity', direction: 'asc' });
    expect(sorted.map((entry) => entry.name)).toEqual(['Alpha', 'Beta', 'Zeta']);
  });

  it('does not mutate the input array', () => {
    const copy = [...entries];
    sortEntries(entries, { field: 'name', direction: 'asc' });
    expect(entries.map((entry) => entry.name)).toEqual(copy.map((entry) => entry.name));
  });
});
