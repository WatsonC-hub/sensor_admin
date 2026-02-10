import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet-active-area';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {useAtom, useAtomValue} from 'jotai';
import L from 'leaflet';
import {LocateControl} from 'leaflet.locatecontrol';
import '~/css/leaflet.css';
import './L.basemapControl';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {useParkering} from '~/features/parkering/api/useParkering';
import {useLeafletMapRoute} from '~/features/parkeringRute/api/useLeafletMapRoute';
import {useMapUtilityStore, mapUtilityStore} from '~/state/store';
import {BoreholeMapData, Parking, PartialBy} from '~/types';
import dropletSVG from '~/features/notifications/icons/droplet.svg?raw';

import {
  satelitemapbox,
  zoomThresholdForParking,
  zoomThresholdForSmallMarkers,
  zoomThreshold,
  zoomAtom,
  panAtom,
  drawStyle,
  utm,
  parkingIcon,
  hightlightParkingIcon,
  markerNumThreshold,
  defaultMapBox,
  routeStyle,
} from '../mapConsts';
import {useUser} from '~/features/auth/useUser';
import {useMapFilterStore} from '../store';
import {setIconSize} from '../utils';
import {boreholeColors, getMaxColor} from '~/features/notifications/consts';
import {getColor} from '~/features/notifications/utils';
import {useDisplayState} from '~/hooks/ui';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {usedHeightAtom, usedWidthAtom} from '~/state/atoms';
import useBreakpoints from '~/hooks/useBreakpoints';

const useMap = <TData extends object>(
  id: string,
  data: Array<TData>,
  contextmenuItems: Array<L.ContextMenuItem>,
  selectCallback?: (data: TData | null) => void
) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.MarkerClusterGroup | null>(null);
  const parkingLayerRef = useRef<L.FeatureGroup | null>(null);
  const tooltipRef = useRef<L.FeatureGroup | null>(null);
  const geoJsonRef = useRef<L.FeatureGroup | null>(null);
  const [setSelectedLocId, setEditParkingLayer, setEditRouteLayer] = useMapUtilityStore((state) => [
    state.setSelectedLocId,
    state.setEditParkingLayer,
    state.setEditRouteLayer,
  ]);
  const usedWidth = useAtomValue(usedWidthAtom);
  const usedHeight = useAtomValue(usedHeightAtom);
  const {isMobile} = useBreakpoints();

  const [doneRendering, setDoneRendering] = useState(false);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [deleteId, setDeleteId] = useState<number>();
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [displayDelete, setDisplayDelete] = useState<boolean>(false);
  const [selectedLocId] = useDisplayState((state) => [state.loc_id]);
  const [type, setType] = useState<string>('parkering');
  const {
    features: {routesAndParking},
  } = useUser();
  const [deleteTitle, setDeleteTitle] = useState<string>(
    'Er du sikker du vil slette denne parkering?'
  );
  const [selectedMarker, setSelectedMarker] = useState<TData | null | undefined>(null);
  const [filters, setLocIds] = useMapFilterStore((state) => [state.filters, state.setLocIds]);

  const setSelectedMarkerWithCallback = (data: TData | null | undefined) => {
    setSelectedMarker(data);

    if (data && 'loc_id' in data) {
      setSelectedLocId(data.loc_id as number);
    }
    if (selectCallback && data) {
      selectCallback(data);
    }
  };

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

  const defaultContextmenuItems: Array<L.ContextMenuItem> = [
    {
      text: 'Google Maps',
      callback: function (e: L.ContextMenuItemClickEvent) {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${e.latlng.lat},${e.latlng.lng}`,
          '_blank'
        );
      },
      icon: '/leaflet-images/directions.png',
    },
    {
      text: 'Zoom ind',
      callback: function () {
        if (mapRef.current) mapRef.current.zoomIn();
      },
      icon: '/leaflet-images/zoom-in.png',
    },
    {
      text: 'Zoom ud',
      callback: function () {
        if (mapRef.current) mapRef.current.zoomOut();
      },
      icon: '/leaflet-images/zoom-out.png',
    },
    {
      text: 'Centrer kort her',
      callback: function (e: L.ContextMenuItemClickEvent) {
        if (mapRef.current) mapRef.current.panTo(e.latlng);
      },
      icon: '/leaflet-images/center.png',
    },
  ];

  const items: Array<L.ContextMenuItem> = [...contextmenuItems, ...defaultContextmenuItems];

  const buildMap = () => {
    const map = L.map(id, {
      // tapHold: true,
      contextmenu: true,
      contextmenuItems: items,
    }).setView(pan, zoom);

    map.zoomControl.setPosition('bottomright');

    map.pm.setLang('da');

    map.attributionControl.setPrefix(false);

    L.control
      .scale({
        position: 'bottomleft',
        imperial: false,
        maxWidth: 100,
        updateWhenIdle: true,
      })
      .addTo(map);

    new LocateControl({
      showPopup: false,
      strings: {title: 'Find mig'},
      circleStyle: {interactive: false},
      locateOptions: {enableHighAccuracy: true},
      position: 'bottomright',
    }).addTo(map);

    L.basemapControl({
      position: 'bottomleft',
      layers: [{layer: defaultMapBox}, {layer: satelitemapbox}],
    }).addTo(map);

    onMapClickEvent(map);
    onCreateRouteEvent(map);
    onMapMoveEndEvent(map);

    return map;
  };

  const onMapClickEvent = (map: L.Map) => {
    map.on('click', function (e) {
      const loc_id = mapUtilityStore.getState().selectedLocId;
      const editParkingLayer = mapUtilityStore.getState().editParkingLayer;
      const editRouteLayer = mapUtilityStore.getState().editRouteLayer;

      setSelectedMarkerWithCallback(null);
      if (selectCallback) selectCallback(null);
      if (loc_id && editRouteLayer === null) {
        highlightParking(loc_id, false);
        setSelectedLocId(null);
      }

      if (loc_id && loc_id !== null && editParkingLayer === 'create') {
        // @ts-expect-error error in type definition
        const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

        if (typeof coords == 'object') {
          const parkering: PartialBy<Parking, 'parking_id'> = {
            loc_id: loc_id as number,
            x: parseFloat(coords.Easting.toFixed(2)),
            y: parseFloat(coords.Northing.toFixed(2)),
          };

          const payload = {path: '', data: parkering};

          setEditParkingLayer(null);

          postParkering.mutate(payload, {
            onSettled: () => {
              toast.dismiss('tilknytParking');
            },
          });

          if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
        }
      }
    });
  };

  const onCreateRouteEvent = (map: L.Map) => {
    map.on('pm:create', async (e) => {
      const layer: L.Layer = e.layer;
      const loc_id = mapUtilityStore.getState().selectedLocId;

      const editRouteLayer = mapUtilityStore.getState().editRouteLayer;

      if (geoJsonRef && geoJsonRef.current && loc_id !== null && editRouteLayer === 'create') {
        const payload = {
          path: loc_id.toString(),
          data: {geo_route: (layer.toGeoJSON() as GeoJSON.Feature).geometry},
        };

        postLeafletMapRoute.mutate(payload, {
          onSuccess: () => {},
        });
        setEditRouteLayer(null);
      }
      layer.remove();
    });
  };

  const onMapMoveEndEvent = (map: L.Map) => {
    map.on('moveend', mapEvent);
  };

  const mapEvent: L.LeafletEventHandlerFn = () => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    setZoom(zoom);
    setPan(map.getCenter());

    const layer = markerLayerRef.current;

    const parkingLayer = parkingLayerRef.current;

    const geoJsonLayer = geoJsonRef.current;

    const tooltipLayer = tooltipRef.current;

    if (geoJsonLayer) {
      if (zoom > zoomThresholdForParking && leafletMapRoutes && leafletMapRoutes.length > 0) {
        geoJsonLayer.addTo(map);
      } else map.removeLayer(geoJsonLayer);
    }

    if (parkingLayer) {
      if (zoom > zoomThresholdForParking && parkings && parkings.length > 0)
        parkingLayer.addTo(map);
      else map.removeLayer(parkingLayer);
    }

    const bounds = map.getBounds();
    const markersInViewport: (L.Marker | L.CircleMarker)[] = [];
    layer?.eachLayer(function (marker) {
      if (marker instanceof L.Marker || marker instanceof L.CircleMarker) {
        if (bounds.contains(marker.getLatLng())) {
          markersInViewport.push(marker);
        }
      }
    });

    setLocIds(
      markersInViewport.map((marker) => {
        const data = marker.options.data as MapOverview | BoreholeMapData;
        if ('loc_id' in data) {
          return data.loc_id;
        }
        return data.boreholeno;
      })
    );

    if (zoom < zoomThresholdForSmallMarkers) {
      setIconSize(24);
    } else {
      setIconSize(48);
    }
    if (tooltipLayer) {
      if (zoom > zoomThreshold || markersInViewport.length < markerNumThreshold) {
        tooltipLayer.clearLayers();

        markersInViewport.forEach(function (layer) {
          const tooltip = L.tooltip({
            opacity: 0.7,
            className: 'custom-tooltip',
            permanent: true,
            offset: [13, -1],
          })
            .setLatLng(layer.getLatLng())
            .setContent(layer.options.title?.toString() || '');

          tooltip.addTo(tooltipLayer);
        });

        tooltipLayer.addTo(map);
      } else {
        map.removeLayer(tooltipLayer);
      }
    }
  };

  const plotRoutesInLayer = () => {
    geoJsonRef.current?.clearLayers();
    if (geoJsonRef.current) {
      const active_loc_ids = data.map((item) => {
        if ('loc_id' in item) {
          return item.loc_id;
        }
      });
      if (mapRef && mapRef.current && data.length > 0 && zoom > zoomThresholdForParking) {
        if (leafletMapRoutes && leafletMapRoutes.length > 0) {
          const geo = L.geoJSON(leafletMapRoutes, {
            style: routeStyle,
            filter: (feature) => {
              return active_loc_ids.includes(feature.properties.loc_id);
            },
            onEachFeature: function onEachFeature(feature, layer) {
              if (feature.properties.comment != null)
                layer.bindTooltip(feature.properties.comment, {
                  permanent: true,
                  direction: 'center',
                });
              layer.bindContextMenu({
                contextmenu: routesAndParking,
                contextmenuInheritItems: false,
                contextmenuItems: [
                  {
                    text: 'Slet rute',
                    callback: () => {
                      setDeleteId(feature.properties.id);
                      setEditRouteLayer(feature.properties.loc_id);
                      setDisplayDelete(true);
                      setType('rute');
                      setDeleteTitle('Er du sikker på at du vil slette denne rute?');
                    },
                    icon: '/mapRoute.png',
                  },
                  {text: 'divider', separator: true},
                  ...items.slice(2),
                ],
              });
            },
          });
          if (geoJsonRef && geoJsonRef.current) {
            geo.addTo(geoJsonRef.current);
          }
        }
      }
    }
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
          } else if (layer.getIcon() === hightlightParkingIcon && parking.loc_id !== loc_id) {
            layer.setIcon(parkingIcon);
          }
        }
      });
    }
  }

  const plotParkingsInLayer = () => {
    parkingLayerRef.current?.clearLayers();
    if (
      mapRef &&
      mapRef.current &&
      parkings &&
      parkings.length > 0 &&
      data.length > 0 &&
      zoom &&
      zoom > zoomThresholdForParking
    ) {
      const active_loc_ids = data.map((item) => {
        if ('loc_id' in item) {
          return item.loc_id;
        }
      });
      parkings.forEach((parking: Parking) => {
        if (parking.loc_id !== null && active_loc_ids.includes(parking.loc_id)) {
          const coords = utm.convertUtmToLatLng(parking.x, parking.y, 32, 'N');
          if (typeof coords != 'object') return;

          const parkingMenu = routesAndParking
            ? [
                {
                  text: 'Slet parkering',
                  callback: () => {
                    let locationCounter = 0;
                    if (markerLayerRef && markerLayerRef.current) {
                      markerLayerRef.current.eachLayer(function (marker) {
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
              ]
            : [];

          const point: L.LatLngExpression = [coords.lat, coords.lng];
          const parkingMarker = L.marker(point, {
            data: parking,
            icon: parkingIcon,
            contextmenu: true,
            contextmenuItems: [],
          });

          parkingMarker.bindContextMenu({
            contextmenu: routesAndParking,
            contextmenuInheritItems: false,
            contextmenuItems: [
              ...parkingMenu,
              {text: 'divider', separator: true},
              ...items.slice(2),
            ],
          });
          const editParkingLayer = mapUtilityStore.getState().editParkingLayer;
          parkingMarker.on('click', () => {
            const loc_id = mapUtilityStore.getState().selectedLocId;
            if (loc_id != null && editParkingLayer !== null) {
              const payload = {data: {loc_id: loc_id}, path: parking.parking_id.toString()};
              putParkering.mutate(payload, {
                onSettled: () => {
                  highlightParking(parking.loc_id, true);
                  setSelectedLocId(null);
                  toast.dismiss('tilknytParking');
                },
              });
              setEditParkingLayer(null);
              if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
            }
          });
          if (parkingLayerRef.current) {
            parkingMarker.addTo(parkingLayerRef.current);
          }
          if (selectedMarker && selectedLocId === parking.loc_id)
            highlightParking(parking.loc_id, true);
        }
      });
    }
  };

  const deleteParking = (parking_id: string | undefined) => {
    if (parking_id) {
      const payload = {path: parking_id.toString()};
      deleteParkering.mutate(payload, {
        onSettled: () => {
          setSelectedLocId(null);
          toast.dismiss('tilknytParking');
          if (selectedMarker) {
            if (selectedLocId) highlightParking(selectedLocId, true);
          }
        },
      });
    }
  };

  const deleteRoute = (route_id: string | undefined) => {
    const editRouteLayer = mapUtilityStore.getState().editRouteLayer;
    if (editRouteLayer && route_id) {
      const payload = {path: editRouteLayer.toString() + '/' + route_id};
      deleteLeafletMapRoute.mutate(payload);
    }
  };

  useEffect(() => {
    mapRef.current = buildMap();
    parkingLayerRef.current = L.featureGroup().addTo(mapRef.current);
    markerLayerRef.current = L.markerClusterGroup({
      // disableClusteringAtZoom: 17,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: (zoom) => {
        if (zoom < 10) return 60;
        if (zoom < 12) return 50;
        if (zoom < 17) return 30;
        return 8;
      },
      zoomToBoundsOnClick: true,
      showCoverageOnHover: false,

      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers();
        const num = childMarkers.length;

        const colors = childMarkers.map((marker) => {
          if ('loc_id' in marker.options.data) {
            return getColor(marker.options.data);
          }
          const max_status = Math.max(marker.options.data.status);
          return boreholeColors[max_status as keyof typeof boreholeColors]?.color;
        });

        const task_itinerary_id = childMarkers.find((marker) => {
          return (
            marker.options.data &&
            'itinerary_id' in marker.options.data && // Ensure data has itinerary_id
            marker.options.data.itinerary_id !== null
          );
        })?.options.data.itinerary_id;

        const loc_ids = childMarkers
          .map((marker) => marker.options.data.loc_id)
          .filter(Boolean)
          .join(' ');

        const color = getMaxColor(colors);
        return L.divIcon({
          className: 'svg-icon',
          iconAnchor: [12, 24],
          html: L.Util.template(dropletSVG, {
            color: color,
            icon: '',
            num: num,
            locId: loc_ids,
            itineraryId: task_itinerary_id ?? 'empty',
          }),
        });
      },
    }).addTo(mapRef.current);

    markerLayerRef.current?.on('click', function (e: L.LeafletMouseEvent) {
      L.DomEvent.stopPropagation(e);
      setSelectedMarkerWithCallback(e.sourceTarget.options.data);
      highlightParking(e.sourceTarget.options.data.loc_id, true);
    });

    tooltipRef.current = L.featureGroup();
    geoJsonRef.current = L.featureGroup().addTo(mapRef.current);

    // geoJsonRef.current?.setStyle(routeStyle);
    mapRef.current?.pm.setGlobalOptions({
      snappable: true,
      snapDistance: 5,
      pathOptions: drawStyle,
    });

    setDoneRendering(true);

    return () => {
      setDoneRendering(false);
      if (mapRef.current && markerLayerRef.current) {
        mapRef.current.remove();
      }
    };
  }, [mapRef.current == null, doneRendering]);

  useEffect(() => {
    plotRoutesInLayer();
  }, [geoJsonRef.current, leafletMapRoutes, data, zoom > zoomThresholdForParking]);

  useEffect(() => {
    plotParkingsInLayer();
  }, [parkingLayerRef.current, parkings, data, zoom > zoomThresholdForParking]);

  useEffect(() => {
    if (mapRef.current) onMapMoveEndEvent(mapRef.current);

    return () => {
      if (mapRef.current) mapRef.current.removeEventListener('moveend', mapEvent);
    };
  }, [leafletMapRoutes, parkings]);

  useEffect(() => {
    if (mapRef.current && filters && filters.itineraries.length > 0) {
      const markers = markerLayerRef.current?.getLayers().filter((marker) => {
        if (marker instanceof L.Marker) {
          return filters.itineraries
            .map((itinerary) => itinerary.id)
            .includes((marker.options.data as MapOverview).itinerary_id);
        }
        return false;
      });

      if (markers == undefined) return;

      const fg = new L.FeatureGroup();
      for (const marker of markers) {
        if (marker instanceof L.Marker) {
          fg.addLayer(marker);
        }
      }

      const bounds = fg.getBounds();
      if (!bounds.isValid()) return;

      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 17,
      });

      fg.clearLayers();
    }
  }, [filters.itineraries.length]);

  useEffect(() => {
    if (mapRef.current && doneRendering) {
      const right = usedWidth + (isMobile ? 0 : 20);
      const left = isMobile ? 0 : 50;
      const top = isMobile ? 0 : 50;
      const bottom = usedHeight + (isMobile ? 0 : 50);
      // @ts-expect-error active area missing in type definition
      mapRef.current.setActiveArea(
        {
          pointerEvents: 'none',
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          right: `${right}px`,
          bottom: `${bottom}px`,
        },
        true
      );
    }
  }, [usedWidth, usedHeight, doneRendering, isMobile]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      mapRef.current?.flyTo([e.detail.lat, e.detail.lng], e.detail.zoom || zoom, {animate: false});
    };

    window.addEventListener('leaflet-pan', handler as EventListener);
    return () => window.removeEventListener('leaflet-pan', handler as EventListener);
  }, [mapRef.current]);

  return {
    map: mapRef.current,
    selectedMarker,
    setSelectedMarker: setSelectedMarkerWithCallback,
    layers: {markerLayer: markerLayerRef.current},
    delete: {
      deleteId,
      deleteTitle,
      displayDelete,
      setDisplayDelete,
      deleteRoute,
      deleteParking,
      setDeleteTitle,
      type,
    },
    warning: {displayAlert, setDisplayAlert},
    defaultContextmenuItems,
  };
};

export default useMap;
