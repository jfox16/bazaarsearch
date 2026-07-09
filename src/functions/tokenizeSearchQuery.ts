export interface SearchQueryToken {
  value: string;
  quoted: boolean;
  start: number;
  end: number;
}

/** Splits search text on whitespace, keeping quoted phrases as single tokens. */
export const tokenizeSearchQuery = (text: string): SearchQueryToken[] => {
  const tokens: SearchQueryToken[] = [];
  let index = 0;

  while (index < text.length) {
    while (index < text.length && /\s/.test(text[index] ?? '')) index++;
    if (index >= text.length) break;

    if (text[index] === '"') {
      const start = index;
      index++;
      const valueStart = index;
      while (index < text.length && text[index] !== '"') index++;
      tokens.push({
        value: text.slice(valueStart, index),
        quoted: true,
        start,
        end: index < text.length ? index + 1 : index,
      });
      if (index < text.length) index++;
      continue;
    }

    const start = index;
    while (index < text.length && !/\s/.test(text[index] ?? '')) index++;
    tokens.push({
      value: text.slice(start, index),
      quoted: false,
      start,
      end: index,
    });
  }

  return tokens;
};

/** Returns the token containing `cursor`, if any. */
export const getSearchQueryTokenAtCursor = (
  text: string,
  cursor: number,
): SearchQueryToken | null => {
  for (const token of tokenizeSearchQuery(text)) {
    if (cursor >= token.start && cursor <= token.end) return token;
  }
  return null;
};
