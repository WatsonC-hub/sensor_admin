import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {BoreholeMapData} from '~/types';
import dropletSVG from '~/features/notifications/icons/droplet.svg?raw';

import L from 'leaflet';
import './map.css';
import {getBoreholeColor, getBoreholeIcon, getColor, getIcon} from '../notifications/utils';

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

export function preventClickAfterTouchend(id: string, longPressDuration = 600) {
  let longPressTimer: number;
  let suppressClick = false;

  const element = document.getElementById(id);

  element?.addEventListener('touchstart', (e) => {
    // Only handle single-finger touches
    if (e.touches.length > 1) return;
    longPressTimer = setTimeout(() => {
      // Trigger your context menu logic
      suppressClick = true;
    }, longPressDuration);
  });

  element?.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
    // Let click suppression only last a tiny bit
    if (suppressClick) {
      setTimeout(() => {
        suppressClick = false;
      }, 100);
    }
  });

  const contextMenues = document.querySelectorAll('.leaflet-contextmenu');

  contextMenues.forEach((menu) => {
    menu?.addEventListener('click', (e) => {
      if (suppressClick) {
        // toast.info('Click suppressed');
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    });
  });
}
