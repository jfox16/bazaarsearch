import './ChipToggleGroup.scss';

import { HintTrigger, Tooltip } from 'components/Tooltip/Tooltip';

export interface ChipOption {
  value: string;
  label: string;
}

interface ChipToggleGroupProps {
  label: string;
  hint?: React.ReactNode;
  headerExtra?: React.ReactNode;
  options: ChipOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}

export const ChipToggleGroup = ({
  label,
  hint,
  headerExtra,
  options,
  selected,
  onToggle,
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
        {headerExtra}
      </div>
      <div className="ChipToggleGroup-chips">
        {options.map((option) => {
          const active = selected.has(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className="Chip"
              data-active={active}
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
