import {boreholeColors} from '~/consts';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {BoreholeMapData} from '~/types';
import {boreholeSVG} from './mapConsts';
import dropletSVG from '~/features/notifications/icons/droplet.svg?raw';

import L from 'leaflet';
import './map.css';
import {getColor, getIcon} from '../notifications/utils';

const leafletIcons = Object.keys(boreholeColors).map((key) => {
  const index = parseInt(key);
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: L.Util.template(boreholeSVG, {color: boreholeColors[index].color}),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
});

// const dropletSVG = `<svg
//   xmlns="http://www.w3.org/2000/svg"

//   viewBox="0 0 24 24"
// >
//   <path
//     fill="{color}"
//     stroke="white"
//     d="M6.14 4.648A8.34 8.34 0 0 1 12 2.25c2.196 0 4.304.861 5.86 2.398c1.409 1.39 2.143 2.946 2.337 4.562c.193 1.602-.152 3.21-.81 4.718c-1.306 3-3.902 5.728-6.392 7.503a1.71 1.71 0 0 1-1.99 0c-2.49-1.775-5.086-4.504-6.393-7.503c-.657-1.508-1.001-3.116-.809-4.719c.194-1.615.928-3.17 2.337-4.561M9.25 10a2.75 2.75 0 1 1 5.5"
//   />
//     {icon}
// </svg>`;

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
