import L from 'leaflet';
import utmObj from 'utm-latlng';

import {isProduction, mapboxToken} from '~/consts';
import {atomWithTimedStorage} from '~/state/atoms';

export const utm = new utmObj();

export const zoomThresholdForParking = 13;
export const zoomThresholdForSmallMarkers = 8;
export const zoomThreshold = 14;
export const markerNumThreshold = 10;

export const routeStyle: L.PathOptions = {
  weight: 5,
  color: '#e50000',
  opacity: 0.8,
};

export const zoomAtom = atomWithTimedStorage<number>('mapZoom', 7, 1000 * 60 * 30);
export const panAtom = atomWithTimedStorage<L.LatLng | L.LatLngTuple>(
  'mapPan',
  [56.215868, 8.228759],
  1000 * 60 * 30
);

// const parkingSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:#22b;fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"></circle><text x="8" y="16" style="stroke:white;fill:white;stroke-width:1">P</text></svg>`;
const parkingSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:{color};stroke-linecap:round;stroke-linejoin:round;stroke-width:1"></circle><text x="8.5" y="16" style="stroke:#fff;stroke-width:1">P</text></svg>`;

export const satelitemapbox = L.tileLayer(
  `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
  {
    attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 20,
  }
);

const outdormapbox = L.tileLayer(
  `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
  {
    attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`,
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 20,
  }
);

const localhostMapBox = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tileSize: 512,
  zoomOffset: -1,
  maxZoom: 20,
});

let defaultMap: L.TileLayer;

if (isProduction) {
  defaultMap = outdormapbox;
} else {
  defaultMap = localhostMapBox;
}

export const defaultMapBox = defaultMap;

export const parkingIcon = new L.DivIcon({
  className: 'parking-icon',
  html: L.Util.template(parkingSVG, {color: '#000'}),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const hightlightParkingIcon = new L.DivIcon({
  className: 'highlight-parking-icon',
  html: L.Util.template(parkingSVG, {color: 'rgba(10, 100, 200, 1)'}),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
