import { Fragment, type ReactNode } from 'react';

import { StatIcon, getStatDef, type StatKey } from 'components/StatIcon/StatIcon';

import './TooltipLine.scss';

interface StatMatch {
  start: number;
  end: number;
  stat: StatKey;
  label: string;
  value: string;
  prefix?: string;
}

interface StatPattern {
  stat: StatKey;
  regex: RegExp;
  getMatch: (exec: RegExpExecArray) => Omit<StatMatch, 'start' | 'end'>;
}

// Order matters: longer / more specific patterns first.
const STAT_PATTERNS: StatPattern[] = [
  {
    stat: 'damage',
    regex: /\bDeal\s+(\d+)\s+Damage/gi,
    getMatch: (m) => ({ stat: 'damage', label: 'Damage', value: m[1], prefix: 'Deal ' }),
  },
  {
    stat: 'shield',
    regex: /\bGain\s+(\d+)\s+Shield/gi,
    getMatch: (m) => ({ stat: 'shield', label: 'Shield', value: m[1], prefix: 'Gain ' }),
  },
  {
    stat: 'regen',
    regex: /\b(\d+)\s+Regen/gi,
    getMatch: (m) => ({ stat: 'regen', label: 'Regen', value: m[1] }),
  },
  { stat: 'burn', regex: /\bBurn\s+(\d+)/gi, getMatch: (m) => ({ stat: 'burn', label: 'Burn', value: m[1] }) },
  {
    stat: 'poison',
    regex: /\bPoison\s+(\d+)/gi,
    getMatch: (m) => ({ stat: 'poison', label: 'Poison', value: m[1] }),
  },
  {
    stat: 'shield',
    regex: /\bShield\s+(\d+)/gi,
    getMatch: (m) => ({ stat: 'shield', label: 'Shield', value: m[1] }),
  },
  { stat: 'heal', regex: /\bHeal\s+(\d+)/gi, getMatch: (m) => ({ stat: 'heal', label: 'Heal', value: m[1] }) },
];

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

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const filtered: StatMatch[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start >= cursor) {
      filtered.push(match);
      cursor = match.end;
    }
  }

  return filtered;
};

const StatPhrase = ({
  stat,
  label,
  value,
  prefix,
}: Pick<StatMatch, 'stat' | 'label' | 'value' | 'prefix'>) => {
  const { colorVar } = getStatDef(stat);

  return (
    <>
      {prefix}
      <span className="TooltipLine-stat">
        <span className="TooltipLine-statLabel" style={{ color: colorVar }}>
          {label}
        </span>
        <StatIcon stat={stat} size={14} />
        {value}
      </span>
    </>
  );
};

const formatTooltipText = (text: string): ReactNode[] => {
  const matches = findStatMatches(text);
  if (matches.length === 0) return [text];

  const nodes: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, i) => {
    if (match.start > cursor) {
      nodes.push(text.slice(cursor, match.start));
    }
    nodes.push(
      <StatPhrase
        key={`${match.start}-${match.stat}-${i}`}
        stat={match.stat}
        label={match.label}
        value={match.value}
        prefix={match.prefix}
      />,
    );
    cursor = match.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
};

interface TooltipLineProps {
  text: string;
}

export const TooltipLine = ({ text }: TooltipLineProps) => (
  <span className="TooltipLine">{formatTooltipText(text).map((node, i) => <Fragment key={i}>{node}</Fragment>)}</span>
);
