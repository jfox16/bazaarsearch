import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import { X } from 'lucide-react';
import { GoldCoinIcon } from 'components/GoldCoinIcon/GoldCoinIcon';

import { CardImage } from 'components/CardImage/CardImage';
import { DetailPill } from 'components/DetailPill/DetailPill';
import { StatIcon } from 'components/StatIcon/StatIcon';
import { TooltipLine } from 'components/TooltipLine/TooltipLine';

import { getPillInfo, type PillKind } from 'data/pillDescriptions';

import { loadEnchantments, loadQuests } from 'data/loadDataset';

import { getBaseStats } from 'functions/getBaseStats';
import {
  formatTagLabel,
  getEntryMechanicTags,
  getEntryTypes,
} from 'functions/getEntryDisplayTags';
import { getActiveTiers } from 'functions/getActiveTiers';
import { getSellPrice } from 'functions/getSellPrice';
import { getEntryHeroPills } from 'functions/formatHeroLabel';
import { formatStartingTierLabel } from 'functions/formatStartingTierLabel';

import { useDeviceTilt } from 'hooks/useDeviceTilt';
import { useIsMobile } from 'hooks/useIsMobile';
import { useBazaarStore } from 'store/useBazaarStore';

import type { BazaarEntry, Enchantment, Kind, Quest, Size, Tier } from 'types/bazaar';

import './CardDetail.scss';

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
const TILT_RELEASE_MS = 380;

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
  const isMobile = useIsMobile();
  const artRef = useRef<HTMLDivElement>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [artTilt, setArtTilt] = useState<ArtTilt>({ rotateX: 0, rotateY: 0 });
  const [artHovering, setArtHovering] = useState(false);
  const [artDragging, setArtDragging] = useState(false);
  const {
    tilt: deviceTilt,
    active: deviceTiltActive,
    needsPermission: deviceTiltNeedsPermission,
    requestAccess: requestDeviceTiltAccess,
    resetBaseline: resetDeviceTiltBaseline,
  } = useDeviceTilt(isMobile, TILT_MAX);
  const [enchantments, setEnchantments] = useState<Enchantment[] | null>(null);
  const [enchantStatus, setEnchantStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [questStatus, setQuestStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [openPill, setOpenPill] = useState<string | null>(null);

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

  const clearReleaseTimer = () => {
    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
  };

  const beginArtInteraction = () => {
    clearReleaseTimer();
    setArtHovering(true);
    setArtDragging(true);
  };

  const endArtInteraction = () => {
    if (deviceTiltActive) return;

    clearReleaseTimer();
    setArtDragging(false);
    setArtTilt({ rotateX: 0, rotateY: 0 });
    releaseTimer.current = setTimeout(() => {
      setArtHovering(false);
      releaseTimer.current = null;
    }, TILT_RELEASE_MS);
  };

  useEffect(() => {
    setArtTilt({ rotateX: 0, rotateY: 0 });
    setArtHovering(false);
    setArtDragging(false);
    setOpenPill(null);
    clearReleaseTimer();
    resetDeviceTiltBaseline();
  }, [entry.id, resetDeviceTiltBaseline]);

  useEffect(() => () => clearReleaseTimer(), []);

  const updateArtTiltFromPoint = (clientX: number, clientY: number) => {
    const art = artRef.current;
    if (!art) return;

    const rect = art.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    setArtTilt({
      rotateX: -y * TILT_MAX,
      rotateY: x * TILT_MAX,
    });
  };

  const handleArtMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (deviceTiltActive) return;
    updateArtTiltFromPoint(event.clientX, event.clientY);
  };

  const handleArtMouseLeave = () => {
    endArtInteraction();
  };

  const handleArtTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (deviceTiltActive) return;

    beginArtInteraction();
    const touch = event.touches[0];
    if (touch) updateArtTiltFromPoint(touch.clientX, touch.clientY);
  };

  const handleArtTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (deviceTiltActive) return;

    const touch = event.touches[0];
    if (touch) updateArtTiltFromPoint(touch.clientX, touch.clientY);
  };

  const handleArtTouchEnd = () => {
    // iOS requires a user gesture for gyro access; touchend is more reliable
    // than touchstart per Apple/WebKit guidance.
    if (deviceTiltNeedsPermission) {
      void requestDeviceTiltAccess();
    }
    endArtInteraction();
  };

  const handleArtClick = () => {
    if (deviceTiltNeedsPermission) {
      void requestDeviceTiltAccess();
    }
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

  const pillKey = (kind: PillKind, value: string) => `${kind}:${value}`;

  const renderPill = (
    kind: PillKind,
    value: string,
    label: string,
    className: string,
    onFilter: () => void,
    extraProps?: Record<string, string>,
  ) => {
    const key = pillKey(kind, value);
    const { description, filterLabel } = getPillInfo(kind, value, label);

    return (
      <DetailPill
        key={key}
        className={className}
        description={description}
        filterLabel={filterLabel}
        isOpen={openPill === key}
        onOpen={() => setOpenPill(key)}
        onClose={() => setOpenPill((current) => (current === key ? null : current))}
        onFilter={onFilter}
        {...extraProps}
      >
        {label}
      </DetailPill>
    );
  };

  const activeTiers = getActiveTiers(entry);
  const sellPrices = activeTiers
    .map((tier) => ({ tier, price: getSellPrice(entry, tier) }))
    .filter((row): row is { tier: Tier; price: number } => row.price !== null);

  const types = getEntryTypes(entry);
  const mechanicTags = getEntryMechanicTags(entry);
  const stats = getBaseStats(entry);
  const heroPills = getEntryHeroPills(entry.heroes);

  const isSkill = entry.kind === 'skill';
  const effectiveTilt = deviceTiltActive ? deviceTilt : artTilt;
  const effectiveHovering = artHovering || deviceTiltActive;
  const effectiveDragging = artDragging || deviceTiltActive;

  const artClass = [
    'CardDetail-art',
    isSkill ? 'is-skill' : artSizeClass(entry.size),
    effectiveHovering && 'is-hovering',
    effectiveDragging && 'is-dragging',
  ]
    .filter(Boolean)
    .join(' ');

  const artStyle = {
    '--tilt-x': `${effectiveTilt.rotateX}deg`,
    '--tilt-y': `${effectiveTilt.rotateY}deg`,
    ...getArtGlintVars(effectiveTilt, effectiveHovering),
  } as CSSProperties;

  return (
    <div className="CardDetail">
      <div className="CardDetail-artStage">
        <div
          ref={artRef}
          className={artClass}
          data-tier={entry.startingTier ?? undefined}
          style={artStyle}
          onMouseEnter={() => {
            if (!deviceTiltActive) beginArtInteraction();
          }}
          onMouseMove={handleArtMouseMove}
          onMouseLeave={handleArtMouseLeave}
          onClick={handleArtClick}
          onTouchStart={handleArtTouchStart}
          onTouchMove={handleArtTouchMove}
          onTouchEnd={handleArtTouchEnd}
          onTouchCancel={handleArtTouchEnd}
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
            {heroPills.map(({ label, hero }) =>
              renderPill(
                'hero',
                hero,
                label,
                'CardDetail-badge is-hero is-clickable',
                () => filterByHero(hero),
              ),
            )}
            {renderPill(
              'kind',
              entry.kind,
              entry.kind === 'item' ? 'Item' : 'Skill',
              'CardDetail-badge is-clickable',
              () => filterByKind(entry.kind),
            )}
            {!isSkill &&
              entry.size &&
              renderPill(
                'size',
                entry.size,
                entry.size,
                'CardDetail-badge is-clickable',
                () => filterBySize(entry.size!),
              )}
            {entry.startingTier &&
              renderPill(
                'tier',
                entry.startingTier,
                formatStartingTierLabel(entry.startingTier),
                'CardDetail-badge is-clickable',
                () => filterByTier(entry.startingTier!),
                { 'data-tier': entry.startingTier },
              )}
            {types.map((type) =>
              renderPill(
                'type',
                type,
                type,
                'CardDetail-badge is-type is-clickable',
                () => filterByType(type),
                { 'data-tag': type },
              ),
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

        {!isSkill && sellPrices.length > 0 && (
          <div className="CardDetail-facts">
            {(
              [
                {
                  label: 'Cost',
                  prices: sellPrices.map(({ tier, price }) => ({ tier, price: price * 2 })),
                },
                { label: 'Value', prices: sellPrices },
              ] as const
            ).map(({ label, prices }) => (
              <Fragment key={label}>
                <span className="CardDetail-factsLabel">{label}</span>
                <div className="CardDetail-factsValue">
                  <span className="CardDetail-goldAmount">
                    <GoldCoinIcon size={10} className="CardDetail-goldIcon" />
                    <span className="CardDetail-goldValues">
                      {prices.map(({ tier, price }, i) => (
                        <Fragment key={tier}>
                          {i > 0 && <span className="CardDetail-tierSep">/</span>}
                          <span className="CardDetail-tierVal" data-tier={tier}>
                            {price}
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        )}

        {entry.unifiedTooltips.length > 0 && (
          <section className="CardDetail-section CardDetail-description">
            <ul className="CardDetail-tooltips">
              {entry.unifiedTooltips.map((tip, i) => (
                <li key={i}>
                  <TooltipLine text={tip} activeTiers={activeTiers} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {mechanicTags.length > 0 && (
          <div className="CardDetail-tagRow">
            <span className="CardDetail-factsLabel">Tags</span>
            {mechanicTags.map((tag) =>
              renderPill(
                'tag',
                tag,
                formatTagLabel(tag),
                'CardDetail-badge is-clickable',
                () => filterByTag(tag),
                { 'data-tag': tag },
              ),
            )}
          </div>
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
                                <TooltipLine text={tip} activeTiers={activeTiers} />
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
                                  <TooltipLine text={tip} activeTiers={activeTiers} />
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
                      <TooltipLine text={tip} activeTiers={activeTiers} />
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
