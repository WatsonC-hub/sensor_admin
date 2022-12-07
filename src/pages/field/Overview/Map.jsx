import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.locatecontrol';
import {atom, useAtom} from 'jotai';
import {getBoreholeSearch, postElasticSearch, getLastMeasurement} from '../boreholeAPI';
import Autocomplete from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {TextField} from '@mui/material';

const zoomAtom = atom(null);
const panAtom = atom(null);

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
  const [locItems, setLocItems] = useState([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const onPopupClickHandler = (element) => () => {
    if (element.locid) navigate('location/' + element.locid);
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
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
      {
        maxZoom: 20,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
      }
    );

    const outdormapbox = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
      {
        maxZoom: 20,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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
        popupContent.innerHTML =
          '<center><b>' +
          element.boreholeno +
          '</b><br>Seneste kontrolmåling(er):<br>' +
          content +
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
        });
        let popupContent = L.DomUtil.create('div', 'content');
        popupContent.innerHTML =
          element.mouseover.split('<b style="color:#10ae8c;">-----------</b>')[0] +
          '</p>' +
          '<a>Se graf</a>';

        let popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);
        L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(element));

        marker.addTo(layerRef.current);
      });
      if (zoom !== null) {
        mapRef.current.setView(pan, zoom);
      } else {
        mapRef.current.fitBounds(layerRef.current.getBounds());
        setZoom(mapRef.current.getZoom());
        setPan(mapRef.current.getCenter());
      }
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [sensorData, boreholeData]);

  const elasticSearch = (e) => {
    let search = {
      query: {
        bool: {
          must: {
            query_string: {},
          },
        },
      },
    };
    search.query.bool.must.query_string.query = e.target.value;
    postElasticSearch(search).then((res) => {
      setLocItems(
        res.data.hits.hits.map((elem) => {
          return {boreholeno: elem._source.properties.boreholeno};
        })
      );
    });
  };

  const handleChange = (e, value, map) => {
    if (value !== null) {
      getBoreholeSearch(value.boreholeno).then((res) => {
        let borehole = res.data.features[0].properties;
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
        popupContent.innerHTML =
          '<center><b>' +
          borehole.boreholeno +
          '</b><br>Seneste kontrolmåling(er):<br>' +
          content +
          '</center>';

        let popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);
        L.DomEvent.addListener(popupContent, 'click', onPopupClickHandler(borehole));

        marker.on('add', function () {
          mapRef.current.flyTo(point, 12);
          marker.openPopup();
          // onClickHandler(borehole);
        });
        // marker.on('click', onClickHandler(borehole));
        marker.addTo(layerRef.current);
      });
    }
  };

  return (
    <div>
      <Autocomplete
        freeSolo={true}
        forcePopupIcon={false}
        options={locItems}
        getOptionLabel={(option) => option.boreholeno}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="outlined"
            placeholder="Søg efter boring"
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
