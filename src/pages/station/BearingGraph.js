import React, { useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Plot from "react-plotly.js";
import { getGraphData, getControlData } from "../../api";

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
      step: "all",
    },
  ],
};
const layout2 = {
  autosize: true,
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: "date",
  },
  yaxis: {
    title: {
      text: "Sensor output",
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
    l: 60,
    r: 0,
    b: 30,
    t: 10,
    pad: 4,
  },
  font: {
    size: 12,
    color: "rgb(0, 0, 0)",
  },
};

function PlotGraph({ graphData, controlData }) {
  // console.log(graphData);
  const [stationName, setStationName] = useState("stationnavn");
  const name = graphData[0] ? graphData[0].properties.stationname : "";
  const xData = graphData.map((d) => d.properties.timeofmeas);
  const yData = graphData.map((d) => d.properties.measurement);
  const xControl = controlData.map((d) => d.properties.timeofmeas);
  const yControl = controlData.map((d) => d.properties.waterlevel);

  useEffect(() => {
    if (graphData[0]) setStationName(graphData[0].properties.stationname);
  }, [graphData]);

  return (
    // <div>
    <Plot
      data={[
        {
          x: xData,
          y: yData,
          name: name,
          type: "scatter",
          line: { width: 2 },
          mode: "lines",
          marker: { symbol: "100", size: "4" },
          marker: {
            color: "hex#177FC1",
          },
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
            color: "hex#177FC1",
            line: { color: "rgb(0,0,0)", width: 1 },
          },
        },
      ]}
      layout={layout2}
      config={{
        responsive: true,
        modeBarButtonsToRemove: [
          "pan2d",
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
    // </div>
  );
}

export default function BearingGraph({ stationId }) {
  const [graphData, setGraphData] = useState([]);
  const [controlData, setControlData] = useState([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getGraphData(stationId).then((res) => {
      if (res.data.success) {
        setGraphData(res.data.features);
      }
    });
  }, [stationId]);

  useEffect(() => {
    getControlData(stationId).then((res) => {
      if (res.data.success) {
        setControlData(res.data.features);
      }
    });
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
      <PlotGraph graphData={graphData} controlData={controlData} />
    </div>
  );
}
