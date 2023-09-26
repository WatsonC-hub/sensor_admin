import React, {useEffect, useState} from 'react';
import L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import {atom, useAtom} from 'jotai';
import {postElasticSearch} from '../boreholeAPI';
import Autocomplete from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {TextField} from '@mui/material';
import {authStore} from '../../../state/store';
import {useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {mapboxToken} from 'src/consts';
import {stamdataStore} from 'src/state/store';
import utmObj from 'utm-latlng';

const utm = new utmObj();

const zoomAtom = atom(null);
const panAtom = atom(null);
const typeAheadAtom = atom('');

const style = {
  width: '100%',
  height: '80vh',
};

var boreholeIcon = L.icon({
  iconUrl: '/boreholeIcon.svg',
  iconSize: [32, 32], // size of the icon
});

function Map({sensorData, boreholeData, loading, boreholeIsLoading}) {
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
    console.log(element);
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
        id: 'mapbox/satellite-v9',
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
            console.log(coords);
            setLocationValue('x', parseFloat(coords.Easting.toFixed(2)));
            setLocationValue('y', parseFloat(coords.Northing.toFixed(2)));
            navigate('/field/stamdata');
          },
        },
        {
          text: 'Link til Google Maps',
          callback: function (e) {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${e.latlng.lat},${e.latlng.lng}`,
              '_blank'
            );
          },
        },
        '-', // this is a separator
        {
          text: 'Zoom ind',
          callback: function (e) {
            map.zoomIn();
          },
        },
        {
          text: 'Zoom ud',
          callback: function (e) {
            map.zoomOut();
          },
        },
        {
          text: 'Centrer kort her',
          callback: function (e) {
            map.panTo(e.latlng);
          },
        },
      ],
    });

    var baseMaps = {
      OpenStreetMap: outdormapbox,
      Vandløb: toposkaermkortwmts,
      Satelit: satelitemapbox,
    };

    L.control.layers(baseMaps).addTo(map);

    L.control
      .locate({
        strings: {
          title: 'Find mig',
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
    if (!loading || !boreholeIsLoading) {
      dataBorehole?.map((element) => {
        let content = '';

        element.intakenos.forEach((intake, index) => {
          content += `Indtag ${intake} : ${
            element.latest_values[index]
              ? element.latest_values[index] + ' m (DVR 90)<br>'
              : 'Ingen måling'
          }`;
        });

        const point = [element.lat, element.lon];

        const marker = L.marker(point, {
          icon: boreholeIcon,
          title: element.boreholeno,
        });

        let popupContent = L.DomUtil.create('div', 'content');

        // popupContent.style.backgroundColor = '#fff'; // Background color
        // popupContent.style.padding = '10px'; // Padding
        // popupContent.style.border = '1px solid #ccc'; // Border
        // popupContent.style.borderRadius = '5px'; // Border radius
        // popupContent.style.textAlign = 'center'; // Text alignment

        popupContent.innerHTML =
          '<center><b>' +
          element.boreholeno +
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
      console.log(layerRef.current.getBounds());
      if (zoom !== null) {
        mapRef.current.setView(pan, zoom);
      } else {
        if (layerRef.current.getBounds().isValid()) {
          mapRef.current.fitBounds(layerRef.current.getBounds());
        }
        // setZoom(mapRef.current.getZoom());
        // setPan(mapRef.current.getCenter());
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
          const borehole = res.data;

          const point = [borehole.latitude, borehole.longitude];

          let content = '';

          borehole.intakenos.forEach((intake, index) => {
            content += `Indtag ${intake} : ${
              borehole.last_values[index]
                ? borehole.last_values[index] + ' m (DVR 90)<br>'
                : 'Ingen måling'
            }`;
          });

          const marker = L.marker(point, {
            icon: boreholeIcon,
            title: borehole.boreholeno,
          });

          let popupContent = L.DomUtil.create('div', 'content');
          if (borehole.intakenos.reduce((a, b) => b == null || a, false)) {
            popupContent.innerHTML =
              '<center><b>' +
              borehole.boreholeno +
              '</b>' +
              '<br>Der er ikke registreret et indtag på denne boring</br>' +
              '</center>';
          } else {
            popupContent.innerHTML =
              '<center><b>' +
              borehole.boreholeno +
              '</b><br>Seneste kontrolmåling(er):<br>' +
              content +
              '</center>' +
              '<a>Se graf</a>';
            L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(borehole));
          }

          let popup = L.popup().setContent(popupContent);
          marker.bindPopup(popup);

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
