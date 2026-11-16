import {useEffect, useState} from 'react';

/**
 * Whether the browser lets the page use the device's position. 'unknown' where the
 * Permissions API can't tell (then no button is shown).
 */
export type LocationPermission = 'granted' | 'prompt' | 'denied' | 'unknown';

export const useLocationPermission = () => {
  const [state, setState] = useState<LocationPermission>('unknown');
  useEffect(() => {
    let status: PermissionStatus | null = null;
    let cancelled = false;
    const update = () => {
      if (status) setState(status.state);
    };
    void navigator.permissions
      ?.query({name: 'geolocation'})
      .then((result) => {
        if (cancelled) return;
        status = result;
        update();
        result.addEventListener('change', update);
      })
      .catch(() => setState('unknown'));
    return () => {
      cancelled = true;
      status?.removeEventListener('change', update);
    };
  }, []);
  return state;
};
