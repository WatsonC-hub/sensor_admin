import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {useAtom} from 'jotai';
import L from 'leaflet';
import {LocateControl} from 'leaflet.locatecontrol';
import '~/css/leaflet.css';
import './L.basemapControl';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {useParkering} from '~/features/parkering/api/useParkering';
import {useLeafletMapRoute} from '~/features/parkeringRute/api/useLeafletMapRoute';
import {useMapUtilityStore, mapUtilityStore} from '~/state/store';
import {LeafletMapRoute, Parking, PartialBy} from '~/types';
import droplelSVG from '~/features/notifications/icons/droplet.svg?raw';

import {
  outdormapbox,
  satelitemapbox,
  defaultCircleMarkerStyle,
  zoomThresholdForParking,
  zoomThresholdForSmallMarkers,
  zoomThreshold,
  defaultRadius,
  zoomAtom,
  panAtom,
  routeStyle,
  utm,
  parkingIcon,
  hightlightParkingIcon,
  highlightRadius,
  markerNumThreshold,
} from '../mapConsts';
import {useUser} from '~/features/auth/useUser';
import {useMapFilterStore} from '../store';
import {setIconSize} from '../utils';
import {boreholeColors, BoreHoleFlagEnum} from '~/features/notifications/consts';
import {getColor} from '~/features/notifications/utils';

// const highlightedParking: L.Marker | null = null;

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
  const [setSelectParking, setEditParkingLayer, setEditRouteLayer] = useMapUtilityStore((state) => [
    state.setSelectedLocId,
    state.setEditParkingLayer,
    state.setEditRouteLayer,
  ]);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [deleteId, setDeleteId] = useState<number>();
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [displayDelete, setDisplayDelete] = useState<boolean>(false);
  const [hightlightedMarker, setHightlightedMarker] = useState<L.CircleMarker | null>();
  const [, setHighlightedParking] = useState<L.Marker | null>();
  const [type, setType] = useState<string>('parkering');
  const user = useUser();
  const [deleteTitle, setDeleteTitle] = useState<string>(
    'Er du sikker du vil slette denne parkering?'
  );
  const [selectedMarker, setSelectedMarker] = useState<TData | null | undefined>(null);
  const setLocIds = useMapFilterStore((state) => state.setLocIds);

  const setSelectedMarkerWithCallback = (data: TData | null | undefined) => {
    setSelectedMarker(data);
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

  // const {shownTasks, setShownMapTaskIds} = useTaskStore();

  const defaultContextmenuItems: Array<L.ContextMenuItem> = [
    {
      text: 'Google Maps',
      callback: function (e: L.ContextMenuItemClickEvent) {
        if (e.relatedTarget) {
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${e.latlng.lat},${e.latlng.lng}`,
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
      center: pan || [56.215868, 8.228759],
      zoom: zoom || 7,
      // layers: [outdormapbox],
      tapHold: true,
      renderer: L.canvas({tolerance: 5}),
      contextmenu: true,
      contextmenuItems: items,
    });

    map.zoomControl.setPosition('bottomright');

    map.pm.setLang('da');

    map.attributionControl.setPrefix(false);

    new LocateControl({
      showPopup: false,
      strings: {title: 'Find mig'},
      circleStyle: {interactive: false},
      locateOptions: {enableHighAccuracy: true},
      position: 'bottomright',
    }).addTo(map);

    L.basemapControl({
      position: 'bottomleft',
      layers: [{layer: outdormapbox}, {layer: satelitemapbox}],
    }).addTo(map);

    onMapClickEvent(map);
    onCreateRouteEvent(map);
    onMapMoveEndEvent(map);

    return map;
  };

  const onMapClickEvent = (map: L.Map) => {
    map.on('click', function (e) {
      setSelectedMarkerWithCallback(null);
      if (selectCallback) selectCallback(null);
      if (hightlightedMarker) {
        hightlightedMarker.setStyle(defaultCircleMarkerStyle);
        highlightParking(hightlightedMarker.options.data.loc_id, false);
        setHightlightedMarker(null);
      }

      const loc_id = mapUtilityStore.getState().selectedLocId;
      const editParkingLayer = mapUtilityStore.getState().editParkingLayer;

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
          highlightParking(loc_id as number, true);
          setSelectParking(null);

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
    if (!layer) return;

    const parkingLayer = parkingLayerRef.current;
    if (!parkingLayer) return;

    const geoJsonLayer = geoJsonRef.current;
    if (!geoJsonLayer) return;

    const tooltipLayer = tooltipRef.current;
    if (!tooltipLayer) return;

    if (zoom > zoomThresholdForParking && leafletMapRoutes && leafletMapRoutes.length > 0) {
      geoJsonLayer.addTo(map);
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

    setLocIds(
      markersInViewport.map((marker) => {
        if (marker instanceof L.Marker || marker instanceof L.CircleMarker) {
          return marker.options.data?.loc_id;
        }
      })
    );

    if (zoom < zoomThresholdForSmallMarkers) {
      setIconSize(24);
    } else {
      setIconSize(48);
    }

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
  };

  const plotRoutesInLayer = () => {
    geoJsonRef.current?.clearLayers();
    if (geoJsonRef.current) {
      const active_loc_ids = data.map((item) => {
        if ('loc_id' in item) {
          return item.loc_id;
        }
      });
      if (mapRef && mapRef.current && data.length > 0) {
        if (leafletMapRoutes && leafletMapRoutes.length > 0) {
          leafletMapRoutes.forEach((route: LeafletMapRoute) => {
            if (active_loc_ids.includes(route.geo_route.loc_id)) {
              const geo = L.geoJSON(route.geo_route, {
                onEachFeature: function onEachFeature(feature, layer) {
                  layer.bindContextMenu({
                    contextmenu: user?.superUser,
                    contextmenuInheritItems: false,
                    contextmenuItems: [
                      {
                        text: 'Slet rute',
                        callback: () => {
                          setDeleteId(route.geo_route.route_id);
                          setEditRouteLayer(route.geo_route.loc_id);
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
          });
          geoJsonRef.current.setStyle(routeStyle);
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
            setHighlightedParking(layer);
          }
        }
      });
    }
  }

  const plotParkingsInLayer = () => {
    parkingLayerRef.current?.clearLayers();
    if (mapRef && mapRef.current && parkings && parkings.length > 0 && data.length > 0) {
      const active_loc_ids = data.map((item) => {
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
          ];

          const point: L.LatLngExpression = [coords.lat, coords.lng];
          const parkingMarker = L.marker(point, {
            data: parking,
            icon: parkingIcon,
            contextmenu: true,
            contextmenuItems: [],
          });

          parkingMarker.bindContextMenu({
            contextmenu: user?.superUser,
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
                  setSelectParking(null);
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
          if (
            hightlightedMarker &&
            hightlightedMarker.options.data &&
            hightlightedMarker.options.data.loc_id === parking.loc_id
          )
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
          setSelectParking(null);
          toast.dismiss('tilknytParking');
          if (hightlightedMarker) {
            const loc_id = hightlightedMarker.options.data?.loc_id;
            if (loc_id) highlightParking(loc_id, true);
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
    parkingLayerRef.current = L.featureGroup();
    markerLayerRef.current = L.markerClusterGroup({
      disableClusteringAtZoom: 15,
      spiderfyOnMaxZoom: false,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 50,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers();
        const num = childMarkers.length;

        childMarkers.sort((a, b) => {
          if (a.options.data.boreholeno && b.options.data.boreholeno) {
            return Math.max(b.options.data.status) - Math.max(a.options.data.status);
          }
          if (a.options.data.boreholeno) {
            return 1;
          }
          if (b.options.data.boreholeno) {
            return -1;
          }

          const aStatus = a.options.data.flag;
          const bStatus = b.options.data.flag;
          const aInactive = a.options.data.inactive;
          const bInactive = b.options.data.inactive;
          if (aStatus === bStatus) {
            return aInactive - bInactive;
          }

          return bStatus - aStatus;
        });
        // find marker with highest status
        let color: string;
        if (childMarkers[0].options.data.boreholeno) {
          color =
            boreholeColors[Math.max(childMarkers[0].options.data.status) as BoreHoleFlagEnum].color;
        } else {
          color = getColor(childMarkers[0].options.data);
        }
        return L.divIcon({
          className: 'svg-icon',
          iconAnchor: [12, 24],
          html: L.Util.template(droplelSVG, {
            color: color,
            icon: '',
            num: num,
          }),
        });

        // return L.divIcon({
        //   className: 'svg-icon',
        //   iconAnchor: [12, 24],
        //   html: L.Util.template(droplelSVG, {
        //     color: sensorColors[maxStatus as FlagEnum]?.color || sensorColors[0].color,
        //     icon: '',
        //     num: num,
        //   }),
        // });
      },
    }).addTo(mapRef.current);
    tooltipRef.current = L.featureGroup();
    geoJsonRef.current = L.featureGroup();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    geoJsonRef.current?.setStyle(routeStyle);
    mapRef.current?.pm.setGlobalOptions({
      snappable: true,
      snapDistance: 5,
      pathOptions: routeStyle,
    });
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      onMapClickEvent(mapRef.current);
      onCreateRouteEvent(mapRef.current);
    }
    markerLayerRef.current?.on('click', function (e: L.LeafletMouseEvent) {
      L.DomEvent.stopPropagation(e);
      setSelectedMarkerWithCallback(e.sourceTarget.options.data);
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
        setHightlightedMarker(e.sourceTarget);
        highlightParking(hightlightedMarker?.options.data.loc_id, false);
        highlightParking(e.sourceTarget.options.data.loc_id, true);
      }
    });

    return () => {
      markerLayerRef.current?.removeEventListener('click');
      mapRef.current?.removeEventListener('pm:create');
    };
  }, [hightlightedMarker]);

  useEffect(() => {
    plotRoutesInLayer();
  }, [data, leafletMapRoutes, geoJsonRef.current]);

  useEffect(() => {
    if (zoom !== null && pan !== null) {
      mapRef.current?.setView(pan, zoom);
    } else {
      if (markerLayerRef.current?.getBounds().isValid() && mapRef.current) {
        const zoom = mapRef.current.getZoom();
        const localPan = pan ? pan : mapRef.current.getCenter();
        mapRef.current.setView(localPan, zoom);
      }
    }
  }, [data]);

  useEffect(() => {
    plotParkingsInLayer();
  }, [parkingLayerRef.current, parkings, data]);

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
      deleteParkering,
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
