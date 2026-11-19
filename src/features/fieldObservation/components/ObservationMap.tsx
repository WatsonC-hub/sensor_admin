import 'leaflet/dist/leaflet.css';
import '~/css/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {Box} from '@mui/material';
import L from 'leaflet';
import React, {useEffect, useRef} from 'react';

import {gisLayerWmsUrl} from '~/features/fieldObservation/api/useGisLayers';
import {createBackgroundLayer} from '~/features/fieldObservation/backgroundMaps';
import {badgePosition} from '~/features/fieldObservation/geo';
import {
  labelText,
  markerHtml,
  OUTLINE_PX,
  POINT_BADGE_SIZE,
  resolveStyle,
  SHAPE_BADGE_SIZE,
} from '~/features/fieldObservation/styles';
import {SingleTileWms} from '~/features/map/singleTileWms';

import type {BackgroundMapId} from '~/features/fieldObservation/backgroundMaps';
import type {MapView} from '~/features/fieldObservation/offlineTiles';
import type {
  Geometry,
  LocalObservation,
  ObservationType,
  ProjectLayer,
} from '~/features/fieldObservation/types';

export type DrawShape = Geometry['type'];

export type ObservationMapApi = {
  getCenter: () => L.LatLng;
  /** The area and zoom shown on the map now. */
  getView: () => MapView;
  /** Centre the map on the device's position, if there is one. */
  centerOnUser: () => void;
  /** The latest GPS fix, if any. */
  lastFix: () => {latlng: L.LatLng; accuracy: number} | null;
  /** Draw with Geoman (desktop): clicks on the map. Calls onDone once with the geometry. */
  startDraw: (shape: DrawShape, onDone: (geom: Geometry) => void) => void;
  cancelDraw: () => void;
  /** Let the user move a feltobservation's points with Geoman. False if it isn't on the map. */
  startEdit: (id: string) => boolean;
  /** End editing and return the edited geometry (null if nothing was being edited). */
  finishEdit: () => Geometry | null;
  /** End editing and put the feature back as it was. */
  cancelEdit: () => void;
  /** Zoom to the given geometries. */
  fitTo: (geoms: Geometry[]) => void;
  /** Start following the GPS again (e.g. after the user allowed location). */
  relocate: () => void;
  /** A point feltobservation within a finger's width of `latlng`, or `latlng` itself. */
  snapToPoint: (latlng: L.LatLng) => L.LatLng;
};

/** A geometry being built with the crosshair (mobile): its points so far, as [lat, lng]. */
export type Draft = {shape: DrawShape; vertices: L.LatLngTuple[]};

type Props = {
  observations: LocalObservation[];
  types: ObservationType[];
  /** Explorer GIS layer ids ("schema.table") to show, bottom first. */
  gisLayerIds: string[];
  /** Opacity (0–1) per GIS layer id; a missing id is fully opaque. */
  gisLayerOpacity: Record<string, number>;
  background: BackgroundMapId;
  ortofotoYear: number | null;
  draft: Draft | null;
  /** Projektlag to show (already filtered to the visible ones), top layer first. */
  projectLayers: ProjectLayer[];
  /** Compass heading of the device (0 = north), shown as a cone on the position dot. */
  heading: number | null;
  onSelect: (id: string) => void;
  onReady: (api: ObservationMapApi) => void;
};

const DENMARK: L.LatLngTuple = [56.215868, 8.228759];

const DRAFT_COLOR = '#d32f2f';
const USER_ZOOM = 17;
/** Map labels show from this zoom; further out they would cover each other and the map. */
const LABEL_MIN_ZOOM = 16;
/** On the map container while zoomed out past LABEL_MIN_ZOOM (see leaflet.css). */
const LABELS_OFF_CLASS = 'fo-labels-off';

/** A permanent label to the right of a badge `size` px wide. */
const bindLabel = (layer: L.Layer, text: string, size: number) =>
  layer.bindTooltip(text, {
    permanent: true,
    direction: 'right',
    offset: [size / 2, 0],
    className: 'fo-label',
  });

const GIS_PANE = 'gis';
// Projektlag: above Explorer's GIS layers, below the feltobservationer.
const PROJECT_PANE = 'projectLayers';
const PROJECT_LAYER_STYLE = {color: '#e65100', weight: 2, opacity: 0.9, fillOpacity: 0.1};
// Screen distance within which the crosshair snaps to a point feltobservation.
const SNAP_PX = 24;

// A cone pointing up (north before rotation), drawn under the position dot.
const HEADING_ICON = L.divIcon({
  className: '',
  iconSize: [80, 80],
  iconAnchor: [40, 40],
  html: `<div class="heading-cone" style="width:80px;height:80px;transition:transform 0.15s linear">
    <svg viewBox="0 0 80 80" width="80" height="80">
      <defs><linearGradient id="heading-fade" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#2a93ee" stop-opacity="0.7"/>
        <stop offset="1" stop-color="#2a93ee" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="M40 40 L22 4 A40 40 0 0 1 58 4 Z" fill="url(#heading-fade)"/>
    </svg></div>`,
});

const GEOMAN_SHAPES: Record<DrawShape, string> = {
  Point: 'Marker',
  LineString: 'Line',
  Polygon: 'Polygon',
};

type EditableLayer = L.Path | L.Marker;

const badgeIcon = (html: string, size: number) =>
  L.divIcon({className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2]});

const ObservationMap = ({
  observations,
  types,
  gisLayerIds,
  gisLayerOpacity,
  background,
  ortofotoYear,
  draft,
  projectLayers,
  heading,
  onSelect,
  onReady,
}: Props) => {
  const projectGroupRef = useRef<L.LayerGroup | null>(null);
  const headingMarkerRef = useRef<L.Marker | null>(null);
  const fixRef = useRef<{latlng: L.LatLng; accuracy: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const draftLayerRef = useRef<L.LayerGroup | null>(null);
  const wmsLayersRef = useRef(new Map<string, SingleTileWms>());
  // The drawn layer of each feltobservation, so it can be edited.
  const featureLayersRef = useRef(new Map<string, EditableLayer>());
  // The white outline and badge of each line and flade, hidden while it is edited.
  const decorationsRef = useRef(new Map<string, L.Layer[]>());
  const editingRef = useRef<EditableLayer | null>(null);
  const renderRef = useRef<() => void>(() => {});
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
    map.pm.setLang('da');
    mapRef.current = map;
    // The layer panel docks beside the map on desktop and changes its width.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(map.getContainer());
    // GIS layers sit above the base map and below the feltobservationer.
    map.createPane(GIS_PANE).style.zIndex = '350';
    map.createPane(PROJECT_PANE).style.zIndex = '370';
    // Labels are hidden with a class when zoomed out, so nothing is redrawn on zoom.
    const toggleLabels = () =>
      map.getContainer().classList.toggle(LABELS_OFF_CLASS, map.getZoom() < LABEL_MIN_ZOOM);
    toggleLabels();
    map.on('zoomend', toggleLabels);
    projectGroupRef.current = L.layerGroup().addTo(map);

    L.control.scale({position: 'bottomleft', imperial: false, maxWidth: 100}).addTo(map);

    // The user's position is always shown and followed in the background.
    const accuracyCircle = L.circle(DENMARK, {
      radius: 0,
      interactive: false,
      weight: 1,
      color: '#136aec',
      fillOpacity: 0.15,
      pmIgnore: true,
    });
    const positionDot = L.circleMarker(DENMARK, {
      radius: 7,
      interactive: false,
      color: '#fff',
      weight: 2,
      fillColor: '#2a93ee',
      fillOpacity: 1,
      pmIgnore: true,
    });
    let fix: {latlng: L.LatLng; accuracy: number} | null = null;
    const headingMarker = L.marker(DENMARK, {
      icon: HEADING_ICON,
      interactive: false,
      keyboard: false,
      pmIgnore: true,
      zIndexOffset: -1000,
      // leaflet-contextmenu's typings make these required on every marker.
      contextmenu: false,
      contextmenuItems: [],
    });
    headingMarkerRef.current = headingMarker;
    map.on('locationfound', (event: L.LocationEvent) => {
      const first = fix === null;
      fix = {latlng: event.latlng, accuracy: event.accuracy};
      fixRef.current = fix;
      headingMarker.setLatLng(event.latlng);
      accuracyCircle.setLatLng(event.latlng).setRadius(event.accuracy).addTo(map);
      positionDot.setLatLng(event.latlng).addTo(map);
      if (first) map.setView(event.latlng, USER_ZOOM);
    });
    const startLocate = () => map.locate({watch: true, setView: false, enableHighAccuracy: true});
    startLocate();

    layerRef.current = L.layerGroup().addTo(map);
    draftLayerRef.current = L.layerGroup().addTo(map);

    let drawHandler: L.PM.CreateEventHandler | null = null;
    const stopDraw = () => {
      if (drawHandler) map.off('pm:create', drawHandler);
      drawHandler = null;
      map.pm.disableDraw();
    };

    const stopEdit = () => {
      const layer = editingRef.current;
      editingRef.current = null;
      if (!layer) return null;
      layer.pm.disable();
      return (layer.toGeoJSON() as GeoJSON.Feature).geometry as Geometry;
    };

    onReady({
      getCenter: () => map.getCenter(),
      getView: () => ({bounds: map.getBounds(), zoom: map.getZoom()}),
      centerOnUser: () => {
        if (fix) map.setView(fix.latlng, Math.max(map.getZoom(), USER_ZOOM));
      },
      lastFix: () => fix,
      startDraw: (shape, onDone) => {
        stopDraw();
        drawHandler = (event) => {
          const layer = event.layer as EditableLayer;
          const geom = (layer.toGeoJSON() as GeoJSON.Feature).geometry as Geometry;
          // The feltobservation is drawn from Dexie once saved; Geoman's own layer goes.
          layer.remove();
          stopDraw();
          onDone(geom);
        };
        map.on('pm:create', drawHandler);
        map.pm.enableDraw(GEOMAN_SHAPES[shape], {
          continueDrawing: false,
          pathOptions: {color: DRAFT_COLOR},
        });
      },
      cancelDraw: stopDraw,
      startEdit: (id) => {
        stopEdit();
        const layer = featureLayersRef.current.get(id);
        if (!layer) return false;
        // The outline and badge would stay behind while points move; the next render
        // (after save or cancel) draws them again.
        decorationsRef.current.get(id)?.forEach((decoration) => decoration.remove());
        decorationsRef.current.delete(id);
        editingRef.current = layer;
        layer.pm.enable({allowSelfIntersection: false, draggable: true});
        return true;
      },
      finishEdit: stopEdit,
      cancelEdit: () => {
        stopEdit();
        renderRef.current();
      },
      relocate: () => {
        map.stopLocate();
        startLocate();
      },
      snapToPoint: (latlng) => {
        const center = map.latLngToContainerPoint(latlng);
        let best: L.LatLng = latlng;
        let bestDistance = SNAP_PX;
        for (const layer of featureLayersRef.current.values()) {
          if (!(layer instanceof L.CircleMarker || layer instanceof L.Marker)) continue;
          const point = layer.getLatLng();
          const distance = map.latLngToContainerPoint(point).distanceTo(center);
          if (distance <= bestDistance) {
            best = point;
            bestDistance = distance;
          }
        }
        return best;
      },
      fitTo: (geoms) => {
        if (geoms.length === 0) return;
        const bounds = L.geoJSON({
          type: 'FeatureCollection',
          features: geoms.map((geometry) => ({type: 'Feature', geometry, properties: {}})),
        } as GeoJSON.FeatureCollection).getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, {padding: [40, 40], maxZoom: USER_ZOOM});
      },
    });

    const wmsLayers = wmsLayersRef.current;
    const featureLayers = featureLayersRef.current;
    const decorations = decorationsRef.current;
    return () => {
      stopDraw();
      map.stopLocate();
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      draftLayerRef.current = null;
      wmsLayers.clear();
      featureLayers.clear();
      decorations.clear();
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
      layer.setOpacity(gisLayerOpacity[id] ?? 1);
    });
  }, [gisLayerIds, gisLayerOpacity]);

  useEffect(() => {
    const render = () => {
      const group = layerRef.current;
      if (!group) return;
      const typesById = new Map(types.map((type) => [type.id, type]));
      // A feature being edited keeps its layer, so Geoman's handles stay put.
      const editing = editingRef.current;
      group.eachLayer((layer) => {
        if (layer !== editing) group.removeLayer(layer);
      });
      const featureLayers = featureLayersRef.current;
      for (const [id, layer] of featureLayers) {
        if (layer !== editing) featureLayers.delete(id);
      }
      // A feature being edited has no decorations (see startEdit), so all of these are gone.
      const decorations = decorationsRef.current;
      decorations.clear();
      for (const observation of observations) {
        if (observation.deleted_at || featureLayers.has(observation.id)) continue;
        const type = typesById.get(observation.type_id);
        const style = resolveStyle(type, observation.properties);
        const label = labelText(type, observation.properties);
        const notSent = observation.dirty !== 0;
        const select = () => {
          if (editingRef.current) return;
          onSelectRef.current(observation.id);
        };
        const geoJson = {
          type: 'Feature',
          geometry: observation.geom,
          properties: {},
        } as GeoJSON.Feature;
        // Lines and flader get a white outline under them (like the white ring around a
        // badge) and a smaller badge with the type's icon, so they read as feltobservationer.
        const extras: L.Layer[] = [];
        const badgeAt = badgePosition(observation.geom);
        if (badgeAt) {
          const outline = L.geoJSON(geoJson, {
            interactive: false,
            pmIgnore: true,
            snapIgnore: true,
            style: {
              color: '#fff',
              weight: style.weight + 2 * OUTLINE_PX,
              opacity: 0.9,
              fill: false,
              lineCap: 'round',
              lineJoin: 'round',
            },
          });
          extras.push(...outline.getLayers());
          const badge = L.marker([badgeAt[1], badgeAt[0]], {
            icon: badgeIcon(markerHtml(style, notSent, SHAPE_BADGE_SIZE), SHAPE_BADGE_SIZE),
            keyboard: false,
            pmIgnore: true,
            snapIgnore: true,
            contextmenu: false,
            contextmenuItems: [],
          });
          badge.on('click', select);
          if (label) bindLabel(badge, label, SHAPE_BADGE_SIZE);
          extras.push(badge);
        }
        const feature = L.geoJSON(geoJson, {
          // Points: the type's icon in a round badge; not overført gets a dashed orange ring.
          pointToLayer: (_feature, latlng) =>
            L.marker(latlng, {
              icon: badgeIcon(markerHtml(style, notSent), POINT_BADGE_SIZE),
              keyboard: false,
              contextmenu: false,
              contextmenuItems: [],
            }),
          // Lines and flader keep their colour; not overført is drawn dotted.
          style: {
            color: style.color,
            weight: style.weight,
            dashArray: notSent ? '2 6' : style.dashArray,
            fillColor: style.color,
            fillOpacity: style.fillOpacity,
          },
        });
        const [layer] = feature.getLayers() as EditableLayer[];
        if (!layer) continue;
        layer.on('click', select);
        // A line or flade has its label on the badge, which is hidden while it is edited.
        if (label && !badgeAt) bindLabel(layer, label, POINT_BADGE_SIZE);
        // The outline goes first, so it is drawn under the line (the badge has its own pane).
        extras.forEach((extra) => group.addLayer(extra));
        if (extras.length) decorations.set(observation.id, extras);
        group.addLayer(layer);
        featureLayers.set(observation.id, layer);
      }
    };
    renderRef.current = render;
    render();
  }, [observations, types]);

  // Projektlag: reference only, so they can't be clicked; Geoman can still snap to them.
  useEffect(() => {
    const group = projectGroupRef.current;
    if (!group) return;
    group.clearLayers();
    // Bottom layer first: within the pane, a layer added later is drawn on top.
    for (const layer of [...projectLayers].reverse()) {
      const style = {...PROJECT_LAYER_STYLE, ...layer.style, pane: PROJECT_PANE};
      L.geoJSON(layer.features as GeoJSON.FeatureCollection, {
        pane: PROJECT_PANE,
        interactive: false,
        style,
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {...style, radius: 5, fillOpacity: style.fillOpacity ?? 0.6}),
      }).addTo(group);
    }
  }, [projectLayers]);

  // Compass cone on the position dot, once there is both a heading and a position.
  useEffect(() => {
    const map = mapRef.current;
    const marker = headingMarkerRef.current;
    if (!map || !marker) return;
    if (heading === null || !fixRef.current) {
      marker.remove();
      return;
    }
    if (!map.hasLayer(marker)) marker.addTo(map);
    const cone = marker.getElement()?.querySelector<HTMLElement>('.heading-cone');
    if (!cone) return;
    // Turn the shortest way: keep an unwrapped angle on the element (359° → 1° is +2°, not
    // −358°), so the CSS transition doesn't spin the cone a full turn when crossing north.
    // The element is rebuilt when the marker is added again, which resets the angle.
    const previous = Number(cone.dataset.rotation ?? heading);
    const delta = ((((heading - previous) % 360) + 540) % 360) - 180;
    const rotation = previous + delta;
    cone.dataset.rotation = String(rotation);
    cone.style.transform = `rotate(${rotation}deg)`;
  }, [heading]);

  // The geometry being built with the crosshair. Lines and flader follow the crosshair while
  // the map is panned, so the shape is visible before the next point is added (as Geoman does
  // with the cursor on desktop).
  useEffect(() => {
    const map = mapRef.current;
    const group = draftLayerRef.current;
    if (!map || !group) return;
    group.clearLayers();
    if (!draft) return;
    const style = {color: DRAFT_COLOR, weight: 3, dashArray: '6 6', interactive: false};
    for (const vertex of draft.vertices) {
      L.circleMarker(vertex, {
        radius: 5,
        color: '#fff',
        weight: 2,
        fillColor: DRAFT_COLOR,
        fillOpacity: 1,
        interactive: false,
      }).addTo(group);
    }
    if (draft.shape === 'Point' || draft.vertices.length === 0) return;
    const preview =
      draft.shape === 'Polygon'
        ? L.polygon([], {...style, fillOpacity: 0.1}).addTo(group)
        : L.polyline([], style).addTo(group);
    const fixed = draft.vertices.map((vertex) => L.latLng(vertex));
    const follow = () => preview.setLatLngs([...fixed, map.getCenter()]);
    follow();
    map.on('move', follow);
    return () => {
      map.off('move', follow);
    };
  }, [draft]);

  return <Box ref={containerRef} sx={{position: 'absolute', inset: 0, zIndex: 0}} />;
};

export default ObservationMap;
