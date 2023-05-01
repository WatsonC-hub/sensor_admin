import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import moment from 'moment';
import axios from 'axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/pages/field/fieldAPI';
import React, {useEffect, useState, useRef, memo} from 'react';
import {Typography, Alert, Grid} from '@mui/material';
import GraphForms from './GraphForms';
import QAHistory from './QAHistory';
import AnnotationConfiguration from './AnnotationConfiguration';
import {toast} from 'react-toastify';
import {downloadIcon, rerunIcon, rawDataIcon, makeLinkIcon} from 'src/helpers/plotlyIcons';
import {useSetAtom} from 'jotai';
import {qaSelection} from 'src/state/atoms';

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

function PlotGraph({
  graphData,
  reviewData,
  controlData,
  dynamicMeasurement,
  qaData,
  setPreviewData,
  ts_id,
  annotationConfiguration,
  labelMutation,
}) {
  const setSelection = useSetAtom(qaSelection);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [layout, setLayout] = useState(matches ? layout3 : layout1);
  // const selectedDataFix = {
  //   x: [],
  //   y: [],
  // };

  const toastId = useRef(null);

  const queryClient = useQueryClient();

  const eventHandler = (evt) => {
    var bb = evt.target.getBoundingClientRect();
    const gd = document.getElementById('qagraph');
    var x = gd._fullLayout.xaxis.p2d(evt.clientX - bb.left);
    var y = gd._fullLayout.yaxis.p2d(evt.clientY - bb.top);

    const closest = qaData
      ?.map((d, index) => {
        if (d.enddate == null) {
          return [Math.abs(moment(x).diff(moment(d.startdate), 'minutes')), index];
        } else {
          return [
            moment(x).isAfter(moment(d.startdate)) && moment(x).isBefore(moment(d.enddate))
              ? Math.min(
                  Math.abs(moment(x).diff(moment(d.startdate), 'minutes')),
                  Math.abs(moment(x).diff(moment(d.enddate), 'minutes'))
                )
              : false,
            index,
          ];
        }
      })
      .filter((d) => d[0] === true || typeof d[0] === 'number')
      .sort((a, b) => a[0] - b[0]);

    console.log('closest', closest);
    if (closest?.[0]?.[1] != null && annotationConfiguration.active) {
      const data = qaData[closest?.[0]?.[1]];

      labelMutation.mutate([
        {
          algorithm: data.algorithm,
          enddate: data.enddate
            ? moment(data.enddate).format('YYYY-MM-DDTHH:mm:ss')
            : moment(data.startdate).format('YYYY-MM-DDTHH:mm:ss'),
          startdate: moment(data.startdate).format('YYYY-MM-DDTHH:mm:ss'),
          label_id: annotationConfiguration?.label,
        },
      ]);
    }
  };

  // Add event listener for mouse click on plot
  useEffect(() => {
    const plot = document.getElementById('qagraph');
    plot?.addEventListener('mousedown', eventHandler);
    return () => {
      const plot = document.getElementById('qagraph');
      plot?.removeEventListener('mousedown', eventHandler);
    };
  }, [qaData, annotationConfiguration]);

  const handlePlotlySelected = (eventData) => {
    console.log(eventData.points);
    setSelection(eventData.points.map((pt) => pt.x));

    // setSelectedData(eventData.points.map((pt) => [{x: pt.x, y: pt.y}]));
    // const dates = selectedData.map((pt) => moment(pt[0].x));
    // console.log('dates: ', dates);
    // if (dates.length > 0) {
    //   const sortedDates = dates.sort((a, b) => moment(a) - moment(b));

    //   console.log('OLDEST Date', sortedDates[0]);
    //   const oldDate = sortedDates[0];
    //   console.log('NEWEST Date', sortedDates[sortedDates.length - 1]);
    //   const newDate = sortedDates[sortedDates.length - 1];

    //   Object.values(selectedData).forEach((arr) => {
    //     arr.forEach((obj) => {
    //       selectedDataFix.x.push(moment(obj.x).format());
    //       selectedDataFix.y.push(obj.y);
    //     });
    //   });

    //   setPreviewData({oldDate, newDate, selectedDataFix});
    // }
  };

  const xControl = controlData.map((d) => d.timeofmeas);
  const yControl = controlData.map((d) => d.waterlevel);

  const {data: pollData, refetch} = useQuery(
    ['pollData', ts_id],
    async () => {
      const {data, status} = await apiClient.get(`/sensor_field/station/correct/poll/${ts_id}`);
      return status;
    },
    {
      enabled: true,
      refetchInterval: (status) => {
        return status === 204 ? 1000 : false;
      },
      onSuccess: (status) => {
        if (status === 200) {
          queryClient.removeQueries(['graphData', ts_id]);
          toast.update(toastId.current, {
            render: 'Genberegnet',
            type: toast.TYPE.SUCCESS,
            isLoading: false,
            autoClose: 2000,
            closeOnClick: true,
            draggable: true,
            progress: undefined,
            hideProgressBar: false,
          });
        }
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const correctMutation = useMutation(
    async (data) => {
      const {data: res} = await apiClient.post(`/sensor_field/station/correct/${ts_id}`, data);
      return res;
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          refetch();
        }, 5000);
        //handleXRangeChange({'xaxis.range[0]': undefined});
      },
    }
  );

  var rerunButton = {
    name: 'Genkør data',
    icon: rerunIcon,
    click: function (gd) {
      toastId.current = toast.loading('Genberegner...');
      correctMutation.mutate({});
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

  const {shapelist, annotateList} = transformQAData(qaData);

  return (
    <div>
      <Plot
        onSelected={handlePlotlySelected}
        //onRelayout={(e) => console.log('relayout', e)}
        id="qagraph"
        divId="qagraph"
        data={[
          {
            x: reviewData?.x,
            y: reviewData?.y,
            name: 'Preview',
            type: 'scattergl',
            line: {width: 2},
            mode: 'lines+markers',
            marker: {symbol: '100', size: '5', color: '#00FF00'},
          },
          {
            x: graphData?.x,
            y: graphData?.y,
            name: graphData?.name,
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
          {
            x: [dynamicMeasurement?.[0]],
            y: [dynamicMeasurement?.[1]],
            name: '',
            type: 'scatter',
            mode: 'markers',
            showlegend: false,
            marker: {symbol: '50', size: '8', color: 'rgb(0,120,109)'},
          },
        ]}
        layout={{...layout, shapes: shapelist, annotations: annotateList, uirevision: 'true'}}
        config={{
          responsive: true,
          modeBarButtons: [
            [downloadButton, makeLinkButton, rerunButton],
            ['lasso2d', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
          ],

          displaylogo: false,
          displayModeBar: true,
        }}
        useResizeHandler={true}
        style={{width: '100%', height: '100%'}}
      />
    </div>
  );
}

export default function QAGraph({stationId, measurements}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const [annotationConfiguration, setAnnotationConfiguration] = useState({
    active: false,
    label: 1,
    annotateDateRange: true,
  });

  const [reviewData, setReviewData] = useState({x: [], y: []});

  const {data: label_options} = useQuery(['label_options'], async () => {
    const {data} = await apiClient.get(`/sensor_admin/label_options`);
    return data;
  });

  const labelMutation = useMutation(async (data) => {
    const {data: res} = await apiClient.post(`/sensor_admin/qa_labels/${stationId}`, data);
    return res;
  });

  const {data: graphData} = useQuery(
    ['graphData', stationId],
    async ({signal}) => {
      const {data} = await apiClient.get(`/data/timeseries/${stationId}`, {
        signal,
      });
      return data;
    },
    {
      enabled: stationId !== -1 && stationId !== null,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  );

  const [previewData, setPreviewData] = useState({oldDate: moment(), newDate: moment(), data: {}});

  const {
    data: qaData,
    isLoading,
    error,
    refetch,
  } = useQuery(['qa_labels', stationId], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/qa_labels/${stationId}`, {
      signal,
    });
    return data;
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={10} sm={10}>
        <div
          style={{
            width: 'auto',
            height: matches ? '300px' : '500px',
            marginBottom: '10px',
            marginTop: '-10px',
            paddingTop: '5px',
            border: '2px solid gray',
          }}
        >
          <PlotGraph
            key={'plotgraph'}
            graphData={graphData}
            reviewData={reviewData}
            controlData={measurements}
            qaData={qaData}
            setPreviewData={setPreviewData}
            annotationConfiguration={annotationConfiguration}
            ts_id={stationId}
            labelMutation={labelMutation}
          />
        </div>
      </Grid>
      <Grid item xs={2} sm={2}>
        <QAHistory />
        <AnnotationConfiguration
          annotationConfiguration={annotationConfiguration}
          setAnnotationConfiguration={setAnnotationConfiguration}
          label_options={label_options}
          labelMutation={labelMutation}
        />
      </Grid>
      {/* <GraphForms
        graphData={graphData}
        previewData={previewData}
        setPreviewData={setPreviewData}
        reviewData={reviewData}
        setReviewData={setReviewData}
      /> */}
    </Grid>
  );
}
