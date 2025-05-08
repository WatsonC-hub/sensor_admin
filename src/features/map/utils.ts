import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {BoreholeMapData} from '~/types';
import {boreholeSVG} from './mapConsts';
import dropletSVG from '~/features/notifications/icons/droplet.svg?raw';

import L from 'leaflet';
import './map.css';
import {getColor, getIcon} from '../notifications/utils';
import {boreholeColors} from '../notifications/consts';

const leafletIcons = Object.entries(boreholeColors).map(([, values]) => {
  // const index = parseInt(key);
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: L.Util.template(boreholeSVG, {color: values.color}),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
});

export const setIconSize = (size: number) => {
  const root = document.documentElement;

  root.style.setProperty('--icon-size', `${size}px`);
};

export const getBoreholeIcon = (marker: BoreholeMapData) => {
  const maxStatus = Math.max(...marker.status);

  return leafletIcons[maxStatus];
};

export const getNotificationIcon = (marker: MapOverview) => {
  const icon = getIcon(marker, true);
  const iconURL = L.Util.template(dropletSVG, {color: getColor(marker), icon: icon, num: ''});
  return L.divIcon({
    className: 'svg-icon',
    html: iconURL,
    iconAnchor: [12, 24],
  });
};

/**
 * @description Sorts borehole markers by their status. If both markers have a boreholeno, it sorts them by the maximum status value. If only one marker has a boreholeno, it is sorted last.
 */
export const sortBoreholeLast = (a: L.Marker<BoreholeMapData>, b: L.Marker<BoreholeMapData>) => {
  if (a.options.data.boreholeno && b.options.data.boreholeno) {
    return Math.max(b.options.data.status) - Math.max(a.options.data.status);
  }
  if (a.options.data.boreholeno) {
    return 1;
  }
  if (b.options.data.boreholeno) {
    return -1;
  }
};

/**
 * @description Sorts locations by their inactive status. Inactive locations are sorted last.
 */
const sortLocationsByInactive = (a: L.Marker<MapOverview>, b: L.Marker<MapOverview>) => {
  const aInactive = (a.options.data as MapOverview).inactive;
  const bInactive = (b.options.data as MapOverview).inactive;

  return Number(aInactive) - Number(bInactive);
};

/**
 * @description Sorts locations by their task status. Locations with tasks are sorted first.
 */
const sortLocationsByHasTask = (a: L.Marker<MapOverview>, b: L.Marker<MapOverview>) => {
  const aHasTask = (a.options.data as MapOverview).has_task;
  const bHasTask = (b.options.data as MapOverview).has_task;
  if (aHasTask === bHasTask) return undefined;
  if (aHasTask) return -1;
  if (bHasTask) return 1;
};

/**
 * @description Sorts locations by their flag status. Locations with a flag are sorted first.
 */
const sortLocationsByFlag = (a: L.Marker<MapOverview>, b: L.Marker<MapOverview>) => {
  const aFlag = (a.options.data as MapOverview).flag;
  const bFlag = (b.options.data as MapOverview).flag;

  if (aFlag !== bFlag) return (bFlag ?? 0) - (aFlag ?? 0);
};

/**
 * @description Sorts locations by their flag, task and inactive status. Locations with a flag are sorted first, followed by locations with tasks, and finally inactive locations.
 */
export const sortLocations = (a: L.Marker<MapOverview>, b: L.Marker<MapOverview>) => {
  let sortingValue = sortLocationsByFlag(a, b);
  if (sortingValue === undefined) sortingValue = sortLocationsByHasTask(a, b);
  if (sortingValue === undefined) sortingValue = sortLocationsByInactive(a, b);

  return sortingValue;
};
