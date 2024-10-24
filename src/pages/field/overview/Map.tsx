import {Box, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L, {LeafletMouseEvent} from 'leaflet';
import '~/css/leaflet.css';
import {useRef, useEffect, useState, SyntheticEvent, useCallback, useMemo} from 'react';
import {toast} from 'react-toastify';
import utmObj from 'utm-latlng';

import {apiClient} from '~/apiClient';
import AlertDialog from '~/components/AlertDialog';
import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import {mapboxToken, boreholeColors} from '~/consts';
import {useParkering} from '~/features/parkering/api/useParkering';
import {useLeafletMapRoute} from '~/features/parkeringRute/api/useLeafletMapRoute';
import {NotificationMap, useNotificationOverviewMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import BoreholeActions from '~/pages/field/overview/components/BoreholeActions';
import BoreholeContent from '~/pages/field/overview/components/BoreholeContent';
import DrawerComponent from '~/pages/field/overview/components/DrawerComponent';
import LegendContent from '~/pages/field/overview/components/LegendContent';
import {getColor} from '~/pages/field/overview/components/NotificationIcon';
import SearchAndFilterMap from '~/pages/field/overview/components/SearchAndFilterMap';
import SensorActions from '~/pages/field/overview/components/SensorActions';
import SensorContent from '~/pages/field/overview/components/SensorContent';
import {atomWithTimedStorage} from '~/state/atoms';
import {stamdataStore, authStore, parkingStore} from '~/state/store';
import {BoreholeMapData, LeafletMapRoute, Parking, PartialBy} from '~/types';

const utm = new utmObj();

let hightlightedMarker: L.CircleMarker | null = null;
let highlightedParking: L.Marker | null = null;

const defaultRadius = 8;
const smallRadius = 4;
const highlightRadius = 14;
const zoomThresholdForParking = 15;
const zoomThresholdForSmallMarkers = 8;
const zoomThreshold = 14;
const markerNumThreshold = 10;

const defaultCircleMarkerStyle = {
  radius: defaultRadius,
  weight: 1,
  fillOpacity: 0.8,
  opacity: 0.8,
  color: '#000000',
};

const routeStyle: L.PathOptions = {
  weight: 5,
  color: '#e50000',
  opacity: 0.8,
};

const zoomAtom = atomWithTimedStorage<number | null>('mapZoom', null, 1000 * 60 * 30);
const panAtom = atomWithTimedStorage<L.LatLng | null>('mapPan', null, 1000 * 60 * 30);

const boreholeSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"/><path style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2" d="M12 16V8"/></svg>`;

// const parkingSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:#22b;fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"></circle><text x="8" y="16" style="stroke:white;fill:white;stroke-width:1">P</text></svg>`;
const parkingSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:{color};stroke-linecap:round;stroke-linejoin:round;stroke-width:1"></circle><text x="8.5" y="16" style="stroke:#fff;stroke-width:1">P</text></svg>`;

const leafletIcons = Object.keys(boreholeColors).map((key) => {
  const index = parseInt(key);
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: L.Util.template(boreholeSVG, {color: boreholeColors[index].color}),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
});

const parkingIcon = new L.DivIcon({
  className: 'parking-icon',
  html: L.Util.template(parkingSVG, {color: '#000'}),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hightlightParkingIcon = new L.DivIcon({
  className: 'highlight-parking-icon',
  html: L.Util.template(parkingSVG, {color: 'rgba(10, 100, 200, 1)'}),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

declare module 'leaflet' {
  interface CircleMarkerOptions {
    contextmenu?: boolean;
    contextmenuItems?: Array<object>;
    title?: string;
    data?: NotificationMap;
    icon?: any;
    visible?: boolean;
  }

  interface MarkerOptions {
    contextmenu?: boolean;
    contextmenuItems?: Array<object>;
    title?: string;
    data?: BoreholeMapData | Parking;
  }

  interface MapOptions {
    contextmenu?: boolean;
    contextmenuItems?: any[];
    contextmenuWidth?: number;
  }

  interface Popup {
    _source: Marker | CircleMarker;
  }

  interface LeafletMouseEvent {
    sourceTarget: Marker | CircleMarker;
  }

  interface Marker {
    bindContextMenu: (options: {
      contextmenu?: boolean;
      contextmenuInheritItems: boolean;
      contextmenuItems?: Array<string | object>;
    }) => void;
  }

  interface CircleMarker {
    bindContextMenu: (options: {
      contextmenu?: boolean;
      contextmenuInheritItems: boolean;
      contextmenuItems?: Array<string | object>;
    }) => void;
  }

  interface Layer {
    toGeoJSON: () => GeoJSON.Feature | GeoJSON.GeoJsonObject;
    bindContextMenu: (options: {
      contextmenu?: boolean;
      contextmenuInheritItems: boolean;
      contextmenuItems?: Array<string | object>;
    }) => void;
  }
}

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

function Map() {
  const {createStamdata} = useNavigationFunctions();
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.FeatureGroup | null>(null);
  const parkingLayerRef = useRef<L.FeatureGroup | null>(null);
  const tooltipRef = useRef<L.FeatureGroup | null>(null);
  const geoJsonRef = useRef<L.FeatureGroup | null>(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [displayDelete, setDisplayDelete] = useState<boolean>(false);
  const [deleteTitle, setDeleteTitle] = useState<string>(
    'Er du sikker du vil slette denne parkering?'
  );
  const [setSelectParking] = parkingStore((state) => [state.setSelectedLocId]);
  const [deleteId, setDeleteId] = useState<number>();
  const [type, setType] = useState<string>('parkering');
  const [filteredData, setFilteredData] = useState<(NotificationMap | BoreholeMapData)[]>([]);
  const mutateParkingRef = useRef<boolean>(false);
  const mutateLeafletMapRouteRef = useRef<number | boolean | null>();

  const [selectedMarker, setSelectedMarker] = useState<
    NotificationMap | BoreholeMapData | Parking | null | undefined
  >(null);

  const [setLocation, setLocationValue] = stamdataStore((store) => [
    store.setLocation,
    store.setLocationValue,
  ]);

  const [superUser, iotAccess, boreholeAccess] = authStore((state) => [
    state.superUser,
    state.iotAccess,
    state.boreholeAccess,
  ]);

  const {data: boreholeMapdata} = useQuery<BoreholeMapData[]>({
    queryKey: ['borehole_map'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_map`);
      return data;
    },
    enabled: boreholeAccess,
  });

  const {data: mapData} = useNotificationOverviewMap({
    enabled: iotAccess,
  });

  const data = useMemo(() => {
    return [...(mapData ?? []), ...(boreholeMapdata ?? [])];
  }, [mapData, boreholeMapdata]);

  const {
    get: {data: leafletMapRoutes},
    post: postLeafletMapRoute,
    del: deleteLeafletMapRoute,
  } = useLeafletMapRoute();

  const {
    get: {data: parkings},
    post: postParkering,
    put: putParkering,
    del: deleteParkering,
  } = useParkering();

  const contextmenuItems: Array<any> = [];

  if (iotAccess)
    contextmenuItems.push({
      text: 'Opret ny lokation',
      callback: function (e: LeafletMouseEvent) {
        // @ts-expect-error error in type definition
        const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

        if (typeof coords == 'object') {
          setLocationValue('x', parseFloat(coords.Easting.toFixed(2)));
          setLocationValue('y', parseFloat(coords.Northing.toFixed(2)));

          createStamdata();
        }
      },
      icon: '/leaflet-images/marker.png',
    });

  contextmenuItems.push(
    ...[
      {
        text: 'Google Maps',
        callback: function (e: any) {
          if (e.relatedTarget) {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${e.relatedTarget._latlng.lat},${e.relatedTarget._latlng.lng}`,
              '_blank'
            );
          } else {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${e.latlng.lat},${e.latlng.lng}`,
              '_blank'
            );
          }
        },
        icon: '/leaflet-images/map.png',
      },
      '-', // this is a separator
      {
        text: 'Zoom ind',
        callback: function () {
          if (mapRef && mapRef.current) mapRef.current.zoomIn();
        },
        icon: '/leaflet-images/zoom-in.png',
      },
      {
        text: 'Zoom ud',
        callback: function () {
          if (mapRef && mapRef.current) mapRef.current.zoomOut();
        },
        icon: '/leaflet-images/zoom-out.png',
      },
      {
        text: 'Centrer kort her',
        callback: function (e: any) {
          if (mapRef && mapRef.current) mapRef.current.panTo(e.latlng);
        },
        icon: '/leaflet-images/center.png',
      },
    ]
  );

  const renderMap = () => {
    const myAttributionText =
      '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';

    const toposkaermkortwmts = L.tileLayer.wms(
      'https://services.datafordeler.dk/Dkskaermkort/topo_skaermkort/1.0.0/wms?&username=WXIJZOCTKQ&password=E7WfqcwH_',
      {
        layers: 'dtk_skaermkort_daempet',
        transparent: false,
        format: 'image/png',
        attribution: myAttributionText,
      }
    );

    const satelitemapbox = L.tileLayer(
      `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        maxZoom: 20,
        attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
        id: 'mapbox/satellite-streets-v11',
        tileSize: 512,
        zoomOffset: -1,
      }
    );

    const outdormapbox = L.tileLayer(
      `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        maxZoom: 20,
        attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
      }
    );

    const map = L.map('map', {
      center: [56.215868, 8.228759],
      zoom: 7,
      layers: [outdormapbox],
      tap: false,
      renderer: L.canvas(),
      contextmenu: true,
      contextmenuWidth: 140,
      contextmenuItems: contextmenuItems,
    });
    map.pm.setLang('da');

    map.on('pm:create', async (e) => {
      const layer: L.Layer = e.layer;

      if (
        geoJsonRef &&
        geoJsonRef.current &&
        parkingStore.getState().selectedLocId !== null &&
        mutateLeafletMapRouteRef.current
      ) {
        const payload = {
          path: (parkingStore.getState().selectedLocId as number).toString(),
          data: {
            geo_route: (layer.toGeoJSON() as GeoJSON.Feature).geometry,
          },
        };

        postLeafletMapRoute.mutate(payload, {
          onSettled: () => {
            mutateLeafletMapRouteRef.current = false;
          },
        });
      }
      layer.remove();
    });

    map.attributionControl.setPrefix(false);

    const baseMaps = {
      OpenStreetMap: outdormapbox,
      'DTK Skærmkort dæmpet': toposkaermkortwmts,
      Satelit: satelitemapbox,
    };

    L.control.layers(baseMaps).addTo(map);

    L.control
      // @ts-expect-error Locate is injected
      .locate({
        showPopup: false,
        strings: {
          title: 'Find mig',
        },
        circleStyle: {
          interactive: false,
        },
        locateOptions: {
          enableHighAccuracy: true,
        },
      })
      .addTo(map);

    map.on('moveend', mapEvent);

    map.on('click', function (e) {
      setSelectedMarker(null);
      if (hightlightedMarker) {
        hightlightedMarker.setStyle(defaultCircleMarkerStyle);
        hightlightedMarker = null;
      }
      if (!hightlightedMarker && highlightedParking && highlightedParking.options) {
        highlightParking((highlightedParking.options.data as Parking).loc_id, false);
        highlightedParking = null;
      }

      if (
        parkingStore.getState().selectedLocId &&
        parkingStore.getState().selectedLocId !== null &&
        mutateParkingRef.current
      ) {
        // @ts-expect-error error in type definition
        const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

        if (typeof coords == 'object') {
          const loc_id = parkingStore.getState().selectedLocId;

          const parkering: PartialBy<Parking, 'parking_id'> = {
            loc_id: loc_id as number,
            x: parseFloat(coords.Easting.toFixed(2)),
            y: parseFloat(coords.Northing.toFixed(2)),
          };
          const payload = {
            path: '',
            data: parkering,
          };

          postParkering.mutate(payload, {
            onSettled: () => {
              highlightParking(loc_id as number, true);
              setSelectParking(null);
              mutateParkingRef.current = false;
              toast.dismiss('tilknytParking');
            },
          });
          map.getContainer().style.cursor = '';
        }
      }
    });

    return map;
  };

  function highlightParking(loc_id: number, highlight: boolean) {
    if (parkingLayerRef && parkingLayerRef.current) {
      parkingLayerRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.options.data) {
          const parking = layer.options.data as Parking;
          if (parking.loc_id === loc_id) {
            let view = parkingIcon;
            if (highlight) view = hightlightParkingIcon;
            layer.setIcon(view);
            highlightedParking = layer;
          }
        }
      });
    }
  }
  const mapEvent: L.LeafletEventHandlerFn = () => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    setZoom(zoom);
    setPan(map.getCenter());

    const layer = layerRef.current;
    if (!layer) return;

    const parkingLayer = parkingLayerRef.current;
    if (!parkingLayer) return;

    const geoJsonLayer = geoJsonRef.current;
    if (!geoJsonLayer) return;

    const tooltipLayer = tooltipRef.current;
    if (!tooltipLayer) return;

    if (zoom > zoomThresholdForParking && leafletMapRoutes && leafletMapRoutes.length > 0) {
      geoJsonLayer.addTo(map);
      // geoJsonLayer.setStyle(routeStyle);
    } else map.removeLayer(geoJsonLayer);

    if (zoom > zoomThresholdForParking && parkings && parkings.length > 0) parkingLayer.addTo(map);
    else map.removeLayer(parkingLayer);

    const bounds = map.getBounds();
    const markersInViewport: (L.Marker | L.CircleMarker)[] = [];
    layer?.eachLayer(function (marker) {
      if (marker instanceof L.Marker || marker instanceof L.CircleMarker) {
        if (bounds.contains(marker.getLatLng())) {
          markersInViewport.push(marker);
        }
      }
    });

    if (zoom < zoomThresholdForSmallMarkers) {
      markersInViewport.forEach(function (layer) {
        if (layer instanceof L.CircleMarker)
          layer.setRadius(layer.options.data ? smallRadius : smallRadius + 2);
      });
    } else {
      markersInViewport.forEach(function (layer) {
        if (layer instanceof L.CircleMarker)
          layer.setRadius(layer.options.data ? defaultRadius : defaultRadius + 4);
      });
    }

    if (zoom > zoomThreshold || markersInViewport.length < markerNumThreshold) {
      tooltipLayer.clearLayers();

      markersInViewport.forEach(function (layer) {
        const tooltip = L.tooltip({
          opacity: 0.7,
          className: 'custom-tooltip',
          permanent: true,
          offset: [5, -10],
        })
          .setLatLng(layer.getLatLng())
          .setContent(layer.options.title?.toString() || '');

        tooltip.addTo(tooltipLayer);
      });

      tooltipLayer.addTo(map);
    } else {
      map.removeLayer(tooltipLayer);
    }
  };

  useEffect(() => {
    geoJsonRef.current?.clearLayers();
    if (geoJsonRef.current) {
      const active_loc_ids = filteredData.map((item) => {
        if ('loc_id' in item) {
          return item.loc_id;
        }
      });
      if (mapRef && mapRef.current && filteredData.length > 0) {
        if (leafletMapRoutes && leafletMapRoutes.length > 0) {
          leafletMapRoutes.forEach((route: LeafletMapRoute) => {
            if (active_loc_ids.includes(route.geo_route.loc_id)) {
              const geo = L.geoJSON(route.geo_route, {
                onEachFeature: function onEachFeature(feature, layer) {
                  layer.bindContextMenu({
                    contextmenu: superUser,
                    contextmenuInheritItems: true,
                    contextmenuItems: [
                      {
                        text: 'Slet rute',
                        callback: () => {
                          setDeleteId(route.geo_route.route_id);
                          mutateLeafletMapRouteRef.current = route.geo_route.loc_id;
                          setDisplayDelete(true);
                          setType('rute');
                          setDeleteTitle('Er du sikker på at du vil slette denne rute?');
                        },
                        icon: '/mapRoute.png',
                      },
                    ],
                  });
                },
              });
              if (geoJsonRef && geoJsonRef.current) {
                geo.addTo(geoJsonRef.current);
              }
            }
          });
          geoJsonRef.current.setStyle(routeStyle);
        }
      }
    }
  }, [leafletMapRoutes, geoJsonRef.current, filteredData]);

  useEffect(() => {
    parkingLayerRef.current?.clearLayers();
    if (mapRef && mapRef.current && parkings && parkings.length > 0 && filteredData.length > 0) {
      const active_loc_ids = filteredData.map((item) => {
        if ('loc_id' in item) {
          return item.loc_id;
        }
      });
      parkings.forEach((parking: Parking) => {
        if (parking.loc_id !== null && active_loc_ids.includes(parking.loc_id)) {
          const coords = utm.convertUtmToLatLng(parking.x, parking.y, 32, 'N');
          if (typeof coords != 'object') return;

          const parkingMenu = [
            {
              text: 'Slet parkering',
              callback: () => {
                let locationCounter = 0;
                if (layerRef && layerRef.current) {
                  layerRef.current.eachLayer(function (marker) {
                    if (
                      marker instanceof L.CircleMarker &&
                      marker.options.data &&
                      marker.options.data.loc_id === parking.loc_id
                    ) {
                      locationCounter++;
                    }
                  });

                  setDeleteId(parking.parking_id);
                  setDisplayDelete(true);
                  setType('parkering');
                  if (locationCounter >= 1) {
                    const tekst =
                      locationCounter === 1 ? 'en lokation' : locationCounter + ' lokationer';
                    setDeleteTitle(
                      `Parkeringen er tilknyttet ${tekst}. Er du sikker på at du gerne vil slette parkeringen?`
                    );
                  }
                }
              },
              icon: '/parking-icon.png',
            },
            ...contextmenuItems.slice(1),
          ];

          const point: L.LatLngExpression = [coords.lat, coords.lng];
          const parkingMarker = L.marker(point, {
            data: parking,
            icon: parkingIcon,
          });

          parkingMarker.bindContextMenu({
            contextmenu: superUser,
            contextmenuInheritItems: false,
            contextmenuItems: [...parkingMenu],
          });
          parkingMarker.on('click', () => {
            const loc_id = parkingStore.getState().selectedLocId;

            if (loc_id != null && mutateParkingRef.current) {
              const payload = {
                data: {
                  loc_id: loc_id,
                },
                path: parking.parking_id.toString(),
              };
              putParkering.mutate(payload, {
                onSettled: () => {
                  highlightParking(parking.loc_id, true);
                  setSelectParking(null);
                  mutateParkingRef.current = false;
                  toast.dismiss('tilknytParking');
                },
              });
              if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
            }
          });
          if (parkingLayerRef.current) {
            parkingMarker.addTo(parkingLayerRef.current);
          }
          if (
            hightlightedMarker &&
            hightlightedMarker.options.data &&
            hightlightedMarker.options.data.loc_id === parking.loc_id
          )
            highlightParking(parking.loc_id, true);
        }
      });
    }
  }, [parkings, parkingLayerRef.current, filteredData]);

  useEffect(() => {
    mapRef.current = renderMap();
    parkingLayerRef.current = L.featureGroup();
    layerRef.current = L.featureGroup().addTo(mapRef.current);
    tooltipRef.current = L.featureGroup();
    geoJsonRef.current = L.featureGroup();
    geoJsonRef.current.setStyle(routeStyle);

    mapRef.current.pm.setGlobalOptions({
      snappable: true,
      snapDistance: 5,
      pathOptions: routeStyle,
    });

    layerRef.current.on('click', function (e: L.LeafletMouseEvent) {
      L.DomEvent.stopPropagation(e);
      setSelectedMarker(e.sourceTarget.options.data);
      if (hightlightedMarker) {
        hightlightedMarker.setStyle(defaultCircleMarkerStyle);
      }
      if ('setStyle' in e.sourceTarget) {
        e.sourceTarget.setStyle({
          stroke: true,
          color: 'rgba(10, 100, 200, 1)',
          weight: (highlightRadius - defaultRadius) / 1,
          radius: highlightRadius,
        });
        hightlightedMarker = e.sourceTarget;

        if (highlightedParking) highlightedParking.setIcon(parkingIcon);

        if (e.sourceTarget.options.data) {
          const loc_id = e.sourceTarget.options.data?.loc_id;
          highlightParking(loc_id, true);
        }
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    layerRef.current?.clearLayers();
    const sorted = filteredData.sort((a, b) => {
      if ('loc_id' in a && 'loc_id' in b) {
        if (a.flag === b.flag) {
          if (a.obsNotifications.length === 0 && b.obsNotifications.length === 0) return 0;
          if (a.obsNotifications.length === 0) return -1;
          if (b.obsNotifications.length === 0) return 1;
          return a.obsNotifications[0].flag - b.obsNotifications[0].flag;
        }
        return a.flag - b.flag;
      }
      if ('boreholeno' in a && 'boreholeno' in b) {
        return Math.max(...a.status) - Math.max(...b.status);
      }
      return 0;
    });

    sorted.forEach((element) => {
      if ('loc_id' in element) {
        const marker = createLocationMarker(element);

        if (marker) {
          marker.bindTooltip(element.loc_name, {
            direction: 'top',
            offset: [0, -10],
          });

          if (layerRef.current) {
            marker.addTo(layerRef.current);
          }
        }
      } else {
        const marker = createBoreholeMarker(element);

        marker.bindTooltip(element.boreholeno, {
          direction: 'top',
          offset: [0, -10],
        });

        if (layerRef.current) {
          marker.addTo(layerRef.current);
        }
      }
    });

    if (zoom !== null && pan !== null) {
      mapRef.current?.setView(pan, zoom);
    } else {
      if (layerRef.current?.getBounds().isValid() && mapRef.current) {
        const zoom = mapRef.current.getZoom();
        const localPan = pan ? pan : mapRef.current.getCenter();
        mapRef.current?.setView(localPan, zoom);
      }
    }
  }, [filteredData]);

  const handleSearchSelect = useCallback(
    (e: SyntheticEvent, value: string | LocItems | null) => {
      if (value !== null && typeof value == 'object' && layerRef.current && mapRef.current) {
        if (value.sensor) {
          // @ts-expect-error Getlayers returns markers
          const markers: L.Marker[] = layerRef.current.getLayers();
          const marker = markers.find((marker) => marker.options.title == value.name);

          if (marker) {
            marker.openPopup();
            mapRef.current?.flyTo(marker.getLatLng(), 14, {
              animate: false,
            });
            marker.fire('click');
            setSelectedMarker(marker.options.data);
          } else {
            const newData = mapData?.find((item) => item.loc_name == value.name);
            if (newData) {
              const hiddenMarker = createLocationMarker(newData);
              setFilteredData((prev) => [...prev, newData]);
              setSelectedMarker(newData);
              if (hiddenMarker) {
                // hightlightedMarker = marker;
                hiddenMarker.openPopup();
                mapRef.current?.flyTo(hiddenMarker.getLatLng(), 14, {
                  animate: false,
                });
                hiddenMarker.fire('click');
              }
            }
          }
        } else {
          apiClient
            .get<BoreholeMapData>(`/sensor_field/jupiter/search/${value.name}`)
            .then((res) => {
              const element = res.data;

              const point: L.LatLngExpression = [element.latitude, element.longitude];

              const marker = createBoreholeMarker(element);

              marker.on('add', function () {
                mapRef.current?.flyTo(point, 16, {
                  animate: false,
                });
                marker.fire('click');
                setSelectedMarker(element);
              });
              if (layerRef.current) {
                marker.addTo(layerRef.current);
              }
            });
        }
      }
    },
    [layerRef.current]
  );

  const getDrawerHeader = () => {
    if (selectedMarker == null) return 'Signaturforklaring';
    if ('notification_id' in selectedMarker) return selectedMarker.loc_name;
    if ('boreholeno' in selectedMarker) return selectedMarker.boreholeno;
    return 'Signaturforklaring';
  };

  const getDrawerActions = (
    data: NotificationMap | BoreholeMapData | Parking | null | undefined
  ) => {
    if (data && 'notification_id' in data) return <SensorActions data={data} />;
    if (data && 'boreholeno' in data) return <BoreholeActions data={data} />;
  };

  const deleteParking = (parking_id: string | undefined) => {
    if (parking_id) {
      const payload = {
        path: parking_id.toString(),
      };
      deleteParkering.mutate(payload, {
        onSettled: () => {
          setSelectParking(null);
          toast.dismiss('tilknytParking');
          if (hightlightedMarker !== null) {
            const loc_id = hightlightedMarker.options.data?.loc_id;
            if (loc_id) highlightParking(loc_id, true);
          }
        },
      });
    }
  };

  const deleteRoute = (route_id: string | undefined) => {
    if (mutateLeafletMapRouteRef.current && mutateLeafletMapRouteRef.current !== null && route_id) {
      const payload = {
        path: mutateLeafletMapRouteRef.current.toString() + '/' + route_id,
      };
      deleteLeafletMapRoute.mutate(payload);
    }
  };

  const createBoreholeMarker = (element: BoreholeMapData) => {
    const point: L.LatLngExpression = [element.latitude, element.longitude];

    const maxStatus = Math.max(...element.status);

    const marker = L.marker(point, {
      icon: leafletIcons[maxStatus],
      interactive: true,
      riseOnHover: true,
      title: element.boreholeno,
      data: element,
      contextmenu: true,
    });

    return marker;
  };

  const createLocationMarker = (element: NotificationMap) => {
    const coords = utm.convertUtmToLatLng(element.x, element.y, 32, 'N');
    if (typeof coords != 'object') return;
    const point: L.LatLngExpression = [coords.lat, coords.lng];
    const marker = L.circleMarker(point, {
      ...defaultCircleMarkerStyle,
      interactive: true,
      fillColor: getColor(element),
      title: element.loc_name,
      data: element,
      contextmenu: true,
    });

    let locationMenu = [
      {
        text: 'Opret tidsserie',
        callback: () => {
          setLocation({
            loc_id: element.loc_id,
            loc_name: element.loc_name,
          });
          createStamdata('1');
        },
        icon: '/leaflet-images/marker.png',
      },
      ...contextmenuItems.slice(1),
    ];

    if (superUser) {
      locationMenu = [
        ...locationMenu.slice(0, 1),
        {
          text: 'Tegn rute',
          callback: () => {
            if (mapRef && mapRef.current) {
              setSelectParking(element.loc_id);
              mutateLeafletMapRouteRef.current = true;

              mapRef.current.pm.enableDraw('Line');
            }
          },
          icon: '/mapRoute.png',
        },
        {
          text: 'Tilknyt parking',
          callback: () => {
            if (mapRef && mapRef.current) mapRef.current.getContainer().style.cursor = 'pointer';

            setSelectParking(element.loc_id);
            mutateParkingRef.current = true;
            toast('Vælg parkering for at tilknytte den lokationen', {
              toastId: 'tilknytParking',
              type: 'info',
              autoClose: false,
              draggable: false,
              closeButton: (
                <div style={{alignSelf: 'center'}}>
                  <Button
                    bttype="tertiary"
                    onClick={() => {
                      setSelectParking(null);
                      mutateParkingRef.current = false;
                      toast.dismiss('tilknytParking');
                      if (mapRef && mapRef.current) mapRef.current.getContainer().style.cursor = '';
                    }}
                  >
                    <Typography>Annuller</Typography>
                  </Button>
                </div>
              ),
            });
          },
          icon: '/parking-icon.png',
        },
        ...locationMenu.slice(1),
      ];
    }

    marker.bindContextMenu({
      contextmenu: superUser,
      contextmenuInheritItems: false,
      contextmenuItems: [...locationMenu],
    });

    if (
      element.obsNotifications.length > 0
      // && element.obsNotifications[0].flag > element.flag
    ) {
      //  .log(element.obsNotifications[0]);
      const smallMarker = L.circleMarker(point, {
        ...defaultCircleMarkerStyle,
        radius: defaultRadius + 4,
        interactive: false,
        fillOpacity: 1,
        opacity: 1,
        fillColor: getColor(element.obsNotifications[0]),
      });
      if (layerRef.current) {
        smallMarker.addTo(layerRef.current);
      }
    }

    return marker;
  };

  return (
    <>
      <DeleteAlert
        measurementId={deleteId}
        dialogOpen={displayDelete}
        onOkDelete={(id) => {
          if (type === 'parkering') deleteParking(id?.toString());
          else if (type === 'rute') deleteRoute(id?.toString());
        }}
        setDialogOpen={setDisplayDelete}
        title={deleteTitle}
        onCancel={() => setDeleteTitle('Er du sikker du vil slette denne parkering?')}
      />
      <AlertDialog
        open={displayAlert}
        setOpen={setDisplayAlert}
        title="Opret parkering"
        message="Vælg venligst hvor parkeringen skal oprettes."
        handleOpret={() => null}
      />
      <SearchAndFilterMap
        data={data}
        setData={setFilteredData}
        handleSearchSelect={handleSearchSelect}
      />
      <Box
        id="map"
        sx={{
          width: '100%',
          minHeight: '300px',
          flexGrow: 1,
        }}
      ></Box>
      <DrawerComponent
        key={getDrawerHeader()}
        enableFull={selectedMarker != null ? true : false}
        isMarkerSelected={selectedMarker !== null}
        header={getDrawerHeader()}
        actions={getDrawerActions(selectedMarker)}
      >
        {selectedMarker && 'notification_id' in selectedMarker && (
          <SensorContent data={selectedMarker} />
        )}
        {selectedMarker == null && <LegendContent />}
        {selectedMarker && 'boreholeno' in selectedMarker && boreholeAccess && (
          <BoreholeContent data={selectedMarker} />
        )}
      </DrawerComponent>
    </>
  );
}

export default Map;
