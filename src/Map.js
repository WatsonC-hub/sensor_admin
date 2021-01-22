import React, { useEffect, useContext } from "react";
import ReactDOMServer from "react-dom/server";
import ReactDOM from "react-dom";
import L from "leaflet";
import LocationContext from "./LocationContext";

const style = {
  width: "100%",
  height: "1200px",
};

let stationIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYWdfMSIgZGF0YS1uYW1lPSJMYWcgMSIgdmlld0JveD0iMCAwIDU1MC40NCA1NTEuNzQiIHdpZHRoPSI0MnB4IiBoZWlnaHQ9IjQycHgiPgogICAgICAgIDxkZWZzPgogICAgICAgICAgICA8c3R5bGU+CiAgICAgICAgICAgICAgICAuY2xzLTF7ZmlsbDojMDA1ODdhO30KICAgICAgICAgICAgICAgIC5jbHMtMSwuY2xzLTR7fQogICAgICAgICAgICAgICAgLmNscy0ye2ZpbGw6IzEzODBjNDt9CiAgICAgICAgICAgICAgICAuY2xzLTN7ZmlsbDojMTM4MGM0O30KICAgICAgICAgICAgICAgIC5jbHMtNHtmaWxsOm5vbmU7fQogICAgICAgICAgICA8L3N0eWxlPgogICAgICAgIDwvZGVmcz4KICAgICAgICA8dGl0bGU+Q2lya2VsPC90aXRsZT4KICAgICAgICA8ZyBpZD0iTGFnXzEtMiIgZGF0YS1uYW1lPSJMYWcgMS0yIj4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQ1LjYsNDUxLjc2QzUzNi45MywyMTAuNTksMzQyLjYsMTUuMTksMTAxLjYsNWExNS44OCwxNS44OCwwLDAsMC0xNi41MiwxNS4yaDB2NDlhMTYuMjMsMTYuMjMsMCwwLDAsMTUuNTUsMTYuMTJjMTk3LjY4LDkuMjYsMzU2LjU4LDE2OS4xLDM2NC42MywzNjYuODdhMTYuMjUsMTYuMjUsMCwwLDAsMTYuMDYsMTUuNjJsNDguMjMuMzRhMTUuOTMsMTUuOTMsMCwwLDAsMTYuMDYtMTUuNzZoMEM1NDUuNjEsNDUyLjIxLDU0NS42MSw0NTIsNTQ1LjYsNDUxLjc2Wm0tMTU5LjYuNDNjLTktMTUzLjYxLTEzMi40MS0yNzcuNjEtMjg1Ljc5LTI4Ny41YTE1LjgxLDE1LjgxLDAsMCwwLTE2Ljc5LDE0Ljc3aDB2MS4xM0w4My41NiwyMjlhMTYuMzIsMTYuMzIsMCwwLDAsMTUsMTYuMmMxMTAuNjUsOC4zOCwxOTkuMTksOTcuNzEsMjA2Ljg5LDIwOC4xNWExNi4zLDE2LjMsMCwwLDAsMTYuMTEsMTUuMDhsNDguMzkuNDZBMTUuODIsMTUuODIsMCwwLDAsMzg2LDQ1My40di0xLjIxWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTAuMTcgLTAuMDMpIi8+CiAgICAgICAgICAgIDxjaXJjbGUgY2xhc3M9ImNscy0yIiBjeD0iMTE5LjgzIiBjeT0iNDMxLjc0IiByPSIxMTUiLz4KICAgICAgICA8L2c+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMTIwLjE3LDU0Ni43N2MtNjMuNjYsMC0xMTUuMjYtNTEuNDktMTE1LjI2LTExNXM1MS42LTExNSwxMTUuMjYtMTE1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMC4xNyAtMC4wMykiLz4KICAgICAgICA8Y2lyY2xlIGNsYXNzPSJjbHMtNCIgY3g9IjEyMCIgY3k9IjQzMS43NCIgcj0iMTE1Ii8+CiAgICA8L3N2Zz4=",
});

function MarkerText(props) {
  const { elem, text } = props;
  return (
    <button onClick={() => console.log("clicled: ", elem.properties.lat)}>
      {text}
    </button>
  );
}

function Map(props) {
  const context = useContext(LocationContext);
  const mapRef = React.useRef(null);
  const popupsRef = React.useRef([]);
  const onPopupClick = (markerId) => {
    alert("clicked popup " + markerId);
  };

  const renderMap = () => {
    const myAttributionText =
      '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';
    const kftoken = "d12107f70a3ee93153f313c7c502169a";
    const toposkaermkortwmts = L.tileLayer.wms(
      "https://services.kortforsyningen.dk/topo_skaermkort",
      {
        layers: "dtk_skaermkort_daempet",
        token: kftoken,
        format: "image/png",
        attribution: myAttributionText,
      }
    );

    const kommuneWms = L.tileLayer.wms(
      "https://services.kortforsyningen.dk/service?request=GetCapabilities&servicename=dagi" +
        "&service=WMS&version=1.1.1",
      {
        layers: "kommune",
        format: "image/png",
        token: kftoken,
        transparent: true,
      }
    );

    return L.map("map", {
      center: [55.876823, 8.961644],
      zoom: 8,
      layers: [toposkaermkortwmts, kommuneWms],
    });
  };

  const renderFeatures = (data) => {
    if (data) {
      data.forEach((element) => {
        const marker = L.marker(
          [element.properties.lat, element.properties.long],
          {
            icon: stationIcon,
          }
        ).bindPopup(element.properties.mouseover);
        const popup = marker.getPopup();
        popupsRef.current.push(popup);
        popup.on("click", () => onPopupClick(element.properties.lat));
        marker.addTo(layerRef.current);
      });
    }
  };

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
    const data = props.data.features;
    if (data) {
      data.forEach((element) => {
        const point = [element.properties.lat, element.properties.long];
        const marker = L.marker(point, {
          icon: stationIcon,
        }).bindPopup(element.properties.mouseover);
        marker.on("click", () => {
          let _popup = document.getElementsByClassName(
            "leaflet-popup-content-wrapper"
          );
          if (_popup && _popup.length > 0) {
            L.DomEvent.on(_popup[0], "click", () => {
              context.setLocationId(element.properties.locid + "_");
            });
          }
        });
        marker.addTo(layerRef.current);
      });
    }
  }, [props.data.features]);

  return <div id='map' style={style}></div>;
}

export default Map;
