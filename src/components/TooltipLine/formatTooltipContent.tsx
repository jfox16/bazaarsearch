import { Fragment, type ReactNode } from 'react';
import { Clock } from 'lucide-react';

import { AmmoIcon } from 'components/AmmoIcon/AmmoIcon';
import { StatIcon, getStatDef } from 'components/StatIcon/StatIcon';

import type { Tier } from 'types/bazaar';

import { findHighlightSegments } from './findHighlightSegments';
import {
  AMMO_LINE_RE,
  COOLDOWN_LINE_RE,
  MULTICAST_LINE_RE,
  TIER_SLASH_RE,
  TIER_VALUE_RE,
  type StatMatch,
} from './tooltipPatterns';

export interface TooltipLineOptions {
  /** Map slash-separated unified values to these tiers, in order (Bronze → …). */
  activeTiers?: Tier[];
}

export const TierScaledValues = ({ values, tiers }: { values: string[]; tiers: Tier[] }) => (
  <>
    {values.map((value, i) => (
      <Fragment key={i}>
        {i > 0 && <span className="TooltipLine-tierSep">/</span>}
        <span className="TooltipLine-tierVal" data-tier={tiers[i]}>
          {value}
        </span>
      </Fragment>
    ))}
  </>
);

const formatSecondDecimal = (value: string): string => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : value;
};

const ScalingValue = ({ raw, activeTiers }: { raw: string; activeTiers?: Tier[] }) => {
  const tierMatch = raw.match(TIER_VALUE_RE);
  const slashMatch = raw.match(TIER_SLASH_RE);
  if ((tierMatch || slashMatch) && activeTiers?.length) {
    const values = (tierMatch?.[1] ?? slashMatch?.[1] ?? '').split('/');
    return <TierScaledValues values={values} tiers={activeTiers} />;
  }
  return <>{raw}</>;
};

const SecondsScalingValue = ({ raw, activeTiers }: { raw: string; activeTiers?: Tier[] }) => {
  const tierMatch = raw.match(TIER_VALUE_RE);
  const slashMatch = raw.match(TIER_SLASH_RE);
  if ((tierMatch || slashMatch) && activeTiers?.length) {
    const values = (tierMatch?.[1] ?? slashMatch?.[1] ?? '')
      .split('/')
      .map(formatSecondDecimal);
    return <TierScaledValues values={values} tiers={activeTiers} />;
  }
  return <>{formatSecondDecimal(raw)}</>;
};

const StatPhrase = ({
  stat,
  value,
  prefix,
  label,
  middle,
  suffix,
  trailing,
  layout,
  showIcon = true,
  activeTiers,
}: StatMatch & { activeTiers?: Tier[] }) => {
  const { colorVar } = getStatDef(stat);
  const valueNode = <ScalingValue raw={value} activeTiers={activeTiers} />;
  const icon = showIcon ? <StatIcon stat={stat} size={14} /> : null;

  if (layout === 'labelMiddleValueIcon') {
    return (
      <>
        {prefix}
        <span className="TooltipLine-stat" style={{ color: colorVar }}>
          {label}
        </span>
        {middle}
        <span className="TooltipLine-stat" style={{ color: colorVar }}>
          {valueNode}
          {icon}
        </span>
        {trailing}
      </>
    );
  }

  if (layout === 'valueIconSuffix') {
    return (
      <>
        {prefix}
        <span className="TooltipLine-stat" style={{ color: colorVar }}>
          {valueNode}
          {icon}
          {suffix}
        </span>
        {trailing}
      </>
    );
  }

  return (
    <>
      {prefix}
      <span className="TooltipLine-stat" style={{ color: colorVar }}>
        {label}
        {icon}
        {valueNode}
      </span>
      {trailing}
    </>
  );
};

const CooldownLine = ({ value, activeTiers }: { value: string; activeTiers?: Tier[] }) => (
  <span className="TooltipLine-mechanic">
    <Clock size={14} strokeWidth={2} aria-hidden />
    <SecondsScalingValue raw={value} activeTiers={activeTiers} />
    <span className="TooltipLine-mechanicSuffix"> sec</span>
  </span>
);

const AmmoLine = ({ value, activeTiers }: { value: string; activeTiers?: Tier[] }) => (
  <span className="TooltipLine-mechanic">
    <AmmoIcon size={14} />
    <ScalingValue raw={value} activeTiers={activeTiers} />
  </span>
);

const MulticastLine = ({ value, activeTiers }: { value: string; activeTiers?: Tier[] }) => (
  <span className="TooltipLine-mechanic">
    Multicast x<ScalingValue raw={value} activeTiers={activeTiers} />
  </span>
);

const formatMechanicLine = (text: string, activeTiers?: Tier[]): ReactNode[] | null => {
  const cooldownMatch = text.match(COOLDOWN_LINE_RE);
  if (cooldownMatch) {
    return [<CooldownLine key="cooldown" value={cooldownMatch[1]} activeTiers={activeTiers} />];
  }

  const ammoMatch = text.match(AMMO_LINE_RE);
  if (ammoMatch) {
    return [<AmmoLine key="ammo" value={ammoMatch[1]} activeTiers={activeTiers} />];
  }

  const multicastMatch = text.match(MULTICAST_LINE_RE);
  if (multicastMatch) {
    return [<MulticastLine key="multicast" value={multicastMatch[1]} activeTiers={activeTiers} />];
  }

  return null;
};

/** Format tooltip / enchantment text with stat icons, tier scaling, and mechanic rows. */
export const formatTooltipContent = (
  text: string,
  { activeTiers }: TooltipLineOptions = {},
): ReactNode[] => {
  const mechanicLine = formatMechanicLine(text, activeTiers);
  if (mechanicLine) return mechanicLine;

  const segments = findHighlightSegments(text, activeTiers);
  if (segments.length === 0) return [text];

  const nodes: ReactNode[] = [];
  let cursor = 0;

  segments.forEach((segment, i) => {
    if (segment.start > cursor) {
      nodes.push(text.slice(cursor, segment.start));
    }

    if (segment.kind === 'tier') {
      nodes.push(
        <TierScaledValues key={`tier-${segment.start}-${i}`} values={segment.values} tiers={activeTiers!} />,
      );
    } else if (segment.kind === 'text') {
      nodes.push(
        <span
          key={`text-${segment.start}-${i}`}
          className="TooltipLine-keyword"
          style={{ color: segment.colorVar }}
        >
          {text.slice(segment.start, segment.end)}
        </span>,
      );
    } else {
      nodes.push(
        <StatPhrase key={`stat-${segment.start}-${segment.match.stat}-${i}`} {...segment.match} activeTiers={activeTiers} />,
      );
    }

    cursor = segment.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
};
