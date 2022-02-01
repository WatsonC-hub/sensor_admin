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

var icon = {
  width: 1000,
  path: "m833 5l-17 108v41l-130-65 130-66c0 0 0 38 0 39 0-1 36-14 39-25 4-15-6-22-16-30-15-12-39-16-56-20-90-22-187-23-279-23-261 0-341 34-353 59 3 60 228 110 228 110-140-8-351-35-351-116 0-120 293-142 474-142 155 0 477 22 477 142 0 50-74 79-163 96z m-374 94c-58-5-99-21-99-40 0-24 65-43 144-43 79 0 143 19 143 43 0 19-42 34-98 40v216h87l-132 135-133-135h88v-216z m167 515h-136v1c16 16 31 34 46 52l84 109v54h-230v-71h124v-1c-16-17-28-32-44-51l-89-114v-51h245v72z",
  ascent: 850,
  descent: -150,
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

function PlotGraph({ graphData, controlData }) {
  // const [stationName, setStationName] = useState("stationnavn");
  const name = graphData[0] ? graphData[0].properties.ts_name : "";
  const xData = graphData[0] ? JSON.parse(graphData[0].properties.data).x : [];
  const yData = graphData[0] ? JSON.parse(graphData[0].properties.data).y : [];
  const trace = graphData[0] ? JSON.parse(graphData[0].properties.trace) : {};
  const xControl = controlData.map((d) => d.timeofmeas);
  const yControl = controlData.map((d) => d.waterlevel);
  const stationtype = graphData[0] ? graphData[0].properties.parameter : "";
  const unit = graphData[0] ? graphData[0].properties.unit : "";
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  // useEffect(() => {
  //   if (graphData[0]) setStationName(graphData[0].properties.stationname);
  // }, [graphData]);

  var downloadButton = {
    name: "color toggler",
    icon: icon,
    click: function (gd) {
      console.log(gd.data);
      var rows = gd.data[0].x.map((elem, idx) => [
        moment(elem).format("YYYY-MM-DD HH:mm"),
        gd.data[0].y[idx].toString().replace(".", ","),
      ]);

      exportToCsv("data.csv", rows);
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
          [downloadButton],
          ["zoom2d", "pan2d", "zoomIn2d", "zoomOut2d", "resetScale2d"],
          // ["zoom2d", "pan2d", "zoomIn2d", "zoomOut2d", "reset"],
        ],
        // modeBarButtonsToRemove: [
        //   "select2d",
        //   "lasso2d",
        //   "autoScale2d",
        //   "hoverCompareCartesian",
        //   "hoverClosestCartesian",
        //   "toggleSpikelines",
        // ],
        // modeBarButtonsToAdd: [
        //   {
        //     name: "color toggler",
        //     icon: icon,
        //     click: function (gd) {
        //       console.log(gd.data);
        //       var rows = gd.data[0].x.map((elem, idx) => [
        //         moment(elem).format("YYYY-MM-DD HH:mm"),
        //         gd.data[0].y[idx].toString().replace(".", ","),
        //       ]);

        //       exportToCsv("data.csv", rows);
        //     },
        //   },
        // ],
        displaylogo: false,
        displayModeBar: true,
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default function BearingGraph({ stationId, updated, measurements }) {
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
      <PlotGraph graphData={graphData} controlData={measurements} />
    </div>
  );
}
