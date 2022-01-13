import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import L from "leaflet";
import "leaflet.locatecontrol";
import { getSensorData } from "../../api";
import LocationContext from "../../context/LocationContext";
import Button from "@material-ui/core/Button";

const style = {
  width: "100%",
  height: "1000px",
};

let stationIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYWdfMSIgZGF0YS1uYW1lPSJMYWcgMSIgdmlld0JveD0iMCAwIDU1MC40NCA1NTEuNzQiIHdpZHRoPSI0MnB4IiBoZWlnaHQ9IjQycHgiPgogICAgICAgIDxkZWZzPgogICAgICAgICAgICA8c3R5bGU+CiAgICAgICAgICAgICAgICAuY2xzLTF7ZmlsbDojMDA1ODdhO30KICAgICAgICAgICAgICAgIC5jbHMtMSwuY2xzLTR7fQogICAgICAgICAgICAgICAgLmNscy0ye2ZpbGw6IzEzODBjNDt9CiAgICAgICAgICAgICAgICAuY2xzLTN7ZmlsbDojMTM4MGM0O30KICAgICAgICAgICAgICAgIC5jbHMtNHtmaWxsOm5vbmU7fQogICAgICAgICAgICA8L3N0eWxlPgogICAgICAgIDwvZGVmcz4KICAgICAgICA8dGl0bGU+Q2lya2VsPC90aXRsZT4KICAgICAgICA8ZyBpZD0iTGFnXzEtMiIgZGF0YS1uYW1lPSJMYWcgMS0yIj4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQ1LjYsNDUxLjc2QzUzNi45MywyMTAuNTksMzQyLjYsMTUuMTksMTAxLjYsNWExNS44OCwxNS44OCwwLDAsMC0xNi41MiwxNS4yaDB2NDlhMTYuMjMsMTYuMjMsMCwwLDAsMTUuNTUsMTYuMTJjMTk3LjY4LDkuMjYsMzU2LjU4LDE2OS4xLDM2NC42MywzNjYuODdhMTYuMjUsMTYuMjUsMCwwLDAsMTYuMDYsMTUuNjJsNDguMjMuMzRhMTUuOTMsMTUuOTMsMCwwLDAsMTYuMDYtMTUuNzZoMEM1NDUuNjEsNDUyLjIxLDU0NS42MSw0NTIsNTQ1LjYsNDUxLjc2Wm0tMTU5LjYuNDNjLTktMTUzLjYxLTEzMi40MS0yNzcuNjEtMjg1Ljc5LTI4Ny41YTE1LjgxLDE1LjgxLDAsMCwwLTE2Ljc5LDE0Ljc3aDB2MS4xM0w4My41NiwyMjlhMTYuMzIsMTYuMzIsMCwwLDAsMTUsMTYuMmMxMTAuNjUsOC4zOCwxOTkuMTksOTcuNzEsMjA2Ljg5LDIwOC4xNWExNi4zLDE2LjMsMCwwLDAsMTYuMTEsMTUuMDhsNDguMzkuNDZBMTUuODIsMTUuODIsMCwwLDAsMzg2LDQ1My40di0xLjIxWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTAuMTcgLTAuMDMpIi8+CiAgICAgICAgICAgIDxjaXJjbGUgY2xhc3M9ImNscy0yIiBjeD0iMTE5LjgzIiBjeT0iNDMxLjc0IiByPSIxMTUiLz4KICAgICAgICA8L2c+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMTIwLjE3LDU0Ni43N2MtNjMuNjYsMC0xMTUuMjYtNTEuNDktMTE1LjI2LTExNXM1MS42LTExNSwxMTUuMjYtMTE1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMC4xNyAtMC4wMykiLz4KICAgICAgICA8Y2lyY2xlIGNsYXNzPSJjbHMtNCIgY3g9IjEyMCIgY3k9IjQzMS43NCIgcj0iMTE1Ii8+CiAgICA8L3N2Zz4=",
  iconSize: [15, 15],
});

let inactiveIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYWdfMSIgZGF0YS1uYW1lPSJMYWcgMSIgdmlld0JveD0iMCAwIDU1MC40NCA1NTEuNzQiIHdpZHRoPSI0MnB4IiBoZWlnaHQ9IjQycHgiPgogICAgICAgIDxkZWZzPgogICAgICAgICAgICA8c3R5bGU+CiAgICAgICAgICAgICAgICAuY2xzLTF7ZmlsbDojYmFiYWJhO30KICAgICAgICAgICAgICAgIC5jbHMtMSwuY2xzLTR7fQogICAgICAgICAgICAgICAgLmNscy0ye2ZpbGw6IzEzODBjNDt9CiAgICAgICAgICAgICAgICAuY2xzLTN7ZmlsbDojMTM4MGM0O30KICAgICAgICAgICAgICAgIC5jbHMtNHtmaWxsOm5vbmU7fQogICAgICAgICAgICA8L3N0eWxlPgogICAgICAgIDwvZGVmcz4KICAgICAgICA8dGl0bGU+Q2lya2VsPC90aXRsZT4KICAgICAgICA8ZyBpZD0iTGFnXzEtMiIgZGF0YS1uYW1lPSJMYWcgMS0yIj4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQ1LjYsNDUxLjc2QzUzNi45MywyMTAuNTksMzQyLjYsMTUuMTksMTAxLjYsNWExNS44OCwxNS44OCwwLDAsMC0xNi41MiwxNS4yaDB2NDlhMTYuMjMsMTYuMjMsMCwwLDAsMTUuNTUsMTYuMTJjMTk3LjY4LDkuMjYsMzU2LjU4LDE2OS4xLDM2NC42MywzNjYuODdhMTYuMjUsMTYuMjUsMCwwLDAsMTYuMDYsMTUuNjJsNDguMjMuMzRhMTUuOTMsMTUuOTMsMCwwLDAsMTYuMDYtMTUuNzZoMEM1NDUuNjEsNDUyLjIxLDU0NS42MSw0NTIsNTQ1LjYsNDUxLjc2Wm0tMTU5LjYuNDNjLTktMTUzLjYxLTEzMi40MS0yNzcuNjEtMjg1Ljc5LTI4Ny41YTE1LjgxLDE1LjgxLDAsMCwwLTE2Ljc5LDE0Ljc3aDB2MS4xM0w4My41NiwyMjlhMTYuMzIsMTYuMzIsMCwwLDAsMTUsMTYuMmMxMTAuNjUsOC4zOCwxOTkuMTksOTcuNzEsMjA2Ljg5LDIwOC4xNWExNi4zLDE2LjMsMCwwLDAsMTYuMTEsMTUuMDhsNDguMzkuNDZBMTUuODIsMTUuODIsMCwwLDAsMzg2LDQ1My40di0xLjIxWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTAuMTcgLTAuMDMpIi8+CiAgICAgICAgICAgIDxjaXJjbGUgY2xhc3M9ImNscy0yIiBjeD0iMTE5LjgzIiBjeT0iNDMxLjc0IiByPSIxMTUiLz4KICAgICAgICA8L2c+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMTIwLjE3LDU0Ni43N2MtNjMuNjYsMC0xMTUuMjYtNTEuNDktMTE1LjI2LTExNXM1MS42LTExNSwxMTUuMjYtMTE1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMC4xNyAtMC4wMykiLz4KICAgICAgICA8Y2lyY2xlIGNsYXNzPSJjbHMtNCIgY3g9IjEyMCIgY3k9IjQzMS43NCIgcj0iMTE1Ii8+CiAgICA8L3N2Zz4=",
  iconSize: [15, 15],
});

function Map() {
  const context = useContext(LocationContext);
  const history = useHistory();
  const mapRef = React.useRef(null);
  const [sensorData, setSensorData] = useState([]);

  const onClickHandler = (element) => () => {
    let _popup = document.getElementsByClassName(
      "leaflet-popup-content-wrapper"
    );
    if (_popup && _popup.length > 0) {
      L.DomEvent.on(_popup[0], "click", () => {
        context.setLocationId(element.locid + "_");
        history.push("location/" + element.locid);
        context.setTabValue(1);
      });
    }
  };

  const renderMap = () => {
    const myAttributionText =
      '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';
    const kftoken = "d12107f70a3ee93153f313c7c502169a";

    const toposkaermkortwmts = L.tileLayer.wms(
      "https://services.datafordeler.dk/Dkskaermkort/topo_skaermkort/1.0.0/wms?&username=WXIJZOCTKQ&password=E7WfqcwH_",
      {
        layers: "dtk_skaermkort_daempet",
        transparent: "FALSE",
        // username: "WXIJZOCTKQ",
        // password: "Dsht5!as",
        format: "image/png",
        attribution: myAttributionText,
      }
    );

    const satelitemapbox = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        maxZoom: 18,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: "mapbox/satellite-v9",
        tileSize: 512,
        zoomOffset: -1,
      }
    );

    const outdormapbox = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        maxZoom: 18,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: "mapbox/outdoors-v11",
        tileSize: 512,
        zoomOffset: -1,
      }
    );
    // const kommuneWms = L.tileLayer.wms(
    //   "https://services.kortforsyningen.dk/service?request=GetCapabilities&servicename=dagi" +
    //     "&service=WMS&version=1.1.1",
    //   {
    //     layers: "kommune",
    //     format: "image/png",
    //     token: kftoken,
    //     transparent: "TRUE",
    //   }
    // );

    var map = L.map("map", {
      center: [55.876823, 8.961644],
      zoom: 8,
      layers: [outdormapbox],
      tap: false,
    });

    var baseMaps = {
      OpenStreetMap: outdormapbox,
      Vandløb: toposkaermkortwmts,
      Satelit: satelitemapbox,
    };

    L.control.layers(baseMaps).addTo(map);
    // map
    //   .locate({ setView: true, watch: true })
    //   .on("locationfound", function (e) {
    //     var marker = L.marker([e.latitude, e.longitude]).bindPopup(
    //       "Your are here :)"
    //     );
    //     var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
    //       weight: 1,
    //       color: "lightblue",
    //       fillColor: "#cacaca",
    //       fillOpacity: 0.5,
    //     });
    //     map.addLayer(marker);
    //     map.addLayer(circle);
    //     map.flyTo(e.latlng, 17);
    //   });

    var ourCustomControl = L.Control.extend({
      options: {
        position: "topleft",
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
      },

      onAdd: function (map) {
        this._div = L.DomUtil.create(
          "img",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );
        this._div.type = "button";
        this._div.src = "/location-2955.png";
        this._div.style.backgroundColor = "white";
        this._div.style.width = "30px";
        this._div.style.height = "30px";
        L.DomEvent.on(this._div, "click", this._click);
        return this._div;
      },

      _click: function (e) {
        map
          .locate({ setView: true, watch: true })
          .on("locationfound", function (e) {
            var marker = L.marker([e.latitude, e.longitude]).bindPopup(
              "Your are here :)"
            );
            var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
              weight: 1,
              color: "lightblue",
              fillColor: "#cacaca",
              fillOpacity: 0.5,
            });
            map.addLayer(marker);
            map.addLayer(circle);
            map.flyTo(e.latlng, 17);
            console.log("hej");
          });
      },
    });

    map.addControl(new ourCustomControl());

    // L.control
    //   .locate({
    //     icon: "/location-2955.png",
    //     strings: {
    //       title: "Find mig",
    //     },
    //   })
    //   .addTo(map);
    return map;
  };

  useEffect(() => {
    let sessionId = sessionStorage.getItem("session_id");

    getSensorData(sessionId).then((res) => setSensorData(res.data.data));
  }, []);

  useEffect(() => {
    mapRef.current = renderMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const layerRef = React.useRef(null);

  useEffect(() => {
    layerRef.current = L.featureGroup().addTo(mapRef.current);
  }, []);

  useEffect(() => {
    layerRef.current.clearLayers();
    const data = sensorData;
    if (data) {
      data.forEach((element) => {
        const point = [element.lat, element.long];
        console.log();
        const marker = L.marker(point, {
          icon: element.status ? stationIcon : inactiveIcon,
        }).bindPopup(
          element.mouseover.split(
            '<b style="color:#10ae8c;">-----------</b>'
          )[0] +
            "</p>" +
            "<a>Se graf</a>"
        );
        marker.on("click", onClickHandler(element));
        marker.addTo(layerRef.current);
      });
    }
  }, [sensorData]);

  return (
    <div id="map" style={style}>
      <Button>Test</Button>
    </div>
  );
}

export default Map;
