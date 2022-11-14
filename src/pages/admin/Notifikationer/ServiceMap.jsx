import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet-lasso';
import {atom, useAtom} from 'jotai';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {elementTypeAcceptingRef} from '@mui/utils';

const zoomAtom = atom(null);
const panAtom = atom(null);

const style = {
  width: '100%',
  height: '80vh',
};

const icon = L.divIcon({
  className: '',
  html: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="#00FF00"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function Map({data, isLoading, setLassoFilter}) {
  const navigate = useNavigate();
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);

  const onClickHandler = (element) => () => {
    let _popup = document.getElementsByClassName('leaflet-popup-content-wrapper');
    if (_popup && _popup.length > 0) {
      L.DomEvent.on(_popup[0], 'click', () => {
        navigate('/field/location/' + element.locid);
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

    L.control.lasso().addTo(map);

    map.on('lasso.finished', (event) => {
      console.log(event.layers);
      console.log(new Set(event.layers.map((layer) => layer.options.loc_id)));
      setLassoFilter(new Set(event.layers.map((layer) => layer.options.loc_id)));
    });
    map.on('moveend', function () {
      setZoom(map.getZoom());
      setPan(map.getCenter());
    });

    return map;
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = renderMap();
      layerRef.current = L.featureGroup().addTo(mapRef.current);
    } else {
      layerRef.current.clearLayers();
    }

    if (!isLoading) {
      data.forEach((element) => {
        const point = [element.latitude, element.longitude];
        var marker = null;
        if (element.status == 'POSTPONED') {
          marker = L.marker(point, {
            icon: icon,
            loc_id: element.locid,
          });
        } else {
          marker = L.circleMarker(point, {
            icon: element.status == 'POSTPONED' ? icon : null,
            radius: 8,
            weight: 1,
            fillOpacity: 0.8,
            opacity: 0.8,
            color: 'black',
            fillColor: element.color,
            loc_id: element.locid,
            zIndexOffset: element.flag * 1000000000000,
          });
        }
        marker.bindPopup(element.locname);
        marker.on('click', onClickHandler(element));
        marker.addTo(layerRef.current);
      });
      if (zoom !== null) {
        mapRef.current.setView(pan, zoom);
      } else {
        var bounds = layerRef.current.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds);
        }
      }
    }
  }, [data]);

  return <div id="map" style={style}></div>;
}

export default Map;
