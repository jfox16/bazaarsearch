import { useCallback, useEffect, useRef, useState } from 'react';

export interface DeviceTilt {
  rotateX: number;
  rotateY: number;
}

interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<PermissionState>;
}

const TILT_RANGE_DEG = 32;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const orientationToTilt = (
  beta: number,
  gamma: number,
  baseline: { beta: number; gamma: number },
  tiltMax: number,
): DeviceTilt => {
  const x = clamp((gamma - baseline.gamma) / TILT_RANGE_DEG, -0.5, 0.5);
  const y = clamp((beta - baseline.beta) / TILT_RANGE_DEG, -0.5, 0.5);

  return {
    rotateX: -y * tiltMax,
    rotateY: x * tiltMax,
  };
};

/**
 * Maps device orientation to card tilt on mobile. Calibrates to the phone's
 * position when listening starts so small movements drive the glint effect.
 */
export const useDeviceTilt = (enabled: boolean, tiltMax: number) => {
  const [tilt, setTilt] = useState<DeviceTilt>({ rotateX: 0, rotateY: 0 });
  const [active, setActive] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);
  const listening = useRef(false);

  const resetBaseline = useCallback(() => {
    baseline.current = null;
    setTilt({ rotateX: 0, rotateY: 0 });
    setActive(false);
  }, []);

  const stopListening = useCallback(() => {
    listening.current = false;
    baseline.current = null;
    setActive(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta == null || gamma == null) return;

      if (!baseline.current) {
        baseline.current = { beta, gamma };
      }

      setTilt(orientationToTilt(beta, gamma, baseline.current, tiltMax));
      setActive(true);
    },
    [tiltMax],
  );

  const startListening = useCallback(() => {
    if (listening.current) return;
    window.addEventListener('deviceorientation', handleOrientation);
    listening.current = true;
    setNeedsPermission(false);
  }, [handleOrientation]);

  const requestAccess = useCallback(async (): Promise<boolean> => {
    if (!enabled || listening.current) return listening.current;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return false;

    const Orientation = DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor;
    if (typeof Orientation.requestPermission === 'function') {
      try {
        const state = await Orientation.requestPermission();
        if (state !== 'granted') {
          setNeedsPermission(false);
          return false;
        }
      } catch {
        return false;
      }
    }

    startListening();
    return true;
  }, [enabled, startListening]);

  useEffect(() => {
    if (!enabled) {
      stopListening();
      setNeedsPermission(false);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('DeviceOrientationEvent' in window)) {
      return;
    }

    const Orientation = DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor;
    if (typeof Orientation.requestPermission === 'function') {
      setNeedsPermission(true);
      return () => {
        if (listening.current) {
          window.removeEventListener('deviceorientation', handleOrientation);
        }
        stopListening();
      };
    }

    startListening();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      stopListening();
    };
  }, [enabled, handleOrientation, startListening, stopListening]);

  return { tilt, active, needsPermission, requestAccess, resetBaseline };
};
