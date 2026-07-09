import './GoldCoinIcon.scss';

interface GoldCoinIconProps {
  size?: number;
  className?: string;
}

/** Single solid gold coin — used for merchant sell prices. */
export const GoldCoinIcon = ({ size = 13, className }: GoldCoinIconProps) => {
  const classNames = ['GoldCoinIcon', className].filter(Boolean).join(' ');

  return (
    <svg
      className={classNames}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      role="img"
      aria-label="Gold"
    >
      <circle cx="8" cy="8" r="7" />
      <ellipse cx="8" cy="7.25" rx="4.25" ry="3.75" className="GoldCoinIcon-highlight" />
    </svg>
  );
};
