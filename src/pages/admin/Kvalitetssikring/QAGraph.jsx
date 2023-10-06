import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import moment from 'moment';
import axios from 'axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import React, {useEffect, useState, useContext} from 'react';
import {Typography, Alert, Grid, Button, Box} from '@mui/material';
import AnnotationConfiguration from './AnnotationConfiguration';
import {toast} from 'react-toastify';
import {
  downloadIcon,
  rerunIcon,
  rawDataIcon,
  makeLinkIcon,
  rerunQAIcon,
} from 'src/helpers/plotlyIcons';
import {useSetAtom, useAtom} from 'jotai';
import {useCorrectData} from 'src/hooks/useCorrectData';
import {qaSelection} from 'src/state/atoms';
import {useRunQA} from 'src/hooks/useRunQA';
import GraphActions from './GraphActions';
import {MetadataContext} from 'src/state/contexts';
import {useRerunData} from 'src/hooks/query/useRerunData';

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

function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ';';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  var csvFile = '';
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
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

  var annotateList = data?.map((d) => {
    if (d.enddate == null) {
      return {
        xref: 'x',
        yref: 'paper',
        x: d.startdate,
        xanchor: 'left',
        yanchor: 'bottom',
        showarrow: false,
        text: d.name,
        y: 0.5,
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
        y: 0.5,
      };
    }
  });

  return {shapelist, annotateList};
};

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

function PlotGraph({controlData, qaData, ts_id}) {
  const setSelection = useSetAtom(qaSelection);
  const [xRange, setXRange] = useState(initRange);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [layout, setLayout] = useState(matches ? layout3 : layout1);
  const metadata = useContext(MetadataContext);

  const {data: rerun} = useRerunData();

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
    console.log('relayout', e);
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
    }
  };

  const {data: graphData, refetch: refetchData} = useQuery(
    ['graphData', ts_id, xRange],
    async ({signal}) => {
      const {data} = await apiClient.get(`/data/timeseriesV2/${ts_id}`, {
        params: {
          start: xRange[0],
          stop: xRange[1],
          limit: 4000,
        },
      });
      if (data === null) {
        return [];
      }
      return data;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  );

  const xControl = controlData.map((d) => d.timeofmeas);
  const yControl = controlData.map((d) => d.waterlevel);

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

  var downloadButton = {
    name: 'Download data',
    icon: downloadIcon,
    click: function (gd) {
      console.log(gd.data);
      var rows = gd.data[0].x.map((elem, idx) => [
        moment(elem).format('YYYY-MM-DD HH:mm'),
        gd.data[0].y[idx].toString().replace('.', ','),
      ]);

      exportToCsv('data.csv', rows);
    },
  };

  var makeLinkButton = {
    name: 'Ekstern link',
    icon: makeLinkIcon,
    click: function (gd) {
      var ts_id = window.location.href.split('/').at(-1);

      var link = document.createElement('a');
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url =
          'https://watsonc.dk/calypso/timeseries_plot.html?&ts_id=' + ts_id + '&pejling=true';
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // exportToCsv("data.csv", rows);
    },
  };

  const {shapelist: qaShapes, annotateList: qaAnnotate} = transformQAData(qaData);

  const rerunShapes = rerun?.levelcorrection?.map((d) => {
    return {
      type: 'line',
      x0: d.date,
      x1: d.date,
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

  return (
    <Plot
      // onSelecting={handlePlotlySelected}
      onSelected={handlePlotlySelected}
      // onRelayout={(e) => console.log('relayout', e)}
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
          mode: 'lines+markers',
          marker: {symbol: '100', size: '5', color: '#177FC1'},
        },
        {
          x: xControl,
          y: yControl,
          name: 'Kontrolpejlinger',
          type: 'scatter',
          mode: 'markers',
          marker: {
            symbol: '200',
            size: '8',
            color: '#177FC1',
            line: {color: 'rgb(0,0,0)', width: 1},
          },
        },
      ]}
      layout={{
        ...layout,
        shapes: rerunShapes,
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
