import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Plot from "react-plotly.js";
import { getGraphData, getControlData } from "../../api";

const useStyles = makeStyles({
  root: {
    maxWidth: 1000,
    marginBottom: 25,
  },
  media: {
    height: 274,
    backgroundPosition: "unset",
  },
});

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
  width: 900,
  xaxis: {
    rangeselector: selectorOptions,
    /*rangeslider: {},*/
    autorange: true,
    type: "date",
    //range:["2020-12-01T00:00:00", A],
    domain: [0, 0.97],
  },

  //xaxis: {domain: [0, 0.9]},
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
          x: xData, //[1, 2, 3],
          y: yData, //[2, 6, 3],
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
      // layout={{ width: 900, height: 500, title: "" }}
    />
  );
}

export default function BearingGraph({ stationId }) {
  const classes = useStyles();
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
    // <Card className={classes.root}>
    //   <CardActionArea>
    //     <CardMedia
    //       className={classes.media}
    //       image='/images/JinNrc.png'
    //       title='Contemplative Reptile'
    //     />
    //   </CardActionArea>
    // </Card>
    <PlotGraph graphData={graphData} controlData={controlData} />
  );
}
