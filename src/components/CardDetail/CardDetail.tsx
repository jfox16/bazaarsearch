import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { X } from 'lucide-react';

import { CardImage } from 'components/CardImage/CardImage';
import { SellPrice } from 'components/SellPrice/SellPrice';
import { StatIcon } from 'components/StatIcon/StatIcon';
import { TooltipLine } from 'components/TooltipLine/TooltipLine';

import { loadEnchantments } from 'data/loadDataset';

import { getBaseStats } from 'functions/getBaseStats';
import { getSellPrice } from 'functions/getSellPrice';
import { formatHeroLabel } from 'functions/formatHeroLabel';

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

const TILT_MAX = 18;

interface ArtTilt {
  rotateX: number;
  rotateY: number;
}

/** Light from upper-left; highlight/shadow shift with the faux-3D tilt. */
const getArtGlintVars = (tilt: ArtTilt, hovering: boolean) => {
  if (!hovering) {
    return {
      '--glint-x': '38%',
      '--glint-y': '28%',
      '--glint-bright': 0.06,
      '--glint-shade': 0.05,
      '--glint-angle': 125,
    };
  }

  const nx = tilt.rotateY / TILT_MAX;
  const ny = tilt.rotateX / TILT_MAX;

  return {
    '--glint-x': `${42 + nx * 34 + ny * 14}%`,
    '--glint-y': `${28 - ny * 38 + nx * 16}%`,
    '--glint-bright': 0.14 + ny * 0.42 + -nx * 0.1,
    '--glint-shade': Math.max(0, 0.08 - ny * 0.28 + nx * 0.2),
    '--glint-angle': 110 + nx * 32 - ny * 22,
  };
};

export const CardDetail = ({ entry, onClose }: CardDetailProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const [artTilt, setArtTilt] = useState<ArtTilt>({ rotateX: 0, rotateY: 0 });
  const [artHovering, setArtHovering] = useState(false);
  const [enchantments, setEnchantments] = useState<Enchantment[] | null>(null);
  const [enchantStatus, setEnchantStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  useEffect(() => {
    if (entry.kind !== 'item') return;
    let cancelled = false;
    setEnchantStatus('loading');
    setEnchantments(null);
    loadEnchantments()
      .then((data) => {
        if (cancelled) return;
        setEnchantments(data.byId[entry.id] ?? []);
        setEnchantStatus('done');
      })
      .catch(() => {
        if (!cancelled) setEnchantStatus('done');
      });
    return () => {
      cancelled = true;
    };
  }, [entry.id, entry.kind]);

  useEffect(() => {
    setArtTilt({ rotateX: 0, rotateY: 0 });
    setArtHovering(false);
  }, [entry.id]);

  const handleArtMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const art = artRef.current;
    if (!art) return;

    const rect = art.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setArtTilt({
      rotateX: -y * TILT_MAX,
      rotateY: x * TILT_MAX,
    });
  };

  const handleArtMouseLeave = () => {
    setArtHovering(false);
    setArtTilt({ rotateX: 0, rotateY: 0 });
  };

  const tierRows = TIER_ORDER.map((tier) => ({ tier, tooltips: entry.tiers[tier] ?? [] })).filter(
    (row) => row.tooltips.length > 0,
  );

  const allTags = [...entry.tags, ...entry.hiddenTags, ...entry.customTags];
  const stats = getBaseStats(entry);

  const isSkill = entry.kind === 'skill';
  const artClass = [
    'CardDetail-art',
    isSkill ? 'is-skill' : artSizeClass(entry.size),
    artHovering && 'is-hovering',
  ]
    .filter(Boolean)
    .join(' ');

  const artStyle = {
    '--tilt-x': `${artTilt.rotateX}deg`,
    '--tilt-y': `${artTilt.rotateY}deg`,
    ...getArtGlintVars(artTilt, artHovering),
  } as CSSProperties;

  return (
    <div className="CardDetail">
      <div className="CardDetail-artStage">
        <div
          ref={artRef}
          className={artClass}
          data-tier={entry.startingTier ?? undefined}
          style={artStyle}
          onMouseEnter={() => setArtHovering(true)}
          onMouseMove={handleArtMouseMove}
          onMouseLeave={handleArtMouseLeave}
        >
          <CardImage
            src={entry.imageUrl}
            alt={entry.name}
            size={entry.size}
            circle={isSkill}
            fill={!isSkill}
            eager
          />
          <span className="CardDetail-artGlint" aria-hidden />
        </div>
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
            {tierRows.map((row) => {
              const sellPrice = entry.kind === 'item' ? getSellPrice(entry, row.tier) : null;

              return (
                <div key={row.tier} className="CardDetail-tier">
                  <div className="CardDetail-tierHeader">
                    <span className="CardDetail-tierLabel" data-tier={row.tier}>
                      {row.tier}
                    </span>
                    {sellPrice !== null && (
                      <SellPrice value={sellPrice} size={12} className="CardDetail-tierSell" />
                    )}
                  </div>
                  <ul className="CardDetail-tooltips">
                    {row.tooltips.map((tip, i) => (
                      <li key={i}>
                        <TooltipLine text={tip} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        )}

        {entry.heroes.length > 0 && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">Heroes</h3>
            <div className="CardDetail-heroes">
              {entry.heroes.map((hero) => (
                <span key={hero} className="CardDetail-badge is-hero">
                  {formatHeroLabel(hero)}
                </span>
              ))}
            </div>
          </section>
        )}

        {allTags.length > 0 && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">Tags</h3>
            <div className="CardDetail-tags">
              {allTags.map((tag) => (
                <span key={tag} className="CardDetail-tag" data-tag={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {entry.kind === 'item' && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">Enchantments</h3>
            {enchantStatus === 'loading' && (
              <p className="CardDetail-muted">Loading enchantments...</p>
            )}
            {enchantStatus === 'done' && enchantments && enchantments.length === 0 && (
              <p className="CardDetail-muted">No enchantments.</p>
            )}
            {enchantments?.map((ench) => (
              <div key={ench.type} className="CardDetail-ench">
                <span className="CardDetail-enchType" data-enchant={ench.type}>
                  {ench.type}
                </span>
                <ul className="CardDetail-tooltips">
                  {ench.tooltips.map((tip, i) => (
                    <li key={i}>
                      <TooltipLine text={tip} />
                    </li>
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
