import { Fragment } from 'react';

import { formatTooltipContent, type TooltipLineOptions } from './formatTooltipContent';

import './TooltipLine.scss';

export type { TooltipLineOptions } from './formatTooltipContent';
export { formatTooltipContent, TierScaledValues } from './formatTooltipContent';

interface TooltipLineProps extends TooltipLineOptions {
  text: string;
}

export const TooltipLine = ({ text, activeTiers }: TooltipLineProps) => (
  <span className="TooltipLine">
    {formatTooltipContent(text, { activeTiers }).map((node, i) => (
      <Fragment key={i}>{node}</Fragment>
    ))}
  </span>
);
