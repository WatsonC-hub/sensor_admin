import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Plot from "react-plotly.js";
import { getGraphData, getControlData } from "../../api";

const selectorOptions = {
  buttons: [
    {
      step: "day",
      stepmode: "backward",
      count: 1,
      label: "1 dag",
    },
    {
      step: "day",
      stepmode: "backward",
      count: 7,
      label: "1 uge",
    },
    {
      step: "month",
      stepmode: "backward",
      count: 1,
      label: "1 måned",
    },
    {
      step: "year",
      stepmode: "backward",
      count: 1,
      label: "1 år",
    },
  ],
};

const layout2 = {
  autosize: true,
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: "date",
    domain: [0, 0.97],
  },
  yaxis: {
    title: {
      text: "Vandstand, kote [m]",
      font: { size: 14 },
    },
  },
  yaxis2: {
    showgrid: false,
    overlaying: "y1",
    side: "right",
    fixedrange: true,
    range: [0, 15],
    position: 0.97,
    title: {
      text: "Nedbør [mm]",
      font: { size: 14 },
    },
  },

  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: "h",
  },
  margin: {
    l: 70,
    r: 20,
    b: 50,
    t: 10,
    pad: 4,
  },
  font: {
    size: 14,
    color: "rgb(0, 0, 0)",
  },
};

function PlotGraph({ graphData, controlData }) {
  const xData = graphData.map((d) => d.properties.timeofmeas);
  const yData = graphData.map((d) => d.properties.measurement);
  const xControl = controlData.map((d) => d.properties.timeofmeas);
  const yControl = controlData.map((d) => d.properties.waterlevel);

  return (
    <Plot
      data={[
        {
          x: xData,
          y: yData,
          type: "scattergl",
          line: { width: 1 },
          mode: "lines+markers",
          marker: { symbol: "100", size: "4" },
        },
        {
          x: xControl,
          y: yControl,
          type: "scatter",
          mode: "markers",
          marker: {
            symbol: "200",
            size: "12",
            color: "hex#FF0000",
            line: { color: "rgb(0,0,255)", width: 1 },
          },
        },
      ]}
      layout={layout2}
      config={{ responsive: true }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default function BearingGraph({ stationId }) {
  const [graphData, setGraphData] = useState([]);
  const [controlData, setControlData] = useState([]);

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
        height: "500px",
        marginBottom: "20px",
        border: "2px solid gray",
      }}
    >
      <PlotGraph graphData={graphData} controlData={controlData} />
    </div>
  );
}
