import {useEffect, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

/**
 * Field has two modes, and the route is the mode:
 * - servicering: `/` and everything else in Field
 * - feltobservationer: `/observation`
 * The last mode is remembered on the device, so the app opens where the user left it.
 */
export type AppMode = 'servicering' | 'feltobservationer';

const STORAGE_KEY = 'calypso.appMode';
export const OBSERVATION_PATH = '/observation';

export const getLastMode = (): AppMode => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'feltobservationer'
      ? 'feltobservationer'
      : 'servicering';
  } catch {
    return 'servicering';
  }
};

export const setLastMode = (mode: AppMode) => {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage can be blocked; the app then just opens in servicering.
  }
};

/** Switch mode from a menu: remembers the choice and changes the route. */
export const useSwitchMode = () => {
  const navigate = useNavigate();
  return (mode: AppMode) => {
    setLastMode(mode);
    void navigate(mode === 'feltobservationer' ? OBSERVATION_PATH : '/');
  };
};

/** On app start at `/`, open the mode the user was last in. Runs once per page load. */
export const useRestoreLastMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    if (location.pathname === '/' && getLastMode() === 'feltobservationer') {
      void navigate(OBSERVATION_PATH, {replace: true});
    }
  }, [location.pathname, navigate]);
};
