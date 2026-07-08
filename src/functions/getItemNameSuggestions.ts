import type { BazaarEntry } from 'types/bazaar';

export interface NameSuggestion {
  name: string;
}

const FILTER_TOKEN_RE = /^(-)?([a-z]{1,2})(<=|>=|:|<|>|=)(.+)$/i;

export interface NameSearchToken {
  /** Substring used to match item names. */
  query: string;
  /** Start index of the token in the full input value. */
  start: number;
  /** End index of the token in the full input value. */
  end: number;
}

/**
 * Returns the plain word or partial `n:`/`n=` value at the cursor for name
 * autocomplete. Returns null when the active token is another filter prefix.
 */
export const getNameSearchToken = (value: string, cursor: number): NameSearchToken | null => {
  let start = cursor;
  let end = cursor;
  while (start > 0 && !/\s/.test(value[start - 1] ?? '')) start--;
  while (end < value.length && !/\s/.test(value[end] ?? '')) end++;

  const token = value.slice(start, end);
  if (!token) return null;

  const nameFilterMatch = token.match(/^(-)?n[:=](.*)$/i);
  if (nameFilterMatch) {
    const query = nameFilterMatch[2] ?? '';
    const prefixLen = token.length - query.length;
    return { query, start: start + prefixLen, end };
  }

  if (FILTER_TOKEN_RE.test(token)) return null;

  return { query: token, start, end };
};

export const getItemNameSuggestions = (
  entries: BazaarEntry[],
  query: string,
  limit = 8,
): NameSuggestion[] => {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const prefixMatches: string[] = [];
  const containsMatches: string[] = [];

  for (const entry of entries) {
    if (entry.kind !== 'item') continue;
    const lower = entry.name.toLowerCase();
    if (lower.startsWith(q)) prefixMatches.push(entry.name);
    else if (lower.includes(q)) containsMatches.push(entry.name);
  }

  prefixMatches.sort((a, b) => a.localeCompare(b));
  containsMatches.sort((a, b) => a.localeCompare(b));

  return [...prefixMatches, ...containsMatches].slice(0, limit).map((name) => ({ name }));
};

/** Builds a BazaarDB-style `n:` filter for the given item name. */
export const formatItemNameFilter = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return `n:${parts[0] ?? name}`;
  return `n:${parts.join('&')}`;
};
