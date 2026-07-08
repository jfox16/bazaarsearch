import { CardImage } from 'components/CardImage/CardImage';
import { StatIcon } from 'components/StatIcon/StatIcon';
import { getBaseStats } from 'functions/getBaseStats';
import { getCardBlurb } from 'functions/getCardBlurb';
import type { BazaarEntry } from 'types/bazaar';

import './CardTile.scss';

interface CardTileProps {
  entry: BazaarEntry;
  onClick: (entry: BazaarEntry) => void;
}

export const CardTile = ({ entry, onClick }: CardTileProps) => {
  // Brief descriptor: main visible tags, e.g. "Food Tool".
  const descriptor = entry.tags.slice(0, 4).join(' ');
  const stats = getBaseStats(entry);
  // Cards with no numeric stats show a short description instead of an empty gap.
  const blurb = stats.length === 0 ? getCardBlurb(entry) : null;

  return (
    <button
      type="button"
      className="CardTile"
      data-tier={entry.startingTier ?? undefined}
      onClick={() => onClick(entry)}
      title={entry.name}
    >
      <CardImage
        src={entry.imageUrl}
        alt={entry.name}
        size={entry.size}
        circle={entry.kind === 'skill'}
        cover
      />
      <span className="CardTile-name">{entry.name}</span>
      {descriptor && <span className="CardTile-descriptor">{descriptor}</span>}
      {stats.length > 0 && (
        <span className="CardTile-stats">
          {stats.map(({ stat, value }) => (
            <span key={stat} className="CardTile-stat">
              <StatIcon stat={stat} />
              {value}
            </span>
          ))}
        </span>
      )}
      {blurb && <span className="CardTile-blurb">{blurb}</span>}
    </button>
  );
};
