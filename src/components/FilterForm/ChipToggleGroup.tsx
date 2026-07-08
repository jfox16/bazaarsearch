import './ChipToggleGroup.scss';

export interface ChipOption {
  value: string;
  label: string;
}

interface ChipToggleGroupProps {
  label: string;
  options: ChipOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  /** Optional right-aligned control (e.g. a match-all toggle). */
  action?: React.ReactNode;
  /** Constrain height and scroll when there are many options (e.g. tags). */
  scroll?: boolean;
}

export const ChipToggleGroup = ({
  label,
  options,
  selected,
  onToggle,
  action,
  scroll,
}: ChipToggleGroupProps) => {
  if (options.length === 0) return null;

  return (
    <div className="ChipToggleGroup">
      <div className="ChipToggleGroup-header">
        <span className="ChipToggleGroup-label">{label}</span>
        {action}
      </div>
      <div className={`ChipToggleGroup-chips${scroll ? ' is-scroll' : ''}`}>
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
