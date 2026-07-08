import './ChipToggleGroup.scss';

import { HintTrigger, Tooltip } from 'components/Tooltip/Tooltip';

export interface ChipOption {
  value: string;
  label: string;
  hint?: React.ReactNode;
}

interface ChipToggleGroupProps {
  label: string;
  hint?: React.ReactNode;
  options: ChipOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  /** Constrain height and scroll when there are many options (e.g. tags). */
  scroll?: boolean;
}

export const ChipToggleGroup = ({
  label,
  hint,
  options,
  selected,
  onToggle,
  scroll,
}: ChipToggleGroupProps) => {
  if (options.length === 0) return null;

  return (
    <div className="ChipToggleGroup">
      <div className="ChipToggleGroup-header">
        <span className="ChipToggleGroup-label">
          {label}
          {hint && (
            <Tooltip content={hint}>
              <HintTrigger label={`About ${label} filter`} size={12} />
            </Tooltip>
          )}
        </span>
      </div>
      <div className={`ChipToggleGroup-chips${scroll ? ' is-scroll' : ''}`}>
        {options.map((option) => {
          const active = selected.has(option.value);
          const chip = (
            <button
              type="button"
              className="Chip"
              data-active={active}
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
            >
              {option.label}
            </button>
          );

          if (!option.hint) {
            return <span key={option.value}>{chip}</span>;
          }

          return (
            <Tooltip key={option.value} content={option.hint}>
              {chip}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
