import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Plot from "react-plotly.js";
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
        modeBarButtonsToRemove: [
          "select2d",
          "lasso2d",
          "autoScale2d",
          "hoverCompareCartesian",
          "hoverClosestCartesian",
          "toggleSpikelines",
        ],
        displaylogo: false,
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
