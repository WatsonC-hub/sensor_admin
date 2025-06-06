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

export const getNotificationIcon = (
  marker: MapOverview,
  advancedTaskPermission: boolean,
  simpleTaskPermission: boolean
) => {
  const icon = getIcon(
    {
      ...marker,
      advancedTaskPermission: advancedTaskPermission,
      simpleTaskPermission: simpleTaskPermission,
    },
    true
  );
  const iconURL = L.Util.template(dropletSVG, {
    color: getColor({...marker, advancedTaskPermission, simpleTaskPermission}),
    icon: icon,
    num: '',
    locId: marker.loc_id,
    itineraryId: marker.itinerary_id,
  });
  return L.divIcon({
    className: 'svg-icon',
    html: iconURL,
    iconAnchor: [12, 24],
  });
};
