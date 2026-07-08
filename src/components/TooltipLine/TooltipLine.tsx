import { Fragment, type ReactNode } from 'react';

import { StatIcon, getStatDef, type StatKey } from 'components/StatIcon/StatIcon';

import './TooltipLine.scss';

interface StatMatch {
  start: number;
  end: number;
  stat: StatKey;
  label?: string;
  value: string;
  prefix?: string;
  /** Text between the label and the colored icon/value, e.g. " 1 item for ". */
  middle?: string;
  /** Lowercase stat word after the value, e.g. " damage". */
  suffix?: string;
  /** Text after the colored value, e.g. " second(s)". */
  trailing?: string;
}

interface StatPattern {
  stat: StatKey;
  regex: RegExp;
  getMatch: (exec: RegExpExecArray) => Omit<StatMatch, 'start' | 'end'>;
}

// Order matters: longer / more specific patterns first.
const STAT_PATTERNS: StatPattern[] = [
  {
    stat: 'haste',
    regex:
      /\bHaste\b(\s+(?:\d+\s+items?|an?\s+(?:item|\w+)|your[\w\s,]+?)\s+for\s+)(\d+(?:\.\d+)?)(\s+second(?:\(s\)|s)?)/gi,
    getMatch: (m) => ({
      stat: 'haste',
      label: 'Haste',
      middle: m[1],
      value: m[2],
      trailing: m[3],
    }),
  },
  {
    stat: 'damage',
    regex: /\bDeal\s+(\d+)\s+Damage/gi,
    getMatch: (m) => ({ stat: 'damage', value: m[1], prefix: 'Deal ', suffix: ' damage' }),
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
  middle,
  suffix,
  trailing,
}: Pick<StatMatch, 'stat' | 'label' | 'value' | 'prefix' | 'middle' | 'suffix' | 'trailing'>) => {
  const { colorVar } = getStatDef(stat);

  if (middle !== undefined) {
    return (
      <>
        {prefix}
        <span className="TooltipLine-stat" style={{ color: colorVar }}>
          {label}
        </span>
        {middle}
        <span className="TooltipLine-stat" style={{ color: colorVar }}>
          <StatIcon stat={stat} size={14} />
          {value}
        </span>
        {trailing}
      </>
    );
  }

  if (suffix) {
    return (
      <>
        {prefix}
        <span className="TooltipLine-stat" style={{ color: colorVar }}>
          <StatIcon stat={stat} size={14} />
          {value}
          {suffix}
        </span>
      </>
    );
  }

  return (
    <>
      {prefix}
      <span className="TooltipLine-stat" style={{ color: colorVar }}>
        {label}
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
        middle={match.middle}
        suffix={match.suffix}
        trailing={match.trailing}
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
  /** Skip inline stat icons/colors — use when stats are shown separately (e.g. card detail header). */
  plain?: boolean;
}

export const TooltipLine = ({ text, plain }: TooltipLineProps) => (
  <span className="TooltipLine">
    {(plain ? [text] : formatTooltipText(text)).map((node, i) => (
      <Fragment key={i}>{node}</Fragment>
    ))}
  </span>
);
