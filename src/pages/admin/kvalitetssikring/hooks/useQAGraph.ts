import {useTheme} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useMemo} from 'react';

import {apiClient} from '~/apiClient';
import {useCertifyQa} from '~/features/kvalitetssikring/api/useCertifyQa';
import {useAdjustmentData} from '~/hooks/query/useAdjustmentData';
import {useControlData} from '~/hooks/query/useControlData';
import {useEdgeDates} from '~/hooks/query/useEdgeDates';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {dataToShowAtom} from '~/state/atoms';
import {QaGraphLabel} from '~/types';

const useQAGraph = (ts_id: number, xRange: Array<string>) => {
  const {data: timeseries_data} = useTimeseriesData();
  const dataToShow = useAtomValue(dataToShowAtom);
  const theme = useTheme();
  const loc_name = timeseries_data?.loc_name;
  const ts_name = timeseries_data?.ts_name;
  const {data: adjustmentData} = useAdjustmentData(ts_id);
  const {data: controlData} = useControlData(ts_id);

  const {
    get: {data: certify},
  } = useCertifyQa(ts_id);

  const {data: graphData} = useGraphData(ts_id, xRange);
  const {data: edgeDates} = useEdgeDates(ts_id);
  const {
    get: {data: certifedData},
  } = useCertifyQa(ts_id);

  const {data: qaData} = useQuery({
    queryKey: ['qa_labels', ts_id],
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get<Array<QaGraphLabel>>(`/sensor_admin/qa_labels/${ts_id}`, {
        signal,
      });
      return data;
    },
  });

  const {data: removed_data} = useQuery({
    queryKey: ['removed_data', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/removed_data/${ts_id}`);
      return data;
    },
    enabled: dataToShow['Fjernet data'],
    refetchOnWindowFocus: false,
  });

  const {data: precipitation_data} = useQuery({
    queryKey: ['precipitation_data', ts_id],
    queryFn: async () => {
      const starttime = moment(edgeDates?.firstDate).format('YYYY-MM-DDTHH:mm');
      const stoptime = moment(edgeDates?.lastDate).format('YYYY-MM-DDTHH:mm');
      const {data} = await apiClient.get(
        `/data/timeseries/${ts_id}/precipitation/1?start=${starttime}&stop=${stoptime}`
      );
      return data;
    },
    enabled: dataToShow['Nedbør'] && edgeDates !== undefined,
    refetchOnWindowFocus: false,
  });
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

  const [shapes, annotations] = useMemo(() => {
    const [qaShapes, qaAnnotate] = transformQAData(qaData ?? []);
    let shapes: Array<object> = [];
    let annotations: Array<object> = [];

    Object.entries(dataToShow).forEach((entry) => {
      if (entry[1] == false) return;
      switch (entry[0]) {
        case 'Godkendt':
          shapes = [
            ...shapes,
            ...(certify?.map((d) => {
              return {
                type: 'rect',
                x0: edgeDates?.firstDate,
                x1: moment(d.date).format('YYYY-MM-DD HH:mm'),
                y0: 0,
                y1: 1,
                yref: 'paper',
                fillcolor: '#4caf50',
                opacity: 0.2,
                line: {
                  width: 0,
                },
                layer: 'below',
              };
            }) ?? []),
          ];
          annotations = [
            ...annotations,
            ...(certify?.map((d) => {
              return {
                xref: 'x',
                yref: 'paper',
                x: moment(d.date).format('YYYY-MM-DD HH:mm'),
                xanchor: 'right',
                yanchor: 'bottom',
                showarrow: false,
                text: 'Godkendt',
                y: 0.9,
              };
            }) ?? []),
          ];
          break;
        case 'Valide værdier':
          shapes = [
            ...shapes,
            ...(adjustmentData?.min_max_cutoff
              ? [
                  {
                    type: 'line',
                    x0: 0,
                    x1: 1,
                    y0: adjustmentData?.min_max_cutoff?.mincutoff,
                    y1: adjustmentData?.min_max_cutoff?.mincutoff,
                    xref: 'paper',
                    line: {
                      color: theme.palette.success.main,
                      width: 1.5,
                    },
                  },
                  {
                    type: 'line',
                    x0: 0,
                    x1: 1,
                    y0: adjustmentData?.min_max_cutoff?.maxcutoff,
                    y1: adjustmentData?.min_max_cutoff?.maxcutoff,
                    xref: 'paper',
                    line: {
                      color: theme.palette.success.main,
                      width: 1.5,
                    },
                  },
                ]
              : []),
          ];
          annotations = [
            ...annotations,
            ...(adjustmentData?.min_max_cutoff
              ? [
                  {
                    xref: 'paper',
                    yref: 'y',
                    x: 0,
                    xanchor: 'left',
                    yanchor: 'bottom',
                    showarrow: false,
                    text: 'Minimal værdi',
                    y: adjustmentData?.min_max_cutoff?.mincutoff,
                  },
                  {
                    xref: 'paper',
                    yref: 'y',
                    x: 0,
                    xanchor: 'left',
                    yanchor: 'bottom',
                    showarrow: false,
                    text: 'Maksimal værdi',
                    y: adjustmentData?.min_max_cutoff?.maxcutoff,
                  },
                ]
              : []),
          ];
          break;
        case 'Korrigerede spring':
          shapes = [
            ...shapes,
            ...(adjustmentData?.levelcorrection?.map((d) => {
              return {
                type: 'line',
                x0: moment(d.date).format('YYYY-MM-DD HH:mm'),
                x1: moment(d.date).format('YYYY-MM-DD HH:mm'),
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                  color: theme.palette.error.main,
                  width: 1.5,
                },
              };
            }) ?? []),
          ];
          annotations = [
            ...annotations,
            ...(adjustmentData?.levelcorrection?.map((d, index) => {
              return {
                xref: 'x',
                yref: 'paper',
                x: moment(d.date).format('YYYY-MM-DD HH:mm'),
                xanchor: 'left',
                yanchor: 'bottom',
                showarrow: false,
                text: 'Korrigeret spring',
                y: 0.3 + (index % 4) * 0.1,
              };
            }) ?? []),
          ];
          break;
        case 'Kvalitets stempel':
          shapes = [
            ...shapes,
            ...(certifedData?.map((data) => {
              return {
                type: 'line',
                x0: moment(data.date).format('YYYY-MM-DD HH:mm'),
                x1: moment(data.date).format('YYYY-MM-DD HH:mm'),
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                  color: theme.palette.error.main,
                  width: 1.5,
                },
              };
            }) ?? []),
          ];
          break;
        case 'Algoritmer':
          shapes = [...shapes, ...(qaShapes ?? [])];
          annotations = [...annotations, ...(qaAnnotate ?? [])];
          break;
        default:
          break;
      }
    });

    return [shapes, annotations];
  }, [dataToShow, adjustmentData, certifedData, qaData]);

  const data = [
    {
      x: graphData?.x,
      y: graphData?.y,
      name: loc_name + ' ' + ts_name,
      type: 'scattergl',
      line: {width: 2},
      mode: 'lines+markers',
      marker: {symbol: '100', size: '3', color: '#177FC1'},
    },
    ...(dataToShow?.Kontrolmålinger
      ? [
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
        ]
      : []),
    ...(dataToShow?.['Fjernet data']
      ? [
          {
            x: removed_data?.timeofmeas,
            y: removed_data?.measurement,
            text: removed_data?.label,
            name: 'Fjernet data',
            type: 'scattergl',
            line: {width: 2},
            mode: 'markers',
            marker: {symbol: '100', size: '3', color: theme.palette.error.main},
          },
        ]
      : []),
    ...(dataToShow?.['Nedbør']
      ? [
          {
            ...precipitation_data?.trace,
            ...precipitation_data?.data,
            yaxis: 'y2',
          },
        ]
      : []),
  ];

  return {data, graphData, shapes, annotations};
};

const LABEL_COLORS: Record<number, string> = {
  0: '#666666',
  1: '#00FF00',
  2: '#0000FF',
  3: '#FF0000',
};

const transformQAData = (data: Array<QaGraphLabel>) => {
  const shapelist = data.map((d) => {
    if (d.enddate == null) {
      return {
        type: 'line',
        x0: d.startdate,
        x1: d.startdate,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: LABEL_COLORS[d.label_id ?? 0],
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
        fillcolor: LABEL_COLORS[d.label_id ?? 0],
        opacity: 0.6,
        line: {
          width: 0,
        },
        layer: 'below',
      };
    }
  });

  const annotateList = data
    ?.sort((a, b) => moment(a.startdate).diff(moment(b.startdate)))
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

export default useQAGraph;
