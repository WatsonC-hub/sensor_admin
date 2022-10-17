import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Plot from "react-plotly.js";
import moment from "moment";
import { getGraphData } from "../../api";

const selectorOptions = {
  buttons: [
    {
      step: "day",
      stepmode: "backward",
      count: 7,
      label: "1 uge",
    },
    {
      step: "year",
      stepmode: "backward",
      count: 1,
      label: "1 år",
    },
    {
      step: "month",
      stepmode: "backward",
      count: 1,
      label: "1 måned",
    },
    {
      step: "all",
      label: "Alt",
    },
  ],
};

var downloadIcon = {
  width: 500,
  // viewBox: "0 0 60 55",
  path: "M224 376V512H24C10.7 512 0 501.3 0 488v-464c0-13.3 10.7-24 24-24h336c13.3 0 24 10.7 24 24V352H248c-13.2 0-24 10.8-24 24zm76.45-211.36-96.42-95.7c-6.65-6.61-17.39-6.61-24.04 0l-96.42 95.7C73.42 174.71 80.54 192 94.82 192H160v80c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-80h65.18c14.28 0 21.4-17.29 11.27-27.36zM377 407 279.1 505c-4.5 4.5-10.6 7-17 7H256v-128h128v6.1c0 6.3-2.5 12.4-7 16.9z",
  ascent: 500,
  descent: -50,
};

var makeLinkIcon = {
  width: 500,
  // viewBox: "0 0 60 55",
  path: "M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z",
  ascent: 500,
  descent: -50,
};

function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = "";
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? "" : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ";";
      finalVal += result;
    }
    return finalVal + "\n";
  };

  var csvFile = "";
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

const layout1 = {
  xaxis: {
    rangeselector: selectorOptions,
    /*rangeslider: {},*/
    autorange: true,
    type: "date",
    //range:["2020-12-01T00:00:00", A],
    //domain: [0, 0.97],
    showline: true,
  },

  //xaxis: {domain: [0, 0.9]},
  yaxis: {
    title: {
      text: "",
      font: { size: 12 },
    },
    showline: true,
  },

  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: "h",
  },
  margin: {
    // l: 70,
    r: 0,
    // b: 30,
    t: 10,
    pad: 4,
  },
  font: {
    size: 12,
    color: "rgb(0, 0, 0)",
  },
};

const layout3 = {
  modebar: {
    orientation: "v",
  },
  autosize: true,
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: "date",
    margin: {
      t: 0,
    },
  },

  yaxis: {
    showline: true,
    y: 1,
    title: {
      text: "",
      font: { size: 12 },
    },
  },

  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: "h",
  },
  margin: {
    // l: 30,
    r: 30,
    // b: 30,
    t: 10,
    pad: 4,
  },
  font: {
    size: 12,
    color: "rgb(0, 0, 0)",
  },
};

function PlotGraph({ graphData, controlData, dynamicMeasurement }) {
  const name = graphData[0]
    ? JSON.parse(graphData[0].properties.data).name
    : "";
  const xData = graphData[0] ? JSON.parse(graphData[0].properties.data).x : [];
  const yData = graphData[0] ? JSON.parse(graphData[0].properties.data).y : [];
  const trace = graphData[0] ? JSON.parse(graphData[0].properties.trace) : {};
  const xControl = controlData.map((d) => d.timeofmeas);
  const yControl = controlData.map((d) => d.waterlevel);
  const stationtype = graphData[0] ? graphData[0].properties.parameter : "";
  const unit = graphData[0] ? graphData[0].properties.unit : "";
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const [xDynamicMeasurement, setXDynamicMeasurement] = useState([]);
  const [yDynamicMeasurement, setYDynamicMeasurement] = useState([]);

  useEffect(() => {
    console.log(dynamicMeasurement);
    if (dynamicMeasurement !== undefined) {
      setXDynamicMeasurement([dynamicMeasurement[0]]);
      setYDynamicMeasurement([dynamicMeasurement[1]]);
    }
    else {
      setXDynamicMeasurement([]);
      setYDynamicMeasurement([]);
    }
  }, [dynamicMeasurement]);

  // useEffect(() => {
  //   if (graphData[0]) setStationName(graphData[0].properties.stationname);
  // }, [graphData]);

  var downloadButton = {
    name: "Download data",
    icon: downloadIcon,
    click: function (gd) {
      console.log(gd.data);
      var rows = gd.data[0].x.map((elem, idx) => [
        moment(elem).format("YYYY-MM-DD HH:mm"),
        gd.data[0].y[idx].toString().replace(".", ","),
      ]);

      exportToCsv("data.csv", rows);
    },
  };

  var makeLinkButton = {
    name: "Ekstern link",
    icon: makeLinkIcon,
    click: function (gd) {
      var ts_id = window.location.href.split("/").at(-1);

      var link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url =
          "https://watsonc.dk/calypso/timeseries_plot.html?&ts_id=" +
          ts_id +
          "&pejling=true";
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // exportToCsv("data.csv", rows);
    },
  };

  return (
    <Plot
      data={[
        {
          x: xData,
          y: yData,
          name: name,
          type: "scatter",
          line: { width: 2 },
          mode: "lines",
          marker: { symbol: "100", size: "3", color: "#177FC1" },
        },
        {
          x: xControl,
          y: yControl,
          name: "Kontrolpejlinger",
          type: "scatter",
          mode: "markers",
          marker: {
            symbol: "200",
            size: "8",
            color: "#177FC1",
            line: { color: "rgb(0,0,0)", width: 1 },
          },
        },
        {
          x: xDynamicMeasurement,
          y: yDynamicMeasurement,
          name: "",
          type: "scatter",
          mode: "markers",
          showlegend: false,
          marker: { symbol: "50", size: "8", color: "rgb(0,120,109)" },
        },
      ]}
      layout={
        matches
          ? {
              ...layout3,
              yaxis: {
                ...layout3.yaxis,
                title: stationtype + ", " + unit,
              },
            }
          : {
              ...layout1,
              yaxis: {
                ...layout1.yaxis,
                title: stationtype + ", " + unit,
              },
            }
      }
      config={{
        responsive: true,
        modeBarButtons: [
          [downloadButton, makeLinkButton],
          ["zoom2d", "pan2d", "zoomIn2d", "zoomOut2d", "resetScale2d"],
        ],

        displaylogo: false,
        displayModeBar: true,
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default function BearingGraph({
  stationId,
  updated,
  measurements,
  dynamicMeasurement,
}) {
  const [graphData, setGraphData] = useState([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (stationId !== -1 && stationId !== null) {
      getGraphData(stationId).then((res) => {
        if (res.data.success) {
          setGraphData(res.data.features);
        }
      });
    }
  }, [stationId]);

  return (
    <div
      style={{
        width: "auto",
        height: matches ? "300px" : "500px",
        marginBottom: "10px",
        marginTop: "-10px",
        paddingTop: "5px",
        border: "2px solid gray",
      }}
    >
      <PlotGraph
        graphData={graphData}
        controlData={measurements}
        dynamicMeasurement={dynamicMeasurement}
      />
    </div>
  );
}
