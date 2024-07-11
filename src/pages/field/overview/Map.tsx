import {Box} from '@mui/material';
import {atom, useAtom} from 'jotai';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import 'leaflet-routing-machine';
import L, {LeafletMouseEvent} from 'leaflet';
import '~/css/leaflet.css';
import {useRef, useEffect, useState, SyntheticEvent, useCallback} from 'react';
import {toast} from 'react-toastify';
import utmObj from 'utm-latlng';

import {apiClient} from '~/apiClient';
import AlertDialog from '~/components/AlertDialog';
import {mapboxToken, boreholeColors} from '~/consts';
import {useParkering} from '~/features/parkering/api/useParkering';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {queryClient} from '~/queryClient';
import {atomWithTimedStorage} from '~/state/atoms';
import {stamdataStore, authStore, parkingStore} from '~/state/store';
import {BoreholeMapData, Parking, PartialBy} from '~/types';

import BoreholeContent from './components/BoreholeContent';
import DrawerComponent from './components/DrawerComponent';
import LegendContent from './components/LegendContent';
import {getColor} from './components/NotificationIcon';
import SearchAndFilterMap from './components/SearchAndFilterMap';
import SensorContent from './components/SensorContent';

const utm = new utmObj();

let hightlightedMarker: L.CircleMarker | null = null;
let highlightedParking: L.Marker | null = null;

const defaultRadius = 8;
const smallRadius = 4;
const highlightRadius = 14;
const zoomThresholdForParking = 16;
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
}

interface LocItems {
  name: string;
  sensor: boolean;
  group: string;
}

interface MapProps {
  data: (NotificationMap | BoreholeMapData)[];
  loading: boolean;
}

const offSetPoint = (point: L.LatLngExpression, offset: number, map: L.Map): L.LatLngExpression => {
  const pixelPoint = map.latLngToContainerPoint(point);

  const newPoint = L.point([pixelPoint.x + offset, pixelPoint.y - offset]);

  return map.containerPointToLatLng(newPoint);
};

function Map({data, loading}: MapProps) {
  const {createStamdata} = useNavigationFunctions();
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.FeatureGroup | null>(null);
  const parkingLayerRef = useRef<L.FeatureGroup | null>(null);
  const tooltipRef = useRef<L.FeatureGroup | null>(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [setSelectParking] = parkingStore((state) => [state.setSelectedLocId]);
  const store = stamdataStore();
  const [filteredData, setFilteredData] = useState<(NotificationMap | BoreholeMapData)[]>([]);

  const [selectedMarker, setSelectedMarker] = useState<
    NotificationMap | BoreholeMapData | Parking | null | undefined
  >(null);
  const [boreholeAccess] = authStore((state) => [state.boreholeAccess]);

  const setLocationValue = stamdataStore((store) => store.setLocationValue);

  const superUser = authStore((state) => state.superUser);

  const {
    get: {data: parkings},
    post: postParkering,
    put: putParkering,
  } = useParkering();

  const contextmenuItems = [
    {
      text: 'Opret ny lokation',
      callback: function (e: LeafletMouseEvent) {
        // @ts-expect-error error in type definition
        const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

        if (typeof coords == 'object') {
          setLocationValue('x', parseFloat(coords.Easting.toFixed(2)));
          setLocationValue('y', parseFloat(coords.Northing.toFixed(2)));

          // if (e.relatedTarget.options.data.loc_id) createStamdata('2');

          createStamdata();
        }
      },
      icon: '/leaflet-images/marker.png',
    },
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
  ];

  if (superUser) {
    contextmenuItems.splice(1, 0, {
      text: 'Tilføj parkering',
      callback: (e: any) => {
        // @ts-expect-error error in type definition
        const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

        if (typeof coords == 'object' && toast.isActive('opretParking')) {
          const parkering: PartialBy<Parking, 'parking_id' | 'loc_id'> = {
            x: parseFloat(coords.Easting.toFixed(2)),
            y: parseFloat(coords.Northing.toFixed(2)),
          };

          const payload = {
            path: '',
            data: parkering,
          };

          postParkering.mutate(payload, {
            onSettled: () => {
              setSelectParking(null);
              toast.dismiss('opretParking');
            },
          });
        }
      },
      icon: '/parking-icon.png',
    });
  }

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
      center: [55.876823, 8.961644],
      zoom: 7,
      layers: [outdormapbox],
      tap: false,
      renderer: L.canvas(),
      contextmenu: true,
      contextmenuWidth: 140,
      contextmenuItems: contextmenuItems,
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
      if (highlightedParking && highlightedParking.options) {
        highlightParking((highlightedParking.options.data as Parking).parking_id, false);
        highlightedParking = null;
      }

      if (parkingStore.getState().selectedLocId && parkingStore.getState().selectedLocId !== null) {
        // @ts-expect-error error in type definition
        const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

        if (typeof coords == 'object' && toast.isActive('opretParking')) {
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
              queryClient.invalidateQueries({
                queryKey: ['overblik'],
              });
              setSelectParking(null);
              toast.dismiss('opretParking');
            },
          });
        }
      }
    });

    return map;
  };

  function highlightParking(parking_id: number, highlight: boolean) {
    if (parkingLayerRef && parkingLayerRef.current) {
      parkingLayerRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.options.data) {
          const parking = layer.options.data as Parking;
          if (parking.parking_id === parking_id && parkingLayerRef.current !== null) {
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

    const tooltipLayer = tooltipRef.current;
    if (!tooltipLayer) return;

    if (zoom > zoomThresholdForParking) parkingLayer.addTo(map);
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
    parkingLayerRef.current?.clearLayers();
    if (mapRef && mapRef.current && parkings) {
      if (parkings)
        parkings.forEach((parking: Parking) => {
          const coords = utm.convertUtmToLatLng(parking.x, parking.y, 32, 'N');
          if (typeof coords != 'object') return;
          const point: L.LatLngExpression = [coords.lat, coords.lng];
          const parkingMarker = L.marker(point, {
            data: parking,
            icon: parkingIcon,
          });
          const parkingMenu = [...contextmenuItems.slice(2)];

          parkingMarker.bindContextMenu({
            contextmenu: superUser,
            contextmenuInheritItems: false,
            contextmenuItems: [...parkingMenu],
          });
          parkingMarker.on('click', () => {
            const loc_id = parkingStore.getState().selectedLocId;

            if (loc_id != null && toast.isActive('tilknytParking')) {
              const payload = {
                data: {
                  loc_id: loc_id,
                },
                path: parking.parking_id.toString(),
              };
              putParkering.mutate(payload, {
                onSettled: () => {
                  queryClient.invalidateQueries({
                    queryKey: ['overblik'],
                  });
                  setSelectParking(null);
                  toast.dismiss('tilknytParking');
                },
              });
            }
          });
          if (parkingLayerRef.current) {
            parkingMarker.addTo(parkingLayerRef.current);
          }
          if (
            hightlightedMarker &&
            hightlightedMarker.options.data &&
            hightlightedMarker.options.data.parking_id === parking.parking_id
          )
            highlightParking(parking.parking_id, true);
        });
    }
    // return () => {
    //   if (mapRef && mapRef.current && parkings) mapRef.current.on('moveend', mapEvent);
    // };
  }, [parkings, parkingLayerRef.current]);

  useEffect(() => {
    mapRef.current = renderMap();
    parkingLayerRef.current = L.featureGroup().addTo(mapRef.current);
    layerRef.current = L.featureGroup().addTo(mapRef.current);
    tooltipRef.current = L.featureGroup();

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
          const parking_id = e.sourceTarget.options.data?.parking_id;
          highlightParking(parking_id, true);
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
      if ('locid' in a && 'locid' in b) {
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
      if ('locid' in element) {
        const coords = utm.convertUtmToLatLng(element.x, element.y, 32, 'N');
        if (typeof coords != 'object') return;
        const point: L.LatLngExpression = [coords.lat, coords.lng];
        const marker = L.circleMarker(point, {
          ...defaultCircleMarkerStyle,
          interactive: true,
          fillColor: getColor(element),
          title: element.locname,
          data: element,
          contextmenu: true,
          // pane: element.flag.toString(),
          // renderer: renderer,
        });

        const locationMenu = [
          {
            text: 'Opret station',
            callback: () => {
              store.setLocation({
                loc_id: element.locid,
              });
              createStamdata('1');
            },
            icon: '/leaflet-images/marker.png',
          },
          {
            text: 'Tilknyt parking',
            callback: () => {
              setSelectParking(element.locid);
              toast('Vælg parkering for at tilknytte den lokationen', {
                toastId: 'tilknytParking',
                type: 'info',
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                onClick: () => {
                  setSelectParking(null);
                  toast.dismiss('tilknytParking');
                },
              });
            },
            icon: '/parking-icon.png',
          },
          {
            text: 'Tilføj parkering',
            callback: () => {
              setSelectParking(element.locid);
              toast('Tryk på kortet for at oprette en parkering til denne lokation', {
                toastId: 'opretParking',
                type: 'info',
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                onClick: () => {
                  setSelectParking(null);
                  toast.dismiss('opretParking');
                },
              });
            },
            icon: '/parking-icon.png',
          },
          ...contextmenuItems.slice(2),
          // ...contextmenuItems.slice(2),
        ];

        marker.bindContextMenu({
          contextmenu: true,
          contextmenuInheritItems: false,
          contextmenuItems: [...locationMenu],
        });

        if (
          element.obsNotifications.length > 0
          // && element.obsNotifications[0].flag > element.flag
        ) {
          // console.log(element.obsNotifications[0]);
          const smallMarker = L.circleMarker(point, {
            ...defaultCircleMarkerStyle,
            radius: defaultRadius + 4,
            interactive: false,
            fillOpacity: 1,
            opacity: 1,
            fillColor: getColor(element.obsNotifications[0]),
            // pane: element.flag.toString(),
            // renderer: renderer,
          });
          if (layerRef.current) {
            smallMarker.addTo(layerRef.current);
          }
        }

        marker.bindTooltip(element.locname, {
          direction: 'top',
          offset: [0, -10],
        });

        if (layerRef.current) {
          marker.addTo(layerRef.current);
        }
      } else {
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
      if (layerRef.current?.getBounds().isValid() && !loading) {
        mapRef.current?.fitBounds(layerRef.current.getBounds());
      }
    }
  }, [filteredData]);

  const handleSearchSelect = useCallback(
    (e: SyntheticEvent, value: string | LocItems | null) => {
      if (value !== null && typeof value == 'object' && layerRef.current && mapRef.current) {
        if (value.sensor) {
          // @ts-expect-error Getlayers returns markers
          const markers: L.Marker[] = layerRef.current.getLayers();
          for (let i = 0; i < markers.length; i++) {
            if (markers[i].options.title == value.name) {
              markers[i].openPopup();
              mapRef.current?.flyTo(markers[i].getLatLng(), 14, {
                animate: false,
              });
              markers[i].fire('click');
              setSelectedMarker(markers[i].options.data);
              break;
            }
          }
        } else {
          apiClient
            .get<BoreholeMapData>(`/sensor_field/jupiter/search/${value.name}`)
            .then((res) => {
              const element = res.data;

              const point: L.LatLngExpression = [element.latitude, element.longitude];

              const maxStatus = Math.max(...element.status);

              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: L.Util.template(boreholeSVG, {color: boreholeColors[maxStatus].color}),
                iconSize: [24, 24],
                iconAnchor: [12, 24],
              });

              const marker = L.marker(point, {
                icon: icon,
                title: element.boreholeno,
                data: element,
                contextmenu: true,
              });

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
    if ('locid' in selectedMarker) return selectedMarker.locname;
    if ('boreholeno' in selectedMarker) return selectedMarker.boreholeno;
    return 'Signaturforklaring';
  };

  return (
    <>
      <AlertDialog
        open={displayAlert}
        setOpen={setDisplayAlert}
        title="Opret parkering"
        message="Vælg venligst hvor parkeringen skal oprettes."
        handleOpret={() => null}
      />
      <SearchAndFilterMap
        data={loading ? [] : data}
        setData={setFilteredData}
        handleSearchSelect={handleSearchSelect}
      />
      <Box
        id="map"
        sx={{
          width: '100%',
          minHeight: '300px',
          flexGrow: 1,
          //'@media (min-width:1280px)': {height: '90vh', }
        }}
      ></Box>
      <DrawerComponent
        key={getDrawerHeader()}
        enableFull={selectedMarker != null ? true : false}
        isMarkerSelected={selectedMarker !== null}
        header={getDrawerHeader()}
      >
        {selectedMarker && 'locid' in selectedMarker && <SensorContent data={selectedMarker} />}
        {selectedMarker == null && <LegendContent />}
        {selectedMarker && 'boreholeno' in selectedMarker && boreholeAccess && (
          <BoreholeContent data={selectedMarker} />
        )}
      </DrawerComponent>
    </>
  );
}

export default Map;
