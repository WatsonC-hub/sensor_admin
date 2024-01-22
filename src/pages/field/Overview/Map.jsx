import {TextField} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {atom, useAtom} from 'jotai';
import L from 'leaflet';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet.locatecontrol';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiClient} from 'src/apiClient';
import {mapboxToken} from 'src/consts';
import {stamdataStore} from 'src/state/store';
import utmObj from 'utm-latlng';
import {authStore} from '../../../state/store';
import {postElasticSearch} from '../boreholeAPI';

const utm = new utmObj();

const zoomAtom = atom(null);
const panAtom = atom(null);
const typeAheadAtom = atom('');

const style = {
  width: '100%',
  height: '80vh',
};

const boreholeSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><circle cx="12" cy="12" r="9" style="fill:{color};fill-opacity:0.8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1"/><path style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2" d="M12 16V8"/></svg>`;

var boreholeIcon = L.icon({
  iconUrl: `<svg width="240" height="320" viewBox="4 4 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 21a.975.975 0 0 1-.563-.313 5.416 5.416 0 0 1-.687-.787 8.247 8.247 0 0 1-1.12-2.045L15 15.833V17.3c-.055.374-.17.737-.339 1.075-.197.423-.428.83-.69 1.217a6.629 6.629 0 0 1-.8 1A1.16 1.16 0 0 1 12.5 21zM10 16.776v-1.5l5-2.076v1.5l-5 2.076zm0-2.635v-1.32l5-2.077v1.322l-5 2.075zm0-2.453V4h5v5.613l-5 2.075z" stroke="#000000" fill="#005A51" stroke-width="0.5" stroke-linejoin="round"/></svg>`,
  iconSize: [32, 32], // size of the icon
});

const boreholeColors = {
  1: '#66bb6a',
  2: '#FFFF00',
  3: '#FF6C00',
  0: '#3388ff',
};

function Map({sensorData, boreholeData, loading, boreholeLoading}) {
  const navigate = useNavigate();
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);
  const [typeAhead, setTypeAhead] = useAtom(typeAheadAtom);
  const [locItems, setLocItems] = useState([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [boreholeAccess] = authStore((state) => [state.boreholeAccess]);

  const [setLocationValue] = stamdataStore((store) => [store.setLocationValue]);

  const onPopupClickHandler = (element) => () => {
    if (element.locid !== undefined) navigate('location/' + element.locid);
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
        transparent: 'FALSE',
        format: 'image/png',
        attribution: myAttributionText,
      }
    );

    const satelitemapbox = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={token}',
      {
        maxZoom: 20,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/satellite-streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        token: mapboxToken,
      }
    );

    const outdormapbox = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={token}',
      {
        maxZoom: 20,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        token: mapboxToken,
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
          callback: function (e) {
            const coords = utm.convertLatLngToUtm(e.latlng.lat, e.latlng.lng, 32);

            setLocationValue('x', parseFloat(coords.Easting.toFixed(2)));
            setLocationValue('y', parseFloat(coords.Northing.toFixed(2)));
            navigate('/field/stamdata');
          },
          icon: '/leaflet-images/marker.png',
        },
        {
          text: 'Google Maps',
          callback: function (e) {
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
          callback: function (e) {
            map.zoomIn();
          },
          icon: '/leaflet-images/zoom-in.png',
        },
        {
          text: 'Zoom ud',
          callback: function (e) {
            map.zoomOut();
          },
          icon: '/leaflet-images/zoom-out.png',
        },
        {
          text: 'Centrer kort her',
          callback: function (e) {
            map.panTo(e.latlng);
          },
          icon: '/leaflet-images/center.png',
        },
      ],
    });

    var baseMaps = {
      OpenStreetMap: outdormapbox,
      'DTK Skærmkort dæmpet': toposkaermkortwmts,
      Satelit: satelitemapbox,
    };

    L.control.layers(baseMaps).addTo(map);

    L.control
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

    return map;
  };

  useEffect(() => {
    mapRef.current = renderMap();
    layerRef.current = L.featureGroup().addTo(mapRef.current);
    layerRef.current.clearLayers();
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

        const point = [element.latitude, element.longitude];

        const maxStatus = Math.max(...element.status);

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: L.Util.template(boreholeSVG, {color: boreholeColors[maxStatus]}),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(point, {
          icon: icon,
          title: element.boreholeno,
          contextmenu: true,
        });

        let popupContent = L.DomUtil.create('div', 'content');

        // popupContent.style.backgroundColor = '#fff'; // Background color
        // popupContent.style.padding = '10px'; // Padding
        // popupContent.style.border = '1px solid #ccc'; // Border
        // popupContent.style.borderRadius = '5px'; // Border radius
        // popupContent.style.textAlign = 'center'; // Text alignment

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

        marker.addTo(layerRef.current);
      });

      data?.forEach((element) => {
        const point = [element.lat, element.long];
        const marker = L.circleMarker(point, {
          // icon: element.status ? stationIcon : inactiveIcon,
          radius: 8,
          weight: 1,
          fillOpacity: 0.8,
          opacity: 0.8,
          color: '#000000',
          fillColor: element.status ? '#3388ff' : '#C0C0C0',
          title: element.locname,
          contextmenu: true,
        });
        let popupContent = L.DomUtil.create('div', 'content');

        // popupContent.style.backgroundColor = '#fff'; // Background color
        // popupContent.style.padding = '10px'; // Padding
        // popupContent.style.border = '1px solid #ccc'; // Border
        // popupContent.style.borderRadius = '5px'; // Border radius
        // popupContent.style.textAlign = 'center'; // Text alignment

        if (
          element.mouseover == null ||
          element.mouseover == '' ||
          element.mouseover == '<p></p>'
        ) {
          popupContent.innerHTML =
            `<b style="color:#10ae8c;">${element.locname}</b>` + '</p>' + '<a>Se graf</a>';
        } else {
          popupContent.innerHTML =
            element.mouseover.split('<b style="color:#10ae8c;">-----------</b>')[0] +
            '</p>' +
            '<a>Se graf</a>';
        }

        let popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);
        L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(element));

        marker.addTo(layerRef.current);
      });

      if (zoom !== null) {
        mapRef.current.setView(pan, zoom);
      } else {
        if (layerRef.current.getBounds().isValid() && !loading && !boreholeLoading) {
          mapRef.current.fitBounds(layerRef.current.getBounds());
        }
      }
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [sensorData, boreholeData]);

  const elasticSearch = (e, value, reason) => {
    const search_string = value;
    if (typeof search_string == 'string') {
      setTypeAhead(search_string);
    }

    if (reason == 'clear') {
      setTypeAhead('');
    }

    if (search_string) {
      let search = {
        query: {
          bool: {
            must: {
              query_string: {},
            },
          },
        },
      };

      const filteredSensor = sensorData
        ? sensorData
            .filter((elem) => elem.locname.toLowerCase().includes(search_string?.toLowerCase()))
            .map((elem) => {
              return {name: elem.locname, sensor: true, group: 'IoT'};
            })
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      let filteredBorehole = [];
      if (boreholeAccess) {
        search.query.bool.must.query_string.query = search_string;
        postElasticSearch(search).then((res) => {
          filteredBorehole = res.data.hits.hits.map((elem) => {
            return {name: elem._source.properties.boreholeno, group: 'Jupiter'};
          });
          setLocItems([...filteredSensor, ...filteredBorehole]);
        });
      } else {
        setLocItems([...filteredSensor, ...filteredBorehole]);
      }
    }
  };

  const handleChange = (e, value, map) => {
    if (value !== null) {
      if (value.sensor) {
        Object.values(layerRef.current._layers).forEach((layer) => {
          if (layer.options.title == value.name) {
            layer.openPopup();
            mapRef.current.flyTo(layer._latlng, 12);
          }
        });
      } else {
        apiClient.get(`/sensor_field/jupiter/search/${value.name}`).then((res) => {
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

          const point = [element.latitude, element.longitude];

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
            mapRef.current.flyTo(point, 12);
            marker.openPopup();
          });
          marker.addTo(layerRef.current);
        });
      }
    }
  };

  return (
    <div>
      <Autocomplete
        freeSolo={true}
        forcePopupIcon={false}
        options={locItems}
        getOptionLabel={(option) => (option?.name ? option.name : option)}
        groupBy={(option) => option.group}
        inputValue={typeAhead}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="outlined"
            placeholder="Søg efter lokation..."
            style={{marginTop: '-6px'}}
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
      <div id="map" style={style}></div>
    </div>
  );
}

export default Map;
