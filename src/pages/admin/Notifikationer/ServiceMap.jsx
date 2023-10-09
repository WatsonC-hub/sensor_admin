import {atom, useAtom} from 'jotai';
import L from 'leaflet';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import 'leaflet-lasso';
import 'leaflet.locatecontrol';
import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {mapboxToken} from 'src/consts';

const zoomAtom = atom(null);
const panAtom = atom(null);

const style = {
  width: '100%',
  height: '75vh',
};

const postponeIcon = L.divIcon({
  className: '',
  html: '<svg fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-24.57 -24.57 294.82 294.82" xml:space="preserve" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)" opacity="0.8"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-24.57" y="-24.57" width="294.82" height="294.82" rx="147.41" fill="#00FF00" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g > <path d="M191.727,211.986c15.715-16.843,25.349-39.431,25.349-64.229c0-17.99-5.07-34.816-13.852-49.131 c6.861-6.979,10.83-16.461,10.83-26.381c0-17.439-11.938-32.141-28.07-36.37C183.499,15.686,166.257,0,145.408,0h-45.135 C79.424,0,62.182,15.686,59.696,35.874c-16.132,4.229-28.07,18.931-28.07,36.37c0,9.919,3.969,19.401,10.83,26.382 c-8.782,14.315-13.852,31.141-13.852,49.131c0,24.798,9.633,47.386,25.349,64.229l-14.137,19.392 c-2.929,4.017-2.046,9.646,1.971,12.574c1.6,1.167,3.455,1.729,5.294,1.729c2.778,0,5.519-1.282,7.28-3.699l13.128-18.009 c15.552,11.325,34.683,18.019,55.351,18.019s39.799-6.693,55.351-18.019l13.128,18.009c1.762,2.417,4.502,3.699,7.28,3.699 c1.838,0,3.694-0.563,5.294-1.729c4.017-2.928,4.899-8.558,1.971-12.574L191.727,211.986z M196.054,72.244 c0,4.266-1.409,8.376-3.911,11.73c-8.876-9.637-19.73-17.422-31.912-22.709c3.592-5.288,9.642-8.618,16.225-8.618 C187.263,52.647,196.054,61.438,196.054,72.244z M100.273,18h45.135c10.833,0,19.927,7.565,22.292,17.689 c-10.778,2.597-20.014,9.887-24.977,19.95c-6.412-1.383-13.063-2.118-19.882-2.118s-13.47,0.735-19.882,2.118 c-4.963-10.063-14.199-17.354-24.977-19.95C80.346,25.565,89.44,18,100.273,18z M49.626,72.244 c0-10.806,8.791-19.597,19.598-19.597c6.583,0,12.632,3.33,16.225,8.618c-12.182,5.287-23.036,13.072-31.912,22.709 C51.036,80.621,49.626,76.509,49.626,72.244z M46.605,147.757c0-42.036,34.199-76.235,76.235-76.235s76.235,34.199,76.235,76.235 s-34.199,76.234-76.235,76.234S46.605,189.793,46.605,147.757z"></path> <path d="M165.37,144.256h-34.629v-43.322c0-4.971-4.029-9-9-9s-9,4.029-9,9v52.322c0,4.971,4.029,9,9,9h43.629c4.971,0,9-4.029,9-9 S170.34,144.256,165.37,144.256z"></path> </g> </g></svg>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
const ignoreIcon = L.divIcon({
  className: '',
  html: '<svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><rect width="512" height="512" rx="360" fill="#0F0" opacity="0.8"/><g stroke-linecap="round" stroke-linejoin="round"/><path d="M215.03 71.05 126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z" opacity="0.8"/></svg>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const scheduledIcon = L.divIcon({
  className: '',
  html: '<svg height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="-256 -256 1024 1024" xml:space="preserve"><rect x="-256" y="-256" width="1024" height="1024" rx="720" fill="#0F0" opacity=".8"/><g stroke-linecap="round" stroke-linejoin="round"/><path d="M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z" opacity=".8"/></svg>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function Map({data, isLoading, setLassoFilter}) {
  const navigate = useNavigate();
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);

  const onClickHandler = (element) => () => {
    let _popup = document.getElementsByClassName('leaflet-popup-content-wrapper');
    setLassoFilter(new Set([element.locid]));
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
          text: 'Link til Google Maps',
          callback: function (e) {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${e.latlng.lat},${e.latlng.lng}`,
              '_blank'
            );
          },
        },
        '-',
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

    // L.control.lasso().addTo(map);

    map.on('lasso.finished', (event) => {
      console.log(event.layers);
      console.log(new Set(event.layers.map((layer) => layer.options.loc_id)));
      setLassoFilter(() => new Set(event.layers.map((layer) => layer.options.loc_id)));
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

    let panes = [];

    if (!isLoading) {
      data.forEach((element) => {
        const point = [element.latitude, element.longitude];
        var marker = null;

        if (!panes.includes(element.color)) {
          panes.push(element.color);
          mapRef.current.createPane(element.color);
          mapRef.current.getPane(element.color).style.zIndex = element.flag + 400;
        }

        switch (element.status) {
          case 'POSTPONED':
            marker = L.marker(point, {
              icon: postponeIcon,
              loc_id: element.locid,
              zIndexOffset: -1000000000000,
            });
            break;
          case 'IGNORED':
            marker = L.marker(point, {
              icon: ignoreIcon,
              loc_id: element.locid,
              zIndexOffset: -1000000000000,
            });
            break;
          case 'SCHEDULED':
            marker = L.marker(point, {
              icon: scheduledIcon,
              loc_id: element.locid,
              zIndexOffset: 0,
            });
            break;
          default:
            marker = L.circleMarker(point, {
              // icon: element.status == 'POSTPONED' ? icon : null,
              radius: 8,
              weight: 1,
              fillOpacity: 0.8,
              opacity: 0.8,
              color: 'black',
              fillColor: element.color,
              loc_id: element.locid,
              zIndexOffset: element.flag * 1000000000000,
              pane: element.color,
            });
            break;
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
