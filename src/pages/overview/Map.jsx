import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import L from "leaflet";
import "leaflet.locatecontrol";
import LocationContext from "../../state/LocationContext";
import Button from "@material-ui/core/Button";
import { atom, useAtom } from "jotai";

const zoomAtom = atom(null);
const panAtom = atom(null);

const style = {
  width: "100%",
  height: "80vh",
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

function Map({ sensorData, loading }) {
  const context = useContext(LocationContext);
  const history = useHistory();
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [pan, setPan] = useAtom(panAtom);

  const onClickHandler = (element) => () => {
    let _popup = document.getElementsByClassName(
      "leaflet-popup-content-wrapper"
    );
    if (_popup && _popup.length > 0) {
      L.DomEvent.on(_popup[0], "click", () => {
        context.setLocationId(element.locid);
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
        format: "image/png",
        attribution: myAttributionText,
      }
    );

    const satelitemapbox = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        maxZoom: 20,
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
        maxZoom: 20,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: "mapbox/outdoors-v11",
        tileSize: 512,
        zoomOffset: -1,
      }
    );

    var map = L.map("map", {
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
          title: "Find mig",
        },
      })
      .addTo(map);

    map.on("moveend", function () {
      setZoom(map.getZoom());
      setPan(map.getCenter());
    });

    return map;
  };

  useEffect(() => {
    mapRef.current = renderMap();
    layerRef.current = L.featureGroup().addTo(mapRef.current);
    layerRef.current.clearLayers();
    const data = sensorData;
    if (!loading) {
      data.forEach((element) => {
        const point = [element.lat, element.long];
        console.log();
        const marker = L.circleMarker(point, {
          // icon: element.status ? stationIcon : inactiveIcon,
          radius: 8,
          weight: 1,
          fillOpacity: 0.8,
          opacity: 0.8,
          color: "#000000",
          fillColor: element.status ? "#3388ff" : "#C0C0C0",
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
  }, [sensorData]);

  return <div id="map" style={style}></div>;
}

export default Map;
