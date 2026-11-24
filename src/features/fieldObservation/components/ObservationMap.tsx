import 'leaflet/dist/leaflet.css';
import '~/css/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {Box} from '@mui/material';
import L from 'leaflet';
import React, {useEffect, useMemo, useRef} from 'react';

import {gisLayerWmsUrl} from '~/features/fieldObservation/api/useGisLayers';
import {createBackgroundLayer} from '~/features/fieldObservation/backgroundMaps';
import {BadgeMarker} from '~/features/fieldObservation/badgeCanvas';
import {badgePosition} from '~/features/fieldObservation/geo';
import {createMapLabels} from '~/features/fieldObservation/mapLabels';
import {
  labelText,
  markerHtml,
  OUTLINE_PX,
  POINT_BADGE_SIZE,
  resolveStyle,
  SHAPE_BADGE_SIZE,
} from '~/features/fieldObservation/styles';
import {featureStyler} from '~/features/fieldObservation/vectorStyle';
import {SingleTileWms} from '~/features/map/singleTileWms';

import type {BackgroundMapId} from '~/features/fieldObservation/backgroundMaps';
import type {MapLabel} from '~/features/fieldObservation/mapLabels';
import type {MapView} from '~/features/fieldObservation/offlineTiles';
import type {ResolvedStyle} from '~/features/fieldObservation/styles';
import type {
  Geometry,
  LocalObservation,
  ObservationType,
  ProjectLayer,
  VectorLayerCache,
} from '~/features/fieldObservation/types';
import type {VectorLayerStyle} from '~/features/fieldObservation/vectorStyle';

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
  /** GIS layers stored as vector data for the projekt; drawn instead of their WMS. */
  vectorLayers: VectorLayerCache[];
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

const GIS_PANE = 'gis';
// Projektlag: above Explorer's GIS layers, below the feltobservationer.
const PROJECT_PANE = 'projectLayers';
// Feltobservationer: lines, flader and badges on one canvas, badges drawn last so they are on top
// and win a click. One canvas, not one per kind: a canvas on top would take every click.
const FEATURE_PANE = 'observations';
// A feltobservation being edited (SVG, for Geoman's handles) and the crosshair draft, above the
// canvas so they can be grabbed.
const EDIT_PANE = 'observationEdit';
/** For rows saved by the spike, before the GC2 styling was stored with the features. */
const FALLBACK_VECTOR_STYLE: VectorLayerStyle = {
  kind: 'polygon',
  classes: [
    {
      expression: '',
      style: {
        stroke: true,
        color: '#e65100',
        weight: 1,
        opacity: 0.9,
        fill: false,
        fillOpacity: 0,
        radius: 4,
      },
    },
  ],
};
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

/** How a feltobservation is drawn; kept so it can be drawn again for editing. */
type Drawn = {geom: Geometry; style: ResolvedStyle; notSent: boolean};

/** A line or flade as a Leaflet path (GeoJSON is [lng, lat]). */
const shapeLayer = (geom: Geometry, options: L.PolylineOptions): L.Path | null => {
  switch (geom.type) {
    case 'LineString':
      return L.polyline(L.GeoJSON.coordsToLatLngs(geom.coordinates, 0), options);
    case 'Polygon':
      return L.polygon(L.GeoJSON.coordsToLatLngs(geom.coordinates, 1), options);
    case 'Point':
      return null;
  }
};

/** Path options for a feltobservation's line or flade; not overført is drawn dotted. */
const shapeStyle = (style: ResolvedStyle, notSent: boolean): L.PolylineOptions => ({
  color: style.color,
  weight: style.weight,
  dashArray: notSent ? '2 6' : style.dashArray,
  fillColor: style.color,
  fillOpacity: style.fillOpacity,
});

/** A layer Geoman can edit, above the canvas: an HTML marker for a point, else an SVG path. */
const editableLayer = ({geom, style, notSent}: Drawn): EditableLayer | null => {
  if (geom.type === 'Point') {
    const [lng, lat] = geom.coordinates;
    return L.marker([lat, lng], {
      icon: badgeIcon(markerHtml(style, notSent), POINT_BADGE_SIZE),
      keyboard: false,
      contextmenu: false,
      contextmenuItems: [],
    });
  }
  return shapeLayer(geom, {...shapeStyle(style, notSent), pane: EDIT_PANE});
};

const ObservationMap = ({
  observations,
  types,
  gisLayerIds,
  vectorLayers,
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
  const featureRendererRef = useRef<L.Canvas | null>(null);
  const labelsRef = useRef<ReturnType<typeof createMapLabels> | null>(null);
  const drawnRef = useRef(new Map<string, Drawn>());
  const draftLayerRef = useRef<L.LayerGroup | null>(null);
  const wmsLayersRef = useRef(new Map<string, SingleTileWms>());
  const vectorGroupRef = useRef<L.LayerGroup | null>(null);
  // The canvas layer of each feltobservation: a point's badge, or a line or flade.
  const featureLayersRef = useRef(new Map<string, L.Path>());
  // The white outline and badge of each line and flade, removed while it is edited.
  const decorationsRef = useRef(new Map<string, L.Layer[]>());
  // The feltobservation being edited, drawn as its own layer for Geoman.
  const editingRef = useRef<{id: string; layer: EditableLayer} | null>(null);
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
    // Above the overlay pane (position dot, Leaflet's default for paths), below markers.
    map.createPane(FEATURE_PANE).style.zIndex = '420';
    map.createPane(EDIT_PANE).style.zIndex = '430';
    // Tolerance: a line can be tapped a little beside it.
    featureRendererRef.current = L.canvas({pane: FEATURE_PANE, padding: 0.5, tolerance: 4});
    const labels = createMapLabels(map, LABEL_MIN_ZOOM);
    labelsRef.current = labels;
    // A line or flade being drawn goes above the feltobservation canvas, not under it.
    map.pm.setGlobalOptions({panes: {layerPane: 'markerPane'}});
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
      const editing = editingRef.current;
      editingRef.current = null;
      labels.exclude(null);
      if (!editing) return null;
      const {layer} = editing;
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
        const drawn = drawnRef.current.get(id);
        const group = layerRef.current;
        if (!drawn || !group) return false;
        const layer = editableLayer(drawn);
        if (!layer) return false;
        // Geoman edits an HTML marker or SVG path in place of the canvas layer. The outline,
        // badge and label would stay behind while points move; the next render (after save
        // or cancel) draws them again.
        featureLayersRef.current.get(id)?.remove();
        featureLayersRef.current.delete(id);
        decorationsRef.current.get(id)?.forEach((decoration) => decoration.remove());
        decorationsRef.current.delete(id);
        labels.exclude(id);
        group.addLayer(layer);
        editingRef.current = {id, layer};
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
    const drawn = drawnRef.current;
    return () => {
      stopDraw();
      labels.remove();
      labelsRef.current = null;
      featureRendererRef.current = null;
      drawn.clear();
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

  // A GIS layer stored as vector data for the projekt is drawn from the device, not as WMS.
  const vectorIds = useMemo(() => vectorLayers.map((layer) => layer.layer_id), [vectorLayers]);

  // Vector GIS layers on one canvas in the GIS pane, so thousands of polygons stay fast. Styled
  // like GC2 draws them, in the order of the layer list.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    vectorGroupRef.current?.remove();
    const group = L.layerGroup().addTo(map);
    vectorGroupRef.current = group;
    const renderer = L.canvas({pane: GIS_PANE, padding: 0.5});
    const ordered = [...vectorLayers].sort(
      (a, b) => gisLayerIds.indexOf(a.layer_id) - gisLayerIds.indexOf(b.layer_id)
    );
    for (const cache of ordered) {
      const styleOf = featureStyler(cache.style ?? FALLBACK_VECTOR_STYLE);
      const layerOpacity = gisLayerOpacity[cache.layer_id] ?? 1;
      const pathOptions = (feature: GeoJSON.Feature | undefined): L.CircleMarkerOptions => {
        const style = styleOf(feature?.properties ?? null);
        if (!style) return {stroke: false, fill: false, renderer};
        return {
          ...style,
          opacity: style.opacity * layerOpacity,
          fillOpacity: style.fillOpacity * layerOpacity,
          renderer,
        };
      };
      L.geoJSON(cache.features, {
        pane: GIS_PANE,
        interactive: false,
        pmIgnore: true,
        snapIgnore: true,
        // GC2 draws nothing for a feature no class matches.
        filter: (feature) => styleOf(feature.properties) !== null,
        style: pathOptions,
        pointToLayer: (feature: GeoJSON.Feature, latlng) =>
          L.circleMarker(latlng, {
            ...pathOptions(feature),
            pane: GIS_PANE,
            interactive: false,
            pmIgnore: true,
            snapIgnore: true,
          }),
      }).addTo(group);
    }
    return () => {
      group.remove();
    };
  }, [vectorLayers, gisLayerIds, gisLayerOpacity]);

  // Explorer GIS layers as WMS, through Explorer's GC2 proxy (same request Explorer makes).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const shown = wmsLayersRef.current;
    for (const [id, layer] of shown) {
      if (!gisLayerIds.includes(id) || vectorIds.includes(id)) {
        layer.remove();
        shown.delete(id);
      }
    }
    gisLayerIds.forEach((id, index) => {
      if (vectorIds.includes(id)) return;
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
  }, [gisLayerIds, gisLayerOpacity, vectorIds]);

  useEffect(() => {
    const render = () => {
      const group = layerRef.current;
      const renderer = featureRendererRef.current;
      if (!group || !renderer) return;
      const typesById = new Map(types.map((type) => [type.id, type]));
      // A feature being edited keeps its layer, so Geoman's handles stay put.
      const editing = editingRef.current;
      group.eachLayer((layer) => {
        if (layer !== editing?.layer) group.removeLayer(layer);
      });
      const featureLayers = featureLayersRef.current;
      featureLayers.clear();
      // A feature being edited has no decorations (see startEdit), so all of these are gone.
      const decorations = decorationsRef.current;
      decorations.clear();
      const drawn = drawnRef.current;
      drawn.clear();
      // Badges are added after all lines and flader, so they are drawn on top and win a click.
      const badges: L.Layer[] = [];
      const labels: MapLabel[] = [];
      for (const observation of observations) {
        if (observation.deleted_at) continue;
        const type = typesById.get(observation.type_id);
        const style = resolveStyle(type, observation.properties);
        const notSent = observation.dirty !== 0;
        drawn.set(observation.id, {geom: observation.geom, style, notSent});
        if (observation.id === editing?.id) continue;
        const label = labelText(type, observation.properties);
        const select = () => {
          if (editingRef.current) return;
          onSelectRef.current(observation.id);
        };
        // The type's icon in a round badge; not overført gets a dashed orange ring.
        const badge = {color: style.color, icon: style.icon, notSent};

        if (observation.geom.type === 'Point') {
          const [lng, lat] = observation.geom.coordinates;
          const point = new BadgeMarker(
            [lat, lng],
            {...badge, size: POINT_BADGE_SIZE},
            {renderer, pane: FEATURE_PANE, bubblingMouseEvents: false}
          );
          point.on('click', select);
          badges.push(point);
          featureLayers.set(observation.id, point);
          if (label) {
            labels.push({
              id: observation.id,
              latlng: point.getLatLng(),
              text: label,
              offsetX: POINT_BADGE_SIZE / 2,
            });
          }
          continue;
        }

        // Lines and flader get a white outline under them (like the white ring around a
        // badge) and a smaller badge with the type's icon, so they read as feltobservationer.
        const outline = shapeLayer(observation.geom, {
          renderer,
          pane: FEATURE_PANE,
          interactive: false,
          pmIgnore: true,
          snapIgnore: true,
          color: '#fff',
          weight: style.weight + 2 * OUTLINE_PX,
          opacity: 0.9,
          fill: false,
          lineCap: 'round',
          lineJoin: 'round',
        });
        const shape = shapeLayer(observation.geom, {
          ...shapeStyle(style, notSent),
          renderer,
          pane: FEATURE_PANE,
        });
        if (!outline || !shape) continue;
        shape.on('click', select);
        // The outline goes first, so it is drawn under the line.
        group.addLayer(outline);
        group.addLayer(shape);
        featureLayers.set(observation.id, shape);
        const extras: L.Layer[] = [outline];
        const badgeAt = badgePosition(observation.geom);
        if (badgeAt) {
          const latlng = L.latLng(badgeAt[1], badgeAt[0]);
          const shapeBadge = new BadgeMarker(
            latlng,
            {...badge, size: SHAPE_BADGE_SIZE},
            {
              renderer,
              pane: FEATURE_PANE,
              bubblingMouseEvents: false,
              pmIgnore: true,
              snapIgnore: true,
            }
          );
          shapeBadge.on('click', select);
          badges.push(shapeBadge);
          extras.push(shapeBadge);
          // A line or flade has its label on the badge.
          if (label) {
            labels.push({id: observation.id, latlng, text: label, offsetX: SHAPE_BADGE_SIZE / 2});
          }
        }
        decorations.set(observation.id, extras);
      }
      badges.forEach((badge) => group.addLayer(badge));
      labelsRef.current?.set(labels);
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
    const style = {
      color: DRAFT_COLOR,
      weight: 3,
      dashArray: '6 6',
      interactive: false,
      pane: EDIT_PANE,
    };
    for (const vertex of draft.vertices) {
      L.circleMarker(vertex, {
        radius: 5,
        color: '#fff',
        weight: 2,
        fillColor: DRAFT_COLOR,
        fillOpacity: 1,
        interactive: false,
        pane: EDIT_PANE,
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
