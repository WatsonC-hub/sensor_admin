import L from 'leaflet';

import dropletSVG from '~/features/notifications/icons/droplet.svg?raw';

import {getBoreholeColor, getBoreholeIcon, getColor, getIcon} from '../notifications/Utils';

import type {MapOverview} from '~/hooks/query/useNotificationOverview';

import './map.css';

import type {BoreholeMapData} from '~/types';

export const setIconSize = (size: number) => {
  const root = document.documentElement;

  root.style.setProperty('--icon-size', `${size}px`);
};

export const getBoreholesIcon = (marker: BoreholeMapData) => {
  const icon = getBoreholeIcon(marker, true);
  const iconURL = L.Util.template(dropletSVG, {
    color: getBoreholeColor(marker),
    icon: icon,
    num: '',
    locId: marker.boreholeno,
    itineraryId: null,
  });

  return L.divIcon({
    className: 'svg-icon',
    html: iconURL,
    iconAnchor: [12, 24],
  });
};

export const getNotificationIcon = (marker: MapOverview) => {
  const icon = getIcon(
    {
      ...marker,
    },
    true
  );
  const iconURL = L.Util.template(dropletSVG, {
    color: getColor({...marker}),
    icon: icon,
    num: '',
    locId: `${marker.loc_id}`,
    itineraryId: marker.itinerary_id,
  });
  return L.divIcon({
    className: 'svg-icon',
    html: iconURL,
    iconAnchor: [12, 24],
  });
};

export function preventLeafletPostLongPress(map: L.Map, duration = 600) {
  const container = map.getContainer();

  let timer: number | undefined;
  let longPressed = false;

  const clearTimer = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      clearTimer();
      longPressed = false;
      return;
    }

    longPressed = false;

    timer = window.setTimeout(() => {
      longPressed = true;
    }, duration);
  };

  const onMouseDown = (event: MouseEvent) => {
    if (!longPressed) return;

    event.preventDefault();
    event.stopPropagation();
  };

  /*
   * Capture phase is important here.
   *
   * We want to intercept these events before Leaflet's handlers.
   */
  container.addEventListener('touchstart', onTouchStart, {
    capture: true,
    passive: false,
  });

  container.addEventListener('mousedown', onMouseDown, true);

  return () => {
    clearTimer();
    container.removeEventListener('touchstart', onTouchStart, true);
    container.removeEventListener('mousedown', onMouseDown, true);
  };
}