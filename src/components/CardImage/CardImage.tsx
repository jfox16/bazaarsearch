import { useEffect, useState } from 'react';

import type { Size } from 'types/bazaar';

import './CardImage.scss';

interface CardImageProps {
  src: string;
  alt: string;
  /**
   * Item size, used to un-squish the art. The CDN stores every image as a
   * square, but the real art is portrait (Small), square (Medium) or landscape
   * (Large). We stretch the square back to its intended width per size.
   */
  size?: Size | null;
  /** Skills render as a smaller centered circle rather than a sized rectangle. */
  circle?: boolean;
  /**
   * Tile view: per-size frames in the card grid (see CardImage.scss `.is-cover`).
   * Small = half-width portrait slot; medium = square; large = same height as
   * medium but bleeds to tile edges with horizontal crop.
   */
  cover?: boolean;
  /**
   * Standalone view: the box is sized externally (per item size) and the art
   * fills it edge-to-edge at the box's aspect ratio. Used by the detail art.
   */
  fill?: boolean;
  /** Rendered eagerly (e.g. in the detail modal) instead of lazily. */
  eager?: boolean;
}

const sizeClass = (size?: Size | null): string => {
  switch (size) {
    case 'Small':
      return 'is-small';
    case 'Large':
      return 'is-large';
    // Medium and skills (no size) render as a square.
    default:
      return 'is-medium';
  }
};

export const CardImage = ({ src, alt, size, circle, cover, fill, eager }: CardImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const className = [
    'CardImage',
    cover && 'is-cover',
    circle && 'is-circle',
    fill && 'is-fill',
    !circle && !fill && sizeClass(size),
    failed && 'is-failed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {!loaded && !failed && <div className="CardImage-placeholder" aria-hidden />}
      {failed ? (
        <div className="CardImage-fallback" aria-hidden>
          ?
        </div>
      ) : (
        <img
          className="CardImage-img"
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          data-loaded={loaded}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};
