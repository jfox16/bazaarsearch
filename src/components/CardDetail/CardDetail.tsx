import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { CardImage } from 'components/CardImage/CardImage';
import { StatIcon } from 'components/StatIcon/StatIcon';

import { loadEnchantments } from 'data/loadDataset';

import { getBaseStats } from 'functions/getBaseStats';

import type { BazaarEntry, Enchantment, Size, Tier } from 'types/bazaar';

import './CardDetail.scss';

const TIER_ORDER: Tier[] = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary'];

const artSizeClass = (size?: Size | null): string => {
  switch (size) {
    case 'Small':
      return 'is-small';
    case 'Large':
      return 'is-large';
    default:
      return 'is-medium';
  }
};

interface CardDetailProps {
  entry: BazaarEntry;
  onClose?: () => void;
}

export const CardDetail = ({ entry, onClose }: CardDetailProps) => {
  const [enchantments, setEnchantments] = useState<Enchantment[] | null>(null);
  const [enchantStatus, setEnchantStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [enchantMs, setEnchantMs] = useState<number | null>(null);

  useEffect(() => {
    if (entry.kind !== 'item') return;
    let cancelled = false;
    const start = performance.now();
    setEnchantStatus('loading');
    setEnchantments(null);
    setEnchantMs(null);
    loadEnchantments()
      .then((data) => {
        if (cancelled) return;
        setEnchantments(data.byId[entry.id] ?? []);
        setEnchantMs(Math.round(performance.now() - start));
        setEnchantStatus('done');
      })
      .catch(() => {
        if (!cancelled) setEnchantStatus('done');
      });
    return () => {
      cancelled = true;
    };
  }, [entry.id, entry.kind]);

  const tierRows = TIER_ORDER.map((tier) => ({ tier, tooltips: entry.tiers[tier] ?? [] })).filter(
    (row) => row.tooltips.length > 0,
  );

  const allTags = [...entry.tags, ...entry.hiddenTags, ...entry.customTags];
  const stats = getBaseStats(entry);

  const isSkill = entry.kind === 'skill';
  const artClass = ['CardDetail-art', isSkill ? 'is-skill' : artSizeClass(entry.size)].join(' ');

  return (
    <div className="CardDetail">
      <div className={artClass} data-tier={entry.startingTier ?? undefined}>
        <CardImage
          src={entry.imageUrl}
          alt={entry.name}
          size={entry.size}
          circle={isSkill}
          fill={!isSkill}
          eager
        />
      </div>

      <div className="CardDetail-panel">
        {onClose && (
          <button
            type="button"
            className="CardDetail-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}

        <div className="CardDetail-heading">
          <h2 className="CardDetail-name">{entry.name}</h2>
          <div className="CardDetail-meta">
            <span className="CardDetail-badge">{entry.kind === 'item' ? 'Item' : 'Skill'}</span>
            {entry.size && <span className="CardDetail-badge">{entry.size}</span>}
            {entry.startingTier && (
              <span className="CardDetail-badge" data-tier={entry.startingTier}>
                {entry.startingTier === 'Bronze' ? 'Bronze+' : entry.startingTier}
              </span>
            )}
          </div>
          {entry.heroes.length > 0 && (
            <div className="CardDetail-heroes">
              <span
                className="CardDetail-heroesLabel"
                title="Heroes that have this skill in their pool."
              >
                Heroes:
              </span>
              {entry.heroes.map((hero) => (
                <span key={hero} className="CardDetail-badge is-hero">
                  {hero}
                </span>
              ))}
            </div>
          )}
          {stats.length > 0 && (
            <div className="CardDetail-stats">
              {stats.map(({ stat, value }) => (
                <span key={stat} className="CardDetail-stat">
                  <StatIcon stat={stat} size={16} />
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {tierRows.length > 0 && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">Effects by tier</h3>
            {tierRows.map((row) => (
              <div key={row.tier} className="CardDetail-tier">
                <span className="CardDetail-tierLabel" data-tier={row.tier}>
                  {row.tier}
                </span>
                <ul className="CardDetail-tooltips">
                  {row.tooltips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {allTags.length > 0 && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">Tags</h3>
            <div className="CardDetail-tags">
              {allTags.map((tag) => (
                <span key={tag} className="CardDetail-tag">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {entry.kind === 'item' && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">
              Enchantments
              {enchantStatus === 'done' && enchantMs !== null && (
                <span className="CardDetail-lazyNote"> · lazy-loaded in {enchantMs} ms</span>
              )}
            </h3>
            {enchantStatus === 'loading' && (
              <p className="CardDetail-muted">Loading enchantments...</p>
            )}
            {enchantStatus === 'done' && enchantments && enchantments.length === 0 && (
              <p className="CardDetail-muted">No enchantments.</p>
            )}
            {enchantments?.map((ench) => (
              <div key={ench.type} className="CardDetail-ench">
                <span className="CardDetail-enchType">{ench.type}</span>
                <ul className="CardDetail-tooltips">
                  {ench.tooltips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
