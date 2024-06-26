import {Box} from '@mui/material';
import {atom, useAtom} from 'jotai';
import L from 'leaflet';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import '~/css/leaflet.css';
import {useRef, useEffect, useState, SyntheticEvent, memo, useMemo, useCallback} from 'react';
import utmObj from 'utm-latlng';

import {apiClient} from '~/apiClient';
import {mapboxToken, boreholeColors} from '~/consts';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {atomWithTimedStorage} from '~/state/atoms';
import {stamdataStore, authStore} from '~/state/store';

import BoreholeContent from './components/BoreholeContent';
import DrawerComponent from './components/DrawerComponent';
import LegendContent from './components/LegendContent';
import {getColor} from './components/NotificationIcon';
import SearchAndFilterMap from './components/SearchAndFilterMap';
import SensorContent from './components/SensorContent';
import {BoreholeMapData} from '~/types';

const utm = new utmObj();

let hightlightedMarker: L.CircleMarker | null = null;

const defaultRadius = 8;
const smallRadius = 4;
const highlightRadius = 14;
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

const leafletIcons = Object.keys(boreholeColors).map((key) => {
  const index = parseInt(key);

  return new L.DivIcon({
    className: 'custom-div-icon',
    html: L.Util.template(boreholeSVG, {color: boreholeColors[index].color}),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
});

declare module 'leaflet' {
  interface CircleMarkerOptions {
    contextmenu?: boolean;
    title?: string;
    data?: NotificationMap;
  }

  interface MarkerOptions {
    contextmenu?: boolean;
    title?: string;
    data?: BoreholeMapData;
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
  var pixelPoint = map.latLngToContainerPoint(point);

  var newPoint = L.point([pixelPoint.x + offset, pixelPoint.y - offset]);

  return map.containerPointToLatLng(newPoint);
};

function Map({data, loading}: MapProps) {
  const {createStamdata} = useNavigationFunctions();
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.FeatureGroup | null>(null);
  const tooltipRef = useRef<L.FeatureGroup | null>(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);

  const [filteredData, setFilteredData] = useState<(NotificationMap | BoreholeMapData)[]>([]);

  const [selectedMarker, setSelectedMarker] = useState<
    NotificationMap | BoreholeMapData | null | undefined
  >(null);
  const [boreholeAccess] = authStore((state) => [state.boreholeAccess]);

  const setLocationValue = stamdataStore((store) => store.setLocationValue);

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
      contextmenuItems: [
        {
          text: 'Opret ny lokation',
          callback: function (e: any) {
            const coords = utm.ConvertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

            if (typeof coords == 'object') {
              setLocationValue('x', parseFloat(coords.Easting.toFixed(2)));
              setLocationValue('y', parseFloat(coords.Northing.toFixed(2)));
              // navigate('/field/stamdata');
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
            map.zoomIn();
          },
          icon: '/leaflet-images/zoom-in.png',
        },
        {
          text: 'Zoom ud',
          callback: function () {
            map.zoomOut();
          },
          icon: '/leaflet-images/zoom-out.png',
        },
        {
          text: 'Centrer kort her',
          callback: function (e: any) {
            map.panTo(e.latlng);
          },
          icon: '/leaflet-images/center.png',
        },
      ],
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
    // map.on('zoomend', mapEvent);

    map.on('click', function () {
      setSelectedMarker(null);
      if (hightlightedMarker) {
        hightlightedMarker.setStyle(defaultCircleMarkerStyle);
        hightlightedMarker = null;
      }
    });

    return map;
  };

  const mapEvent: L.LeafletEventHandlerFn = (event) => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    setZoom(zoom);
    setPan(map.getCenter());
    const layer = layerRef.current;
    if (!layer) return;
    const tooltipLayer = tooltipRef.current;
    if (!tooltipLayer) return;

    const bounds = map.getBounds();

    const markersInViewport: (L.Marker | L.CircleMarker)[] = [];
    layer?.eachLayer(function (layer) {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        if (bounds.contains(layer.getLatLng())) {
          markersInViewport.push(layer);
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
    mapRef.current = renderMap();
    layerRef.current = L.featureGroup().addTo(mapRef.current);
    tooltipRef.current = L.featureGroup();

    layerRef.current.on('click', function (e) {
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
