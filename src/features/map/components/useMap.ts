import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {useAtom} from 'jotai';
import L from 'leaflet';
import '~/css/leaflet.css';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {useParkering} from '~/features/parkering/api/useParkering';
import {useLeafletMapRoute} from '~/features/parkeringRute/api/useLeafletMapRoute';
import {authStore, parkingStore} from '~/state/store';
import {LeafletMapRoute, Parking, PartialBy} from '~/types';

import {
  outdormapbox,
  toposkaermkortwmts,
  satelitemapbox,
  defaultCircleMarkerStyle,
  zoomThresholdForParking,
  zoomThresholdForSmallMarkers,
  smallRadius,
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

let highlightedParking: L.Marker | null = null;

const useMap = <TData extends object>(
  id: string,
  data: Array<TData>,
  contextmenuItems: Array<L.ContextMenuItem>
) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.FeatureGroup | null>(null);
  const parkingLayerRef = useRef<L.FeatureGroup | null>(null);
  const tooltipRef = useRef<L.FeatureGroup | null>(null);
  const geoJsonRef = useRef<L.FeatureGroup | null>(null);
  const mutateParkingRef = useRef<boolean>(false);
  const mutateLeafletMapRouteRef = useRef<number | boolean | null>();
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [setSelectParking] = parkingStore((state) => [state.setSelectedLocId]);
  const [deleteId, setDeleteId] = useState<number>();
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [displayDelete, setDisplayDelete] = useState<boolean>(false);
  const [hightlightedMarker, setHightlightedMarker] = useState<L.CircleMarker | null>();
  const [type, setType] = useState<string>('parkering');
  const [superUser] = authStore((state) => [state.superUser]);
  const [deleteTitle, setDeleteTitle] = useState<string>(
    'Er du sikker du vil slette denne parkering?'
  );
  const [selectedMarker, setSelectedMarker] = useState<TData | null | undefined>(null);

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

  const items: Array<L.ContextMenuItem> = [];

  items.push(
    ...contextmenuItems,
    ...[
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
    ]
  );

  const buildMap = () => {
    const map = L.map(id, {
      center: [56.215868, 8.228759],
      zoom: 7,
      layers: [outdormapbox],
      tap: false,
      renderer: L.canvas(),
      contextmenu: true,
      contextmenuItems: items,
    });

    map.pm.setLang('da');

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

    onMapClickEvent(map);
    onCreateRouteEvent(map);
    onMapMoveEndEvent(map);

    return map;
  };

  const onMapClickEvent = (map: L.Map) => {
    map.on('click', function (e) {
      setSelectedMarker(null);
      if (hightlightedMarker) {
        hightlightedMarker.setStyle(defaultCircleMarkerStyle);
        setHightlightedMarker(null);
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
          if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
        }
      }
    });
  };

  const onCreateRouteEvent = (map: L.Map) => {
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
                    contextmenu: superUser,
                    contextmenuInheritItems: false,
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
                      {
                        text: 'divider',
                        separator: true,
                      },
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
            highlightedParking = layer;
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
            contextmenu: superUser,
            contextmenuInheritItems: false,
            contextmenuItems: [
              ...parkingMenu,
              {text: 'divider', separator: true},
              ...items.slice(2),
            ],
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
          if (hightlightedMarker) {
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

  useEffect(() => {
    mapRef.current = buildMap();
    parkingLayerRef.current = L.featureGroup();
    markerLayerRef.current = L.featureGroup().addTo(mapRef.current);
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
      console.log(e);
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
        setHightlightedMarker(e.sourceTarget);
      }
    });

    return () => {
      markerLayerRef.current?.removeEventListener('click');
      mapRef.current?.removeEventListener('click');
      mapRef.current?.removeEventListener('pm:create');
    };
  }, [hightlightedMarker]);

  useEffect(() => {
    if (hightlightedMarker?.options.data?.loc_id) {
      highlightParking(hightlightedMarker?.options.data?.loc_id, true);
    }

    if (hightlightedMarker == null && highlightedParking && highlightedParking.options) {
      highlightParking((highlightedParking?.options.data as Parking).loc_id, false);
      highlightedParking = null;
    }
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
    setSelectedMarker,
    layers: {
      markerLayer: markerLayerRef.current,
    },
    mutateLayers: {
      mutateRoutesLayer: mutateLeafletMapRouteRef,
      mutateParkingLayer: mutateParkingRef,
    },
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
    warning: {
      displayAlert,
      setDisplayAlert,
    },
  };
};

export default useMap;
