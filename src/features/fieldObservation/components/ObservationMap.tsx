import 'leaflet/dist/leaflet.css';
import '~/css/leaflet.css';
import {Box} from '@mui/material';
import L from 'leaflet';
import React, {useEffect, useRef} from 'react';

import {gisLayerWmsUrl} from '~/features/fieldObservation/api/useGisLayers';
import {createBackgroundLayer} from '~/features/fieldObservation/backgroundMaps';
import {SingleTileWms} from '~/features/map/singleTileWms';

import type {BackgroundMapId} from '~/features/fieldObservation/backgroundMaps';
import type {LocalObservation, ObservationType} from '~/features/fieldObservation/types';

export type ObservationMapApi = {
  getCenter: () => L.LatLng;
  /** Centre the map on the device's position, if there is one. */
  centerOnUser: () => void;
  /** The latest GPS fix, if any. */
  lastFix: () => {latlng: L.LatLng; accuracy: number} | null;
};

type Props = {
  observations: LocalObservation[];
  types: ObservationType[];
  /** Explorer GIS layer ids ("schema.table") to show, bottom first. */
  gisLayerIds: string[];
  background: BackgroundMapId;
  ortofotoYear: number | null;
  onSelect: (id: string) => void;
  onReady: (api: ObservationMapApi) => void;
};

const DENMARK: L.LatLngTuple = [56.215868, 8.228759];
const FALLBACK_COLOR = '#1976d2';
const USER_ZOOM = 17;

const GIS_PANE = 'gis';

const ObservationMap = ({
  observations,
  types,
  gisLayerIds,
  background,
  ortofotoYear,
  onSelect,
  onReady,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const wmsLayersRef = useRef(new Map<string, SingleTileWms>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current) return;
    // Pinch and scroll zoom only; no +/- buttons.
    const map = L.map(containerRef.current, {
      zoomControl: false,
      contextmenu: false,
      contextmenuItems: [],
    }).setView(DENMARK, 7);
    map.attributionControl.setPrefix(false);
    mapRef.current = map;
    // GIS layers sit above the base map and below the feltobservationer.
    map.createPane(GIS_PANE).style.zIndex = '350';

    L.control.scale({position: 'bottomleft', imperial: false, maxWidth: 100}).addTo(map);

    // The user's position is always shown and followed in the background.
    const accuracyCircle = L.circle(DENMARK, {
      radius: 0,
      interactive: false,
      weight: 1,
      color: '#136aec',
      fillOpacity: 0.15,
    });
    const positionDot = L.circleMarker(DENMARK, {
      radius: 7,
      interactive: false,
      color: '#fff',
      weight: 2,
      fillColor: '#2a93ee',
      fillOpacity: 1,
    });
    let fix: {latlng: L.LatLng; accuracy: number} | null = null;
    map.on('locationfound', (event: L.LocationEvent) => {
      const first = fix === null;
      fix = {latlng: event.latlng, accuracy: event.accuracy};
      accuracyCircle.setLatLng(event.latlng).setRadius(event.accuracy).addTo(map);
      positionDot.setLatLng(event.latlng).addTo(map);
      if (first) map.setView(event.latlng, USER_ZOOM);
    });
    map.locate({watch: true, setView: false, enableHighAccuracy: true});

    layerRef.current = L.layerGroup().addTo(map);

    onReady({
      getCenter: () => map.getCenter(),
      centerOnUser: () => {
        if (fix) map.setView(fix.latlng, Math.max(map.getZoom(), USER_ZOOM));
      },
      lastFix: () => fix,
    });

    const wmsLayers = wmsLayersRef.current;
    return () => {
      map.stopLocate();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      wmsLayers.clear();
    };
    // The map is created once; onReady is only needed at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background map, chosen in the layer menu.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = createBackgroundLayer(background, ortofotoYear).addTo(map);
    return () => {
      layer.remove();
    };
  }, [background, ortofotoYear]);

  // Explorer GIS layers as WMS, through Explorer's GC2 proxy (same request Explorer makes).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const shown = wmsLayersRef.current;
    for (const [id, layer] of shown) {
      if (!gisLayerIds.includes(id)) {
        layer.remove();
        shown.delete(id);
      }
    }
    gisLayerIds.forEach((id, index) => {
      let layer = shown.get(id);
      if (!layer) {
        // One image per viewport, not tiles: GC2/MapServer renders a whole map per request.
        layer = new SingleTileWms(gisLayerWmsUrl(id), {
          layers: id,
          format: 'image/png',
          transparent: true,
          version: '1.3.0',
          pane: GIS_PANE,
        }).addTo(map);
        shown.set(id, layer);
      }
      layer.setZIndex(index + 1);
    });
  }, [gisLayerIds]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const colors = new Map(types.map((type) => [type.id, type.color ?? FALLBACK_COLOR]));
    layer.clearLayers();
    for (const observation of observations) {
      if (observation.deleted_at) continue;
      const color = colors.get(observation.type_id) ?? FALLBACK_COLOR;
      const notSent = observation.dirty !== 0;
      const feature = L.geoJSON(
        {type: 'Feature', geometry: observation.geom, properties: {}} as GeoJSON.Feature,
        {
          pointToLayer: (_feature, latlng) =>
            L.circleMarker(latlng, {
              radius: 9,
              color: notSent ? '#ed6c02' : '#fff',
              weight: notSent ? 3 : 2,
              dashArray: notSent ? '4 3' : undefined,
              fillColor: color,
              fillOpacity: 0.9,
            }),
          style: {color, weight: 4},
        }
      );
      feature.on('click', () => onSelectRef.current(observation.id));
      layer.addLayer(feature);
    }
  }, [observations, types]);

  return <Box ref={containerRef} sx={{position: 'absolute', inset: 0, zIndex: 0}} />;
};

export default ObservationMap;
