import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';

/**
 * The device's compass heading (0 = north, clockwise), for the cone on the position dot.
 * The phone's compass is magnetic: steel nearby (cars, well lids, pipes) can throw it off.
 *
 * It is on whenever the device has a compass. Only iOS asks permission, and only from a tap:
 * the first time through a button, after that silently on the first tap anywhere.
 */

type OrientationEvent = DeviceOrientationEvent & {webkitCompassHeading?: number};
type PermissionRequest = {requestPermission?: () => Promise<'granted' | 'denied'>};

const GRANTED_KEY = 'fieldObservation.compassGranted';
// If no reading arrives within this time, the device has no usable compass.
const NO_COMPASS_MS = 3000;

/** Only devices with touch have a compass worth showing; desktops get nothing. */
const compassAvailable = () =>
  typeof window !== 'undefined' &&
  'DeviceOrientationEvent' in window &&
  navigator.maxTouchPoints > 0;

const permissionRequest = () =>
  typeof window === 'undefined' || !('DeviceOrientationEvent' in window)
    ? undefined
    : (DeviceOrientationEvent as unknown as PermissionRequest).requestPermission;

const rememberedGrant = () => {
  try {
    return localStorage.getItem(GRANTED_KEY) === '1';
  } catch {
    return false;
  }
};

const rememberGrant = () => {
  try {
    localStorage.setItem(GRANTED_KEY, '1');
  } catch {
    // Without storage the button just shows again next time.
  }
};

const headingOf = (event: OrientationEvent) => {
  // iOS Safari gives the compass heading directly.
  if (typeof event.webkitCompassHeading === 'number') return event.webkitCompassHeading;
  // Elsewhere alpha grows counter-clockwise, and only counts when it is relative to north.
  if (event.absolute && event.alpha !== null) return (360 - event.alpha) % 360;
  return null;
};

export const useCompass = () => {
  const needsRequest = typeof permissionRequest() === 'function';
  // Without a permission step (Android) the compass starts at once.
  const [enabled, setEnabled] = useState(() => compassAvailable() && !needsRequest);
  // iOS, never granted: a button asks. Granted before: the first tap anywhere asks silently.
  const [needsPermission, setNeedsPermission] = useState(
    () => compassAvailable() && needsRequest && !rememberedGrant()
  );
  const [heading, setHeading] = useState<number | null>(null);

  const ask = async (silent: boolean) => {
    const request = permissionRequest();
    if (!request) return;
    const answer = await request().catch(() => 'denied' as const);
    if (answer === 'granted') {
      rememberGrant();
      setNeedsPermission(false);
      setEnabled(true);
    } else {
      setNeedsPermission(true);
      if (!silent) toast.error('Adgang til kompasset blev afvist');
    }
  };

  // Granted before on iOS: ask again on the first tap, which shows no prompt this time.
  useEffect(() => {
    if (!compassAvailable() || !needsRequest || needsPermission || enabled) return;
    const onTap = () => void ask(true);
    document.addEventListener('click', onTap, {once: true, capture: true});
    return () => document.removeEventListener('click', onTap, {capture: true});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsRequest, needsPermission, enabled]);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let latest: number | null = null;
    let received = false;
    const handler = (event: Event) => {
      const value = headingOf(event as OrientationEvent);
      if (value === null) return;
      received = true;
      // The heading is for the top of the device; turn it with the screen.
      latest = (value + (screen.orientation?.angle ?? 0)) % 360;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setHeading(latest);
      });
    };
    // Chrome on Android only gives a north-based heading on the "absolute" event.
    const eventName =
      'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventName, handler);
    // No readings: the device has no usable compass; just leave the cone off.
    const timeout = window.setTimeout(() => {
      if (!received) setEnabled(false);
    }, NO_COMPASS_MS);
    return () => {
      window.removeEventListener(eventName, handler);
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [enabled]);

  return {heading, needsPermission, requestPermission: () => void ask(false)};
};
