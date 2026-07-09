import type { Tier } from 'types/bazaar';

import {
  STAT_PATTERNS,
  TEXT_HIGHLIGHT_PATTERNS,
  TIER_GROUP_RE,
  type StatMatch,
} from './tooltipPatterns';

interface TierGroupMatch {
  start: number;
  end: number;
  values: string[];
}

interface TextHighlightMatch {
  start: number;
  end: number;
  colorVar: string;
}

export type HighlightSegment =
  | { kind: 'tier'; start: number; end: number; values: string[] }
  | { kind: 'stat'; start: number; end: number; match: StatMatch }
  | { kind: 'text'; start: number; end: number; colorVar: string };

const dedupeMatches = <T extends { start: number; end: number }>(matches: T[]): T[] => {
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const filtered: T[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start >= cursor) {
      filtered.push(match);
      cursor = match.end;
    }
  }

  return filtered;
};

const findTierGroupMatches = (text: string): TierGroupMatch[] => {
  const matches: TierGroupMatch[] = [];
  const pattern = new RegExp(TIER_GROUP_RE.source, TIER_GROUP_RE.flags);
  let exec: RegExpExecArray | null;

  while ((exec = pattern.exec(text)) !== null) {
    matches.push({
      start: exec.index,
      end: exec.index + exec[0].length,
      values: exec[1].split('/'),
    });
  }

  return matches;
};

const findTextHighlightMatches = (text: string): TextHighlightMatch[] => {
  const matches: TextHighlightMatch[] = [];

  for (const { regex, colorVar } of TEXT_HIGHLIGHT_PATTERNS) {
    const pattern = new RegExp(regex.source, regex.flags);
    let exec: RegExpExecArray | null;

    while ((exec = pattern.exec(text)) !== null) {
      matches.push({
        start: exec.index,
        end: exec.index + exec[0].length,
        colorVar,
      });
    }
  }

  return dedupeMatches(matches);
};

const findStatMatches = (text: string): StatMatch[] => {
  const matches: StatMatch[] = [];

  for (const { regex, getMatch } of STAT_PATTERNS) {
    const pattern = new RegExp(regex.source, regex.flags);
    let exec: RegExpExecArray | null;

    while ((exec = pattern.exec(text)) !== null) {
      matches.push({
        start: exec.index,
        end: exec.index + exec[0].length,
        ...getMatch(exec),
      });
    }
  }

  return dedupeMatches(matches);
};

export const findHighlightSegments = (text: string, activeTiers?: Tier[]): HighlightSegment[] => {
  const tierMatches = activeTiers?.length ? findTierGroupMatches(text) : [];
  const statMatches = findStatMatches(text);
  const textMatches = findTextHighlightMatches(text);

  const segments: HighlightSegment[] = [
    ...tierMatches.map((m) => ({ kind: 'tier' as const, ...m })),
    ...statMatches.map((m) => ({ kind: 'stat' as const, start: m.start, end: m.end, match: m })),
    ...textMatches.map((m) => ({ kind: 'text' as const, ...m })),
  ];

  return dedupeMatches(segments);
};
