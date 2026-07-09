import './AmmoIcon.scss';

interface AmmoIconProps {
  size?: number;
}

/** Three parallel cartridges at 45°, tips toward the top right. */
export const AmmoIcon = ({ size = 14 }: AmmoIconProps) => (
  <svg
    className="AmmoIcon"
    viewBox="0 0 20 20"
    width={size}
    height={size}
    role="img"
    aria-label="Ammo"
  >
    <g transform="rotate(45 10 10)">
      <rect x="2.5" y="5" width="3.5" height="10" rx="1.75" />
      <rect x="8.25" y="5" width="3.5" height="10" rx="1.75" />
      <rect x="14" y="5" width="3.5" height="10" rx="1.75" />
    </g>
  </svg>
);
