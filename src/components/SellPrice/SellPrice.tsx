import { Coins } from 'lucide-react';

import './SellPrice.scss';

interface SellPriceProps {
  value: number;
  size?: number;
  className?: string;
}

export const SellPrice = ({ value, size = 13, className }: SellPriceProps) => {
  const classNames = ['SellPrice', className].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      <Coins size={size} aria-hidden />
      <span>{value}</span>
    </span>
  );
};
