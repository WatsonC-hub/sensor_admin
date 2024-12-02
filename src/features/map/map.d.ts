import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {LocateOptions} from 'leaflet';

declare module 'leaflet' {
  export interface CircleMarkerOptions<TData = any> {
    contextmenu?: boolean;
    contextmenuItems?: Array<object>;
    title?: string;
    data?: TData;
    icon?: any;
    visible?: boolean;
  }

  export interface MarkerOptions<TData = any> {
    title?: string;
    data?: TData;
  }

  export interface Popup {
    _source: Marker | CircleMarker;
  }

  export interface LeafletMouseEvent {
    sourceTarget: Marker | CircleMarker;
  }

  export function circleMarker<P = any>(
    latlng: LatLngExpression,
    options?: CircleMarkerOptions<P>
  ): CircleMarker<P>;

  export function marker<P = any>(latlng: LatLngExpression, options?: MarkerOptions<P>): Marker<P>;

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

declare module 'leaflet.locatecontrol' {
  class LocateControl extends L.Control.Locate {
    constructor(options: L.Control.LocateOptions);
  }
}
