import { describe, expect, it } from 'vitest';

import { getSearchQueryTokenAtCursor, tokenizeSearchQuery } from './tokenizeSearchQuery';

describe('tokenizeSearchQuery', () => {
  it('splits on whitespace', () => {
    expect(tokenizeSearchQuery('hammer t:burn').map((token) => token.value)).toEqual([
      'hammer',
      't:burn',
    ]);
  });

  it('keeps quoted phrases as a single token', () => {
    const tokens = tokenizeSearchQuery('jules "burn poison" t:item');
    expect(tokens.map((token) => token.value)).toEqual(['jules', 'burn poison', 't:item']);
    expect(tokens[1]?.quoted).toBe(true);
  });

  it('handles empty and whitespace-only input', () => {
    expect(tokenizeSearchQuery('')).toEqual([]);
    expect(tokenizeSearchQuery('   ')).toEqual([]);
  });
});

describe('getSearchQueryTokenAtCursor', () => {
  it('returns the token containing the cursor', () => {
    const text = 'van t:burn';
    expect(getSearchQueryTokenAtCursor(text, 1)?.value).toBe('van');
    expect(getSearchQueryTokenAtCursor(text, 6)?.value).toBe('t:burn');
  });

  it('returns null when the cursor is outside any token', () => {
    expect(getSearchQueryTokenAtCursor('van', 10)).toBeNull();
  });
});
