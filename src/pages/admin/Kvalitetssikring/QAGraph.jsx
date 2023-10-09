import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {useSetAtom} from 'jotai';
import moment from 'moment';
import React, {useContext, useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import {apiClient} from 'src/apiClient';
import {rerunIcon, rerunQAIcon} from 'src/helpers/plotlyIcons';
import {useAdjustmentData} from 'src/hooks/query/useAdjustmentData';
import {useControlData} from 'src/hooks/query/useControlData';
import {useGraphData} from 'src/hooks/query/useGraphData';
import {useCorrectData} from 'src/hooks/useCorrectData';
import {useRunQA} from 'src/hooks/useRunQA';
import {qaSelection} from 'src/state/atoms';
import {MetadataContext} from 'src/state/contexts';
import GraphActions from './GraphActions';

const selectorOptions = {
  buttons: [
    {
      step: 'day',
      stepmode: 'backward',
      count: 7,
      label: '1 uge',
    },
    {
      step: 'year',
      stepmode: 'backward',
      count: 1,
      label: '1 år',
    },
    {
      step: 'month',
      stepmode: 'backward',
      count: 1,
      label: '1 måned',
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
    autorange: false,
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
    autorange: false,
    showline: true,
    y: 1,
    title: {
      text: '',
      font: {size: 12},
    },
  },

  showlegend: true,
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

const LABEL_COLORS = {
  null: '#666666',
  1: '#00FF00',
  2: '#0000FF',
  3: '#FF0000',
};

const transformQAData = (data) => {
  var shapelist = data?.map((d) => {
    if (d.enddate == null) {
      return {
        type: 'line',
        x0: d.startdate,
        x1: d.startdate,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: LABEL_COLORS[d.label_id],
          width: 1.5,
          dash: 'dot',
        },
      };
    } else {
      return {
        type: 'rect',
        xref: 'x',
        x0: d.startdate,
        x1: d.enddate,
        y0: 0,
        y1: 1,
        yref: 'paper',
        fillcolor: LABEL_COLORS[d.label_id],
        opacity: 0.6,
        line: {
          width: 0,
        },
        layer: 'below',
      };
    }
  });

  var annotateList = data
    ?.sort((a, b) => moment(a.startdate) - moment(b.startdate))
    .map((d, index) => {
      let y;
      switch (index % 4) {
        case 0:
          y = 0.3;
          break;
        case 1:
          y = 0.4;
          break;
        case 2:
          y = 0.5;
          break;
        case 3:
          y = 0.6;
          break;
      }

      if (d.enddate == null) {
        return {
          xref: 'x',
          yref: 'paper',
          x: d.startdate,
          xanchor: 'left',
          yanchor: 'bottom',
          showarrow: false,
          text: d.name,
          y: y,
        };
      } else {
        return {
          xref: 'x',
          yref: 'paper',
          x: d.startdate,
          xanchor: 'left',
          yanchor: 'bottom',
          showarrow: false,
          text: d.name,
          y: y,
        };
      }
    });

  return [shapelist, annotateList];
};

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

function PlotGraph({qaData, ts_id}) {
  const setSelection = useSetAtom(qaSelection);
  const [xRange, setXRange] = useState(initRange);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [layout, setLayout] = useState(matches ? layout3 : layout1);
  const metadata = useContext(MetadataContext);

  const {data: adjustmentData} = useAdjustmentData();

  const {data: controlData} = useControlData();

  const handlePlotlySelected = (eventData) => {
    if (eventData === undefined) {
      return;
    } else {
      eventData.points = eventData?.points?.map((pt) => {
        return {x: pt.x, y: pt.y};
      });
      setSelection(eventData);
    }
  };

  useEffect(() => {
    return () => {
      setSelection({});
    };
  }, []);

  const handleRelayout = (e) => {
    if (e['xaxis.autorange'] == true || e['autosize'] == true) {
      setXRange(initRange);
      return;
    }

    if (e['selections'] && e['selections'].length === 0) {
      setSelection({});
    }

    if (e['dragmode']) {
      setLayout((prev) => {
        return {
          ...prev,
          dragmode: e['dragmode'],
        };
      });
    }

    if (e['xaxis.range[0]'] !== undefined) {
      let x0 = moment(e['xaxis.range[0]']);
      let x1 = moment(e['xaxis.range[1]']);

      const daysdiff = x1.diff(x0, 'days');

      x0 = x0.subtract(daysdiff * 0.2, 'days');
      x1 = x1.add(daysdiff * 0.2, 'days');

      setXRange([x0.format('YYYY-MM-DDTHH:mm'), x1.format('YYYY-MM-DDTHH:mm')]);
      return;
    }
  };

  const {data: graphData} = useGraphData(ts_id, xRange);

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.measurement);
  const textControl = controlData?.map((d) => {
    switch (d.useforcorrection) {
      case 0:
        return 'Kontrol';
      case 1:
        return 'Korrektion fremadrettet';
      case 2:
        return 'Korrektion fremadrettet og bagudrettet';
      case 3:
        return 'Korrektion lineært til forrige pejling';
      case 4:
        return 'Korrektion tilbage til unit';
      case 5:
        return 'Korrektion tilbage til forrige niveaukorrektion';
      case 6:
        return 'Korrektion tilbage til forrige pejling';
      default:
        return 'Korrektion';
    }
  });

  const {mutation: correctMutation} = useCorrectData(ts_id, 'graphData');

  const {mutation: rerunQAMutation} = useRunQA(ts_id);

  var rerunButton = {
    name: 'Genberegn data',
    icon: rerunIcon,
    click: function (gd) {
      correctMutation.mutate({});
    },
  };

  var rerunQAButton = {
    name: 'Genberegn QA',
    icon: rerunQAIcon,
    click: function (gd) {
      // toastId.current = toast.loading('Genkører kvalitetssikring...');
      rerunQAMutation.mutate({});
    },
  };

  const [qaShapes, qaAnnotate] = transformQAData(qaData);

  const levelCorrectionShapes = adjustmentData?.levelcorrection?.map((d) => {
    return {
      type: 'line',
      x0: moment(d.date).format('YYYY-MM-DD HH:mm'),
      x1: moment(d.date).format('YYYY-MM-DD HH:mm'),
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: {
        color: '#FF0000',
        width: 1.5,
        dash: 'dot',
      },
    };
  });

  const shapes = [...(qaShapes ?? []), ...(levelCorrectionShapes ?? [])];

  return (
    <Plot
      onSelected={handlePlotlySelected}
      id="qagraph"
      divId="qagraph"
      onRelayout={handleRelayout}
      data={[
        {
          x: graphData?.x,
          y: graphData?.y,
          name: metadata?.loc_name + ' ' + metadata?.ts_name,
          type: 'scattergl',
          line: {width: 2},
          mode: 'lines',
          marker: {symbol: '100', size: '3', color: '#177FC1'},
        },
        {
          x: xControl,
          y: yControl,
          name: 'Kontrolpejlinger',
          type: 'scattergl',
          mode: 'markers',
          text: textControl,
          marker: {
            symbol: '200',
            size: '8',
            color: '#177FC1',
            line: {color: 'rgb(0,0,0)', width: 1},
          },
        },
        {
          ...levelCorrectionShapes?.[0],
        },
      ]}
      layout={{
        ...layout,
        shapes: shapes,
        annotations: qaAnnotate,
        uirevision: 'true',
        yaxis: {
          title: `${metadata?.tstype_name} [${metadata?.unit}]`,
          font: {size: matches ? 6 : 12},
        },
      }}
      config={{
        responsive: true,
        modeBarButtons: [
          [rerunQAButton, rerunButton],
          ['select2d', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
        ],

        displaylogo: false,
        displayModeBar: true,
      }}
      useResizeHandler={true}
      style={{width: '100%', height: '100%'}}
    />
  );
}

export default function QAGraph({stationId, measurements}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  // const {data: graphData} = useQuery(
  //   ['graphData', stationId],
  //   async ({signal}) => {
  //     const {data} = await apiClient.get(`/data/timeseries/${stationId}`, {
  //       signal,
  //     });
  //     return data;
  //   },
  //   {
  //     enabled: stationId !== -1 && stationId !== null,
  //     refetchOnWindowFocus: false,
  //     refetchOnMount: false,
  //     refetchOnReconnect: false,
  //     refetchInterval: false,
  //   }
  // );

  const {data: qaData} = useQuery(['qa_labels', stationId], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/qa_labels/${stationId}`, {
      signal,
    });
    return data;
  });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <div
        style={{
          width: 'auto',
          height: matches ? '300px' : '500px',
          // marginBottom: '10px',
          // marginTop: '-10px',
          paddingTop: '5px',
          border: '2px solid gray',
        }}
      >
        <PlotGraph
          key={'plotgraph' + stationId}
          // graphData={graphData}
          controlData={measurements}
          qaData={qaData}
          ts_id={stationId}
        />
      </div>
      <GraphActions />
    </Box>
  );
}
