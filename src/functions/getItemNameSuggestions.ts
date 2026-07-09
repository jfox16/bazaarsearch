import type { BazaarEntry } from 'types/bazaar';

import {
  getSearchQueryTokenAtCursor,
  tokenizeSearchQuery,
  type SearchQueryToken,
} from './tokenizeSearchQuery';

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

interface NameSearchWord {
  start: number;
  end: number;
  text: string;
}

const toNameSearchWord = (token: SearchQueryToken): NameSearchWord => ({
  start: token.start,
  end: token.end,
  text: token.value,
});

const collectNameSearchWords = (value: string, cursor: number): NameSearchWord[] => {
  const activeToken = getSearchQueryTokenAtCursor(value, cursor);
  if (!activeToken) return [];

  if (activeToken.quoted) {
    const contentStart = activeToken.start + 1;
    const contentEnd = Math.min(
      cursor,
      activeToken.end - (value[activeToken.end - 1] === '"' ? 1 : activeToken.end),
    );
    const text = value.slice(contentStart, Math.max(contentStart, contentEnd));
    return [{ start: contentStart, end: Math.max(contentStart, contentEnd), text }];
  }

  const words: NameSearchWord[] = [];
  for (const token of tokenizeSearchQuery(value)) {
    if (token.quoted) continue;
    if (token.start > cursor) break;
    if (FILTER_TOKEN_RE.test(token.value)) break;
    words.push(toNameSearchWord(token));
    if (cursor >= token.start && cursor <= token.end) break;
  }

  return words;
};

const normalizeNameSearchWord = (text: string): string | null => {
  const nameFilterMatch = text.match(/^(-)?n[:=](.*)$/i);
  if (nameFilterMatch) return nameFilterMatch[2] ?? '';
  if (FILTER_TOKEN_RE.test(text)) return null;
  return text;
};

const phraseMatchesItemName = (entries: BazaarEntry[], phrase: string): boolean => {
  const q = phrase.trim().toLowerCase();
  if (q.length < 2) return false;
  return entries.some(
    (entry) => entry.kind === 'item' && entry.name.toLowerCase().includes(q),
  );
};

/** Picks the longest word phrase at the cursor that matches item names. */
export const resolveNameSearchQuery = (
  entries: BazaarEntry[],
  words: NameSearchWord[],
): string | null => {
  const normalized = words
    .map((word) => normalizeNameSearchWord(word.text))
    .filter((text): text is string => text !== null);
  if (!normalized.length) return null;

  for (let start = 0; start < normalized.length; start++) {
    const phrase = normalized.slice(start).join(' ').trim();
    if (phrase.length >= 2 && phraseMatchesItemName(entries, phrase)) return phrase;
  }

  const fallback = normalized.join(' ').trim();
  return fallback.length >= 2 ? fallback : null;
};

/**
 * Returns the plain word or partial `n:`/`n=` value at the cursor for name
 * autocomplete. Returns null when the active token is another filter prefix.
 */
export const getNameSearchToken = (value: string, cursor: number): NameSearchToken | null => {
  const words = collectNameSearchWords(value, cursor);
  if (!words.length) return null;

  const lastWord = words[words.length - 1];
  const lastText = normalizeNameSearchWord(lastWord.text);
  if (lastText === null) return null;

  const nameFilterMatch = lastWord.text.match(/^(-)?n[:=](.*)$/i);
  if (nameFilterMatch) {
    const query = nameFilterMatch[2] ?? '';
    const prefixLen = lastWord.text.length - query.length;
    return {
      query,
      start: lastWord.start + prefixLen,
      end: lastWord.end,
    };
  }

  const query = words
    .map((word) => normalizeNameSearchWord(word.text))
    .filter((text): text is string => text !== null)
    .join(' ');

  if (!query) return null;

  return { query, start: words[0].start, end: words[words.length - 1].end };
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

export const getItemNameSuggestionsAtCursor = (
  entries: BazaarEntry[],
  value: string,
  cursor: number,
  limit = 8,
): NameSuggestion[] => {
  const words = collectNameSearchWords(value, cursor);
  const query = resolveNameSearchQuery(entries, words);
  return query ? getItemNameSuggestions(entries, query, limit) : [];
};
