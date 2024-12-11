export type TestMapData = {
  id: number;
  loc_id: number;
  loc_name: string;
  comment: string;
  flag: number;
  x: number;
  y: number;
};

import L from 'leaflet';
import utmObj from 'utm-latlng';

import {mapboxToken} from '~/consts';
import {atomWithTimedStorage} from '~/state/atoms';

export const utm = new utmObj();

export const defaultRadius = 8;
export const smallRadius = 4;
export const highlightRadius = 14;
export const zoomThresholdForParking = 15;
export const zoomThresholdForSmallMarkers = 8;
export const zoomThreshold = 14;
export const markerNumThreshold = 10;

export const defaultCircleMarkerStyle = {
  radius: defaultRadius,
  weight: 1,
  fillOpacity: 0.8,
  opacity: 0.8,
  color: '#000000',
};

export const routeStyle: L.PathOptions = {
  weight: 5,
  color: '#e50000',
  opacity: 0.8,
};

export const zoomAtom = atomWithTimedStorage<number | null>('mapZoom', 7, 1000 * 60 * 30);
export const panAtom = atomWithTimedStorage<L.LatLng | null>('mapPan', null, 1000 * 60 * 30);

export const boreholeSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"/><path style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2" d="M12 16V8"/></svg>`;

// const parkingSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:#22b;fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"></circle><text x="8" y="16" style="stroke:white;fill:white;stroke-width:1">P</text></svg>`;
export const parkingSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:{color};stroke-linecap:round;stroke-linejoin:round;stroke-width:1"></circle><text x="8.5" y="16" style="stroke:#fff;stroke-width:1">P</text></svg>`;

const myAttributionText =
  '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';

export const toposkaermkortwmts = L.tileLayer.wms(
  'https://services.datafordeler.dk/Dkskaermkort/topo_skaermkort/1.0.0/wms?&username=WXIJZOCTKQ&password=E7WfqcwH_',
  {
    layers: 'dtk_skaermkort_daempet',
    transparent: false,
    format: 'image/png',
    attribution: myAttributionText,
  }
);

export const satelitemapbox = L.tileLayer(
  `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
  {
    maxZoom: 20,
    attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
  }
);

export const outdormapbox = L.tileLayer(
  `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
  {
    maxZoom: 20,
    attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1,
  }
);

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
