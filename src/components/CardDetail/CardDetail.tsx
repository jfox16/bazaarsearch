import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { X } from 'lucide-react';

import { CardImage } from 'components/CardImage/CardImage';
import { SellPrice } from 'components/SellPrice/SellPrice';
import { StatIcon } from 'components/StatIcon/StatIcon';
import { TooltipLine } from 'components/TooltipLine/TooltipLine';

import { loadEnchantments, loadQuests } from 'data/loadDataset';

import { getBaseStats } from 'functions/getBaseStats';
import {
  formatTagLabel,
  getEntryMechanicTags,
  getEntryTypes,
} from 'functions/getEntryDisplayTags';
import { getSellPrice } from 'functions/getSellPrice';
import { formatHeroLabel } from 'functions/formatHeroLabel';

import { useBazaarStore } from 'store/useBazaarStore';

import type { BazaarEntry, Enchantment, Kind, Quest, Size, Tier } from 'types/bazaar';

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
  const applyTypeFilter = useBazaarStore((s) => s.applyTypeFilter);
  const applyTagFilter = useBazaarStore((s) => s.applyTagFilter);
  const applyHeroFilter = useBazaarStore((s) => s.applyHeroFilter);
  const applyKindFilter = useBazaarStore((s) => s.applyKindFilter);
  const applySizeFilter = useBazaarStore((s) => s.applySizeFilter);
  const applyTierFilter = useBazaarStore((s) => s.applyTierFilter);
  const artRef = useRef<HTMLDivElement>(null);
  const [artTilt, setArtTilt] = useState<ArtTilt>({ rotateX: 0, rotateY: 0 });
  const [artHovering, setArtHovering] = useState(false);
  const [enchantments, setEnchantments] = useState<Enchantment[] | null>(null);
  const [enchantStatus, setEnchantStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [questStatus, setQuestStatus] = useState<'idle' | 'loading' | 'done'>('idle');

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
    if (entry.kind !== 'item') return;
    let cancelled = false;
    setQuestStatus('loading');
    setQuests(null);
    loadQuests()
      .then((data) => {
        if (cancelled) return;
        setQuests(data.byId[entry.id] ?? []);
        setQuestStatus('done');
      })
      .catch(() => {
        if (!cancelled) setQuestStatus('done');
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

  const filterByType = (type: string) => {
    applyTypeFilter(type);
    onClose?.();
  };

  const filterByTag = (tag: string) => {
    applyTagFilter(tag);
    onClose?.();
  };

  const filterByHero = (hero: string) => {
    applyHeroFilter(hero);
    onClose?.();
  };

  const filterByKind = (kind: Kind) => {
    applyKindFilter(kind);
    onClose?.();
  };

  const filterBySize = (size: Size) => {
    applySizeFilter(size);
    onClose?.();
  };

  const filterByTier = (tier: Tier) => {
    applyTierFilter(tier);
    onClose?.();
  };

  const tierRows = TIER_ORDER.map((tier) => ({ tier, tooltips: entry.tiers[tier] ?? [] })).filter(
    (row) => row.tooltips.length > 0,
  );

  const types = getEntryTypes(entry);
  const mechanicTags = getEntryMechanicTags(entry);
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
            fill
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
            <button
              type="button"
              className="CardDetail-badge is-clickable"
              onClick={() => filterByKind(entry.kind)}
            >
              {entry.kind === 'item' ? 'Item' : 'Skill'}
            </button>
            {!isSkill && entry.size && (
              <button
                type="button"
                className="CardDetail-badge is-clickable"
                onClick={() => filterBySize(entry.size!)}
              >
                {entry.size}
              </button>
            )}
            {entry.startingTier && (
              <button
                type="button"
                className="CardDetail-badge is-clickable"
                data-tier={entry.startingTier}
                onClick={() => filterByTier(entry.startingTier!)}
              >
                {entry.startingTier === 'Bronze' ? 'Bronze+' : entry.startingTier}
              </button>
            )}
          </div>
          {!isSkill && stats.length > 0 && (
            <div className="CardDetail-stats">
              {stats.map(({ stat, value }) => (
                <span key={stat} className="CardDetail-stat">
                  <StatIcon stat={stat} />
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
                        <TooltipLine text={tip} plain />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        )}

        {entry.heroes.length > 0 && (
          <section className="CardDetail-section CardDetail-section--inline">
            <h3 className="CardDetail-sectionTitle">Hero</h3>
            <div className="CardDetail-heroes">
              {entry.heroes.map((hero) => (
                <button
                  key={hero}
                  type="button"
                  className="CardDetail-badge is-hero is-clickable"
                  onClick={() => filterByHero(hero)}
                >
                  {formatHeroLabel(hero)}
                </button>
              ))}
            </div>
          </section>
        )}

        {types.length > 0 && (
          <section className="CardDetail-section CardDetail-section--inline">
            <h3 className="CardDetail-sectionTitle">Types</h3>
            <div className="CardDetail-tags">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="CardDetail-badge is-type is-clickable"
                  data-tag={type}
                  onClick={() => filterByType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>
        )}

        {mechanicTags.length > 0 && (
          <section className="CardDetail-section CardDetail-section--inline">
            <h3 className="CardDetail-sectionTitle">Tags</h3>
            <div className="CardDetail-tags">
              {mechanicTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="CardDetail-badge is-clickable"
                  data-tag={tag}
                  onClick={() => filterByTag(tag)}
                >
                  {formatTagLabel(tag)}
                </button>
              ))}
            </div>
          </section>
        )}

        {entry.kind === 'item' && (questStatus === 'loading' || (quests?.length ?? 0) > 0) && (
          <section className="CardDetail-section">
            <h3 className="CardDetail-sectionTitle">Quests</h3>
            {questStatus === 'loading' && <p className="CardDetail-muted">Loading quests...</p>}
            {quests && quests.length > 0 && (
              <div className="CardDetail-quest">
                {quests.map((quest, questIndex) => (
                  <div key={questIndex} className="CardDetail-questGroup">
                    {quest.entries.map((questEntry, entryIndex) => (
                      <div key={entryIndex} className="CardDetail-questEntry">
                        {quest.entries.length > 1 && (
                          <span className="CardDetail-questStep">Step {entryIndex + 1}</span>
                        )}
                        <div className="CardDetail-questBlock">
                          <span className="CardDetail-questLabel">Objective</span>
                          <ul className="CardDetail-tooltips">
                            {questEntry.tooltips.map((tip, i) => (
                              <li key={i}>
                                <TooltipLine text={tip} plain />
                              </li>
                            ))}
                          </ul>
                        </div>
                        {questEntry.rewardTooltips.length > 0 && (
                          <div className="CardDetail-questBlock">
                            <span className="CardDetail-questLabel is-reward">Reward</span>
                            <ul className="CardDetail-tooltips">
                              {questEntry.rewardTooltips.map((tip, i) => (
                                <li key={i}>
                                  <TooltipLine text={tip} plain />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
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
                      <TooltipLine text={tip} plain />
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
