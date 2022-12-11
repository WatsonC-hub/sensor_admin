import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import {getJupiterWaterlevel} from '../boreholeAPI';
import {useQuery} from '@tanstack/react-query';

const selectorOptions = {
  buttons: [
    {
      step: 'day',
      stepmode: 'backward',
      count: 7,
      label: '1 uge',
    },
    {
      step: 'month',
      stepmode: 'backward',
      count: 1,
      label: '1 måned',
    },
    {
      step: 'year',
      stepmode: 'backward',
      count: 1,
      label: '1 år',
    },
    {
      step: 'all',
      label: 'Alt',
    },
  ],
};

const layout1 = {
  xaxis: {
    rangeselector: selectorOptions,
    /*rangeslider: {},*/
    autorange: true,
    type: 'date',
    //range:["2020-12-01T00:00:00", A],
    //domain: [0, 0.97],
    showline: true,
  },

  //xaxis: {domain: [0, 0.9]},
  yaxis: {
    title: {
      text: '',
      font: {size: 12},
    },
    showline: true,
  },

  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
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
    color: 'rgb(0, 0, 0)',
  },
};

const layout3 = {
  modebar: {
    orientation: 'v',
  },
  //autosize: true,
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: 'date',
    margin: {
      t: 0,
    },
  },

  yaxis: {
    showline: true,
    y: 1,
    title: {
      text: '',
      font: {size: 12},
    },
  },

  showlegend: false,
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
  },
  margin: {
    l: 50,
    r: 30,
    b: 40,
    t: 0,
    pad: 4,
  },
  font: {
    size: 12,
    color: 'rgb(0, 0, 0)',
  },
};

function PlotGraph({jupiterData, ourData, dynamicMeasurement}) {
  const parsed = jupiterData ? JSON.parse(jupiterData.data) : null;
  const xJupiterData = parsed?.x;
  const yJupiterData = parsed?.y;
  const xOurData = ourData.map((d) => d.timeofmeas);
  const yOurData = ourData.map((d) => d.waterlevel);

  const [xDynamicMeasurement, setXDynamicMeasurement] = useState([]);
  const [yDynamicMeasurement, setYDynamicMeasurement] = useState([]);

  useEffect(() => {
    //console.log(dynamicMeasurement);
    if (dynamicMeasurement !== undefined) {
      setXDynamicMeasurement([dynamicMeasurement[0]]);
      setYDynamicMeasurement([dynamicMeasurement[1]]);
    } else {
      setXDynamicMeasurement([]);
      setYDynamicMeasurement([]);
    }
  }, [dynamicMeasurement]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Plot
      data={[
        {
          x: xJupiterData,
          y: yJupiterData,
          name: 'Jupiter data',
          type: 'scatter',
          line: {width: 2},
          mode: 'lines+markers',
          marker: {symbol: '100', size: '8', color: '#177FC1'},
        },
        {
          x: xOurData,
          y: yOurData,
          name: 'Calypso data',
          type: 'scatter',
          mode: 'markers',
          marker: {symbol: '50', size: '8', color: 'rgb(0,120,109)'},
        },
        {
          x: xDynamicMeasurement,
          y: yDynamicMeasurement,
          name: '',
          type: 'scatter',
          mode: 'markers',
          showlegend: false,
          marker: {symbol: '50', size: '8', color: 'rgb(0,120,109)'},
        },
      ]}
      layout={
        matches
          ? {
              ...layout3,
              yaxis: {
                ...layout3.yaxis,
                // title: "Vandstand",
              },
            }
          : {
              ...layout1,
              yaxis: {
                ...layout1.yaxis,
                title: 'Vandstand',
              },
            }
      }
      config={{
        responsive: true,
        modeBarButtonsToRemove: [
          'select2d',
          'lasso2d',
          'autoScale2d',
          'hoverCompareCartesian',
          'hoverClosestCartesian',
          'toggleSpikelines',
        ],
        displaylogo: false,
        displayModeBar: true,
      }}
      useResizeHandler={true}
      style={{width: '99%', height: '100%'}}
    />
  );
}

export default function BearingGraph({boreholeno, intakeno, measurements, dynamicMeasurement}) {
  const [jupiterData, setJupiterData] = useState([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  // useEffect(() => {
  //   if (boreholeno !== -1 && boreholeno !== null && intakeno !== undefined && intakeno !== -1) {
  //     getJupiterWaterlevel(boreholeno, intakeno).then((res) => {
  //       if (res.data.success) {
  //         setJupiterData(res.data.features.map((elem) => elem.properties));
  //       }
  //     });
  //   }
  // }, [boreholeno, intakeno]);

  const {data} = useQuery(
    ['jupiter_waterlevel', boreholeno, intakeno],
    () => getJupiterWaterlevel(boreholeno, intakeno),
    {
      enabled: boreholeno !== -1 && boreholeno !== null && intakeno !== undefined,
      select: (data) => {
        return data[0].properties;
      },
    }
  );

  return (
    <div
      style={{
        width: 'auto',
        height: matches ? '300px' : '500px',
        marginBottom: '10px',
        paddingTop: '5px',
        marginLeft: matches ? '' : '50px',
        marginRight: matches ? '' : '50px',
        marginTop: matches ? '' : '10px',
        border: '2px solid gray',
      }}
    >
      <PlotGraph
        jupiterData={data}
        ourData={measurements}
        dynamicMeasurement={dynamicMeasurement}
      />
    </div>
  );
}
