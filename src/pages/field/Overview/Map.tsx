import {
  TextField,
  InputAdornment,
  Box,
  Autocomplete,
  IconButton,
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  SwipeableDrawer,
} from '@mui/material';
// import Autocomplete from '@mui/material/Autocomplete';
// import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {atom, useAtom} from 'jotai';
import L from 'leaflet';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import {useRef, useEffect, useState, SyntheticEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiClient} from '~/apiClient';
import {mapboxToken} from '~/consts';
import {stamdataStore} from '~/state/store';
import utmObj from 'utm-latlng';
import {authStore} from '../../../state/store';
import {postElasticSearch} from '../boreholeAPI';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import DrawerComponent from './components/DrawerComponent';
import SensorContent from './components/SensorContent';
import LegendContent from './components/LegendContent';
import BoreholeContent from './components/BoreholeContent';

const utm = new utmObj();

const zoomAtom = atom<number | null>(null);
const panAtom = atom<L.LatLng | null>(null);
const typeAheadAtom = atom<string>('');
const mapFilterAtom = atom({});

const boreholeSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"/><path style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2" d="M12 16V8"/></svg>`;

const boreholeColors: Record<number, string> = {
  1: '#66bb6a',
  2: '#FFFF00',
  3: '#FF6C00',
  0: '#3388ff',
};

interface SensorData {
  locname: string;
  locid: number;
  lat: number;
  long: number;
  status: number;
  mouseover: string;
}

interface BoreholeData {
  boreholeno: string;
  latitude: number;
  longitude: number;
  intakeno: number[];
  measurement: number[];
  status: number[];
}

declare module 'leaflet' {
  interface CircleMarkerOptions {
    contextmenu?: boolean;
    title?: string;
    data?: SensorData;
  }

  interface MarkerOptions {
    contextmenu?: boolean;
    title?: string;
    data?: BoreholeData;
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
  sensorData: SensorData[];
  boreholeData: BoreholeData[];
  loading: boolean;
  boreholeLoading: boolean;
}

function Map({sensorData, boreholeData, loading, boreholeLoading}: MapProps) {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.FeatureGroup | null>(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [typeAhead, setTypeAhead] = useAtom(typeAheadAtom);
  const [mapFilter, setMapFilter] = useAtom(mapFilterAtom);
  const [selectedMarker, setSelectedMarker] = useState<
    SensorData | BoreholeData | null | undefined
  >(null);
  const [locItems, setLocItems] = useState<LocItems[]>([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [boreholeAccess] = authStore((state) => [state.boreholeAccess]);

  const setLocationValue = stamdataStore((store) => store.setLocationValue);

  const onPopupClickHandler = (element: SensorData | BoreholeData) => () => {
    if ('locid' in element) navigate('location/' + element.locid);
    else navigate('borehole/' + element.boreholeno);
  };

  const renderMap = () => {
    const myAttributionText =
      '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';
    const kftoken = 'd12107f70a3ee93153f313c7c502169a';

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

    var map = L.map('map', {
      center: [55.876823, 8.961644],
      zoom: 7,
      layers: [outdormapbox],
      tap: false,
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
              navigate('/field/stamdata');
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
          callback: function (e: any) {
            map.zoomIn();
          },
          icon: '/leaflet-images/zoom-in.png',
        },
        {
          text: 'Zoom ud',
          callback: function (e: any) {
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

    var baseMaps = {
      OpenStreetMap: outdormapbox,
      'DTK Skærmkort dæmpet': toposkaermkortwmts,
      Satelit: satelitemapbox,
    };

    L.control.layers(baseMaps).addTo(map);

    L.control
      // @ts-ignore
      .locate({
        showPopup: false,
        strings: {
          title: 'Find mig',
        },
        circleStyle: {
          interactive: false,
        },
      })
      .addTo(map);

    map.on('moveend', function () {
      setZoom(map.getZoom());
      setPan(map.getCenter());
    });
    map.on('zoomend', function () {
      setZoom(map.getZoom());
      setPan(map.getCenter());
    });

    map.on('click', function (e) {
      console.log('Map click', e.latlng);
      setSelectedMarker(null);
    });

    // map.on('popupopen', function (e) {
    //   console.log('Popup open', e.popup._source.options.data);
    // });

    // map.on('popupclose', function (e) {
    //   console.log('Popup close', e.popup._source.options.data);
    // });

    return map;
  };

  useEffect(() => {
    mapRef.current = renderMap();
    layerRef.current = L.featureGroup().addTo(mapRef.current);

    layerRef.current.on('click', function (e) {
      L.DomEvent.stopPropagation(e);
      console.log('Layer click', e);
      setSelectedMarker(e.sourceTarget.options.data);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    const dataBorehole = boreholeData;
    const data = sensorData;
    if (!loading || !boreholeLoading) {
      dataBorehole?.map((element) => {
        let content = '';

        element.intakeno.forEach((intake, index) => {
          content += `Indtag ${intake} : ${
            element.measurement[index]
              ? element.measurement[index] + ' m (DVR 90)<br>'
              : 'Ingen måling<br>'
          }`;
        });

        element.status.forEach((status, index) => {
          if (status == 2) {
            content += `<b>Obs</b> Indtag ${element.intakeno[index]} skal snart pejles.<br>`;
          }
          if (status == 3) {
            content += `<b>Obs pejling er overskredet for Indtag ${element.intakeno[index]}!</b><br>`;
          }
        });

        const point: L.LatLngExpression = [element.latitude, element.longitude];

        const maxStatus = Math.max(...element.status);

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: L.Util.template(boreholeSVG, {color: boreholeColors[maxStatus]}),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(point, {
          icon: icon,
          interactive: true,
          title: element.boreholeno,
          data: element,
          contextmenu: true,
        });

        marker.on('click', function (e) {
          setSelectedMarker(e.target.options.data);
        });

        // let popupContent = L.DomUtil.create('div', 'content');

        // // popupContent.style.backgroundColor = '#fff'; // Background color
        // // popupContent.style.padding = '10px'; // Padding
        // // popupContent.style.border = '1px solid #ccc'; // Border
        // // popupContent.style.borderRadius = '5px'; // Border radius
        // // popupContent.style.textAlign = 'center'; // Text alignment

        // popupContent.innerHTML =
        //   '<center><b>' +
        //   `<b style="color:#10ae8c;">${element.boreholeno}</b>` +
        //   '</b><br>Seneste kontrolmåling(er):<br>' +
        //   content +
        //   '<a>Se graf</a>' +
        //   '</center>';

        // let popup = L.popup().setContent(popupContent);
        // marker.bindPopup(popup);
        // L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(element));

        if (layerRef.current) {
          marker.addTo(layerRef.current);
        }
      });

      data?.forEach((element) => {
        const point: L.LatLngExpression = [element.lat, element.long];
        const marker = L.circleMarker(point, {
          // icon: element.status ? stationIcon : inactiveIcon,
          interactive: true,
          radius: 8,
          weight: 1,
          fillOpacity: 0.8,
          opacity: 0.8,
          color: '#000000',
          fillColor: element.status ? '#3388ff' : '#C0C0C0',
          title: element.locname,
          data: element,
          contextmenu: true,
        });

        marker.on('click', function (e) {
          setSelectedMarker(e.target.options.data);
        });

        // let popupContent = L.DomUtil.create('div', 'content');
        // if (
        //   element.mouseover == null ||
        //   element.mouseover == '' ||
        //   element.mouseover == '<p></p>'
        // ) {
        //   popupContent.innerHTML =
        //     `<b style="color:#10ae8c;">${element.locname}</b>` + '</p>' + '<a>Se graf</a>';
        // } else {
        //   popupContent.innerHTML =
        //     element.mouseover.split('<b style="color:#10ae8c;">-----------</b>')[0] +
        //     '</p>' +
        //     '<a>Se graf</a>';
        // }

        // let popup = L.popup().setContent(popupContent);
        // marker.bindPopup(popup);
        // L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(element));

        if (layerRef.current) {
          marker.addTo(layerRef.current);
        }
      });

      if (zoom !== null && pan !== null) {
        mapRef.current?.setView(pan, zoom);
      } else {
        if (layerRef.current?.getBounds().isValid() && !loading && !boreholeLoading) {
          mapRef.current?.fitBounds(layerRef.current.getBounds());
        }
      }
    }
  }, [sensorData, boreholeData]);

  const elasticSearch = (
    e: SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    const search_string = value;
    if (typeof search_string == 'string') {
      setTypeAhead(search_string);
    }

    if (reason == 'clear') {
      setTypeAhead('');
    }
    if (search_string) {
      const filteredSensor = sensorData
        ? sensorData
            .filter((elem) => elem.locname.toLowerCase().includes(search_string?.toLowerCase()))
            .map((elem) => {
              return {name: elem.locname, sensor: true, group: 'IoT'};
            })
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      let filteredBorehole: LocItems[] = [];
      if (boreholeAccess) {
        const search = {
          query: {
            bool: {
              must: {
                query_string: {
                  query: search_string,
                },
              },
            },
          },
        };
        postElasticSearch(search).then((res) => {
          filteredBorehole = res.data.hits.hits.map((elem: any) => {
            return {name: elem._source.properties.boreholeno, group: 'Jupiter'};
          });
          setLocItems([...filteredSensor, ...filteredBorehole]);
        });
      } else {
        setLocItems([...filteredSensor, ...filteredBorehole]);
      }
    }
  };

  const handleChange = (e: SyntheticEvent, value: string | LocItems | null) => {
    if (value !== null && typeof value == 'object' && layerRef.current && mapRef.current) {
      if (value.sensor) {
        // @ts-ignore
        const markers: L.Marker[] = layerRef.current.getLayers();

        for (let i = 0; i < markers.length; i++) {
          if (markers[i].options.title == value.name) {
            markers[i].openPopup();
            mapRef.current?.flyTo(markers[i].getLatLng(), 12);
            break;
          }
        }
      } else {
        apiClient
          .get<{
            boreholeno: string;
            latitude: number;
            longitude: number;
            intakeno: number[];
            measurement: number[];
            status: number[];
          }>(`/sensor_field/jupiter/search/${value.name}`)
          .then((res) => {
            const element = res.data;
            let content = '';
            element.intakeno.forEach((intake, index) => {
              content += `Indtag ${intake} : ${
                element.measurement[index]
                  ? element.measurement[index] + ' m (DVR 90)<br>'
                  : 'Ingen måling<br>'
              }`;
            });

            element.status.forEach((status, index) => {
              if (status == 2) {
                content += `<b>Obs</b> Indtag ${element.intakeno[index]} skal snart pejles.<br>`;
              }
              if (status == 3) {
                content += `<b>Obs pejling er overskredet for Indtag ${element.intakeno[index]}!</b><br>`;
              }
            });

            const point: L.LatLngExpression = [element.latitude, element.longitude];

            const maxStatus = Math.max(...element.status);

            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: L.Util.template(boreholeSVG, {color: boreholeColors[maxStatus]}),
              iconSize: [24, 24],
              iconAnchor: [12, 24],
            });

            const marker = L.marker(point, {
              icon: icon,
              title: element.boreholeno,
              // @ts-ignore
              contextmenu: true,
            });

            let popupContent = L.DomUtil.create('div', 'content');

            popupContent.innerHTML =
              '<center><b>' +
              `<b style="color:#10ae8c;">${element.boreholeno}</b>` +
              '</b><br>Seneste kontrolmåling(er):<br>' +
              content +
              '<a>Se graf</a>' +
              '</center>';

            let popup = L.popup().setContent(popupContent);
            marker.bindPopup(popup);
            L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(element));

            marker.on('add', function () {
              mapRef.current?.flyTo(point, 12);
              marker.openPopup();
            });
            if (layerRef.current) {
              marker.addTo(layerRef.current);
            }
          });
      }
    }
  };

  return (
    <>
      <Autocomplete
        freeSolo={true}
        forcePopupIcon={false}
        options={locItems}
        getOptionLabel={(option) => (typeof option == 'object' ? option.name : option)}
        groupBy={(option) => option.group}
        inputValue={typeAhead}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment
                  sx={{
                    pl: 1,
                  }}
                  position="start"
                >
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
              endAdornment: params.InputProps.endAdornment ? (
                params.InputProps.endAdornment
              ) : (
                <InputAdornment
                  sx={{
                    pr: 1,
                  }}
                  position="end"
                >
                  <IconButton edge="end" onClick={() => console.log('yay')}>
                    <TuneRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Søg efter lokation..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
              },
            }}
          />
        )}
        style={{
          width: matches ? '90%' : 300,
          marginLeft: '5%',
          marginBottom: '12px',
          marginTop: '12px',
        }}
        onChange={handleChange}
        onInputChange={elasticSearch}
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
        // open={selectedMarker !== null}
        // setOpen={}
        enableFull={true}
        triggerCloseDrawer={selectedMarker === null}
        triggerOpenDrawer={selectedMarker !== null}
        header={selectedMarker?.locname || selectedMarker?.boreholeno || 'Signaturforklaring'}
      >
        {selectedMarker && 'locid' in selectedMarker && <SensorContent />}
        {selectedMarker == null && <LegendContent />}
        {selectedMarker && 'boreholeno' in selectedMarker && boreholeAccess && <BoreholeContent />}
      </DrawerComponent>
    </>
  );
}

export default Map;
