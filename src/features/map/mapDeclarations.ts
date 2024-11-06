import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {BoreholeMapData, Parking} from '~/types';

import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

declare module 'leaflet' {
  export interface CircleMarkerOptions {
    contextmenu?: boolean;
    contextmenuItems?: Array<object>;
    title?: string;
    data?: NotificationMap;
    icon?: any;
    visible?: boolean;
  }

  export interface MarkerOptions {
    title?: string;
    data?: BoreholeMapData | Parking;
  }

  export interface Popup {
    _source: Marker | CircleMarker;
  }

  export interface LeafletMouseEvent {
    sourceTarget: Marker | CircleMarker;
  }

  export interface Marker {
    bindContextMenu: (options: {
      contextmenu?: boolean;
      contextmenuInheritItems: boolean;
      contextmenuItems?: Array<string | object>;
    }) => void;
  }

  export interface CircleMarker {
    bindContextMenu: (options: {
      contextmenu?: boolean;
      contextmenuInheritItems: boolean;
      contextmenuItems?: Array<string | object>;
    }) => void;
  }

  export interface Layer {
    toGeoJSON: () => GeoJSON.Feature | GeoJSON.GeoJsonObject;
    bindContextMenu: (options: {
      contextmenu?: boolean;
      contextmenuInheritItems: boolean;
      contextmenuItems?: Array<string | object>;
    }) => void;
  }
}
