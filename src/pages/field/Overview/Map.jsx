import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.locatecontrol';
import {atom, useAtom} from 'jotai';
import {getLastMeasurement} from '../boreholeAPI';

const zoomAtom = atom(null);
const panAtom = atom(null);

const style = {
  width: '100%',
  height: '80vh',
};

var boreholeIcon = L.icon({
  iconUrl: 'boreholeIcon.svg',
  iconSize: [30, 30], // size of the icon
});

function Map({sensorData, boreholeData, loading, boreholeIsLoading}) {
  const navigate = useNavigate();
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);

  const onClickHandler = (element) => () => {
    let _popup = document.getElementsByClassName('leaflet-popup-content-wrapper');
    if (_popup && _popup.length > 0) {
      L.DomEvent.on(_popup[0], 'click', () => {
        if (element.locid) navigate('location/' + element.locid);
        else navigate('borehole/' + element.boreholeno + '/1');
      });
    }
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
      dataBorehole.map((element) => {
        let lastMeasurements = [];
        let timeofmeas = [];
        let content = '';
        element.intakenos.map((intake) => {
          getLastMeasurement(element.boreholeno, intake).then((responses) => {
            if (responses.data.features[0] !== undefined) {
              lastMeasurements[intake - 1] =
                responses.data.features[0].properties.disttowatertable_m + ' m - ';
              timeofmeas[intake - 1] = responses.data.features[0].properties.timeofmeas.split(
                ' ',
                1
              );
            } else {
              lastMeasurements[intake - 1] = ' Ingen måling';
              timeofmeas[intake - 1] = '';
            }
            const point = [element.lat, element.lon];
            if (element.intakenos.length === 1)
              content =
                'Indtag ' +
                intake +
                ': ' +
                lastMeasurements[intake - 1] +
                timeofmeas[intake - 1] +
                '<br>';
            else if (element.intakenos.length === 2)
              content =
                'Indtag 1: ' +
                lastMeasurements[0] +
                timeofmeas[0] +
                '<br>' +
                'Indtag 2: ' +
                lastMeasurements[1] +
                timeofmeas[1] +
                '<br>';
            else
              content =
                'Indtag 1: ' +
                lastMeasurements[0] +
                timeofmeas[0] +
                '<br>' +
                'Indtag 2: ' +
                lastMeasurements[1] +
                timeofmeas[1] +
                '<br>' +
                'Indtag 3: ' +
                lastMeasurements[2] +
                timeofmeas[2] +
                '<br>';

            const marker = L.marker(point, {
              icon: boreholeIcon,
              title: element.boreholeno,
            }).bindPopup(
              '<center><b>' +
                element.boreholeno +
                '</b><br>Seneste kontrolmåling(er):<br>' +
                content +
                '</center>'
            );
            marker.on('click', onClickHandler(element));
            marker.addTo(layerRef.current);
          });
        });
      });

      data.forEach((element) => {
        const point = [element.lat, element.long];
        const marker = L.circleMarker(point, {
          // icon: element.status ? stationIcon : inactiveIcon,
          radius: 8,
          weight: 1,
          fillOpacity: 0.8,
          opacity: 0.8,
          color: '#000000',
          fillColor: element.status ? '#3388ff' : '#C0C0C0',
        }).bindPopup(
          element.mouseover.split('<b style="color:#10ae8c;">-----------</b>')[0] +
            '</p>' +
            '<a>Se graf</a>'
        );
        marker.on('click', onClickHandler(element));
        marker.addTo(layerRef.current);
      });
      if (zoom !== null) {
        mapRef.current.setView(pan, zoom);
      } else {
        mapRef.current.fitBounds(layerRef.current.getBounds());
      }
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [sensorData, boreholeData]);

  return <div id="map" style={style}></div>;
}

export default Map;
