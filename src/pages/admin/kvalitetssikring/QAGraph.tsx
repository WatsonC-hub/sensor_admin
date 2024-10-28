import {useTheme} from '@mui/material/styles';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue, useSetAtom} from 'jotai';
import moment from 'moment';
import {Layout} from 'plotly.js';
import React, {useContext, useEffect, useMemo, useState} from 'react';

import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {useCertifyQa} from '~/features/kvalitetssikring/api/useCertifyQa';
import {useAdjustmentData} from '~/hooks/query/useAdjustmentData';
import {useControlData} from '~/hooks/query/useControlData';
import {useGraphData} from '~/hooks/query/useGraphData';
import useBreakpoints from '~/hooks/useBreakpoints';
import {APIError} from '~/queryClient';
import {dataToShowAtom, qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';
import {QaGraphLabel} from '~/types';

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

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

interface PlotGraphProps {
  ts_id: number;
  initiateSelect: boolean;
  setInitiateSelect: (select: boolean) => void;
  levelCorrection: boolean;
  initiateConfirmTimeseries: boolean;
}

export default function PlotGraph({
  ts_id,
  initiateSelect,
  setInitiateSelect,
  levelCorrection,
  initiateConfirmTimeseries,
}: PlotGraphProps) {
  const setSelection = useSetAtom(qaSelection);
  const [xRange, setXRange] = useState(initRange);
  const metadata = useContext(MetadataContext);
  const dataToShow = useAtomValue(dataToShowAtom);
  const theme = useTheme();
  const loc_name = metadata?.loc_name;
  const ts_name = metadata?.ts_name;

  const {isTouch} = useBreakpoints();

  const {data: adjustmentData} = useAdjustmentData(ts_id);
  const {data: controlData} = useControlData(ts_id);

  const {data: edgeDates} = useQuery<{firstDate: string; lastDate: string} | null, APIError>({
    queryKey: ['all_range', metadata?.ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<{firstDate: string; lastDate: string} | null>(
        `/sensor_field/station/graph_all_range/${metadata?.ts_id}`
      );

      return data;
    },
    staleTime: 10,
    enabled: metadata?.ts_id !== undefined && metadata?.ts_id !== null && metadata?.ts_id !== -1,
  });
  const {data: graphData} = useGraphData(ts_id, xRange);
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

  const handlePlotlySelected = (eventData: any) => {
    if (eventData === undefined) {
      return;
    } else {
      eventData.points = eventData?.points?.map((pt: any) => {
        return {x: pt.x, y: pt.y};
      });
      if (
        graphData &&
        levelCorrection &&
        eventData.points.length > 0 &&
        eventData.points.length === 1
      ) {
        const prevIndex =
          graphData.x
            .map((x) => moment(x).toISOString())
            .indexOf(moment(eventData.points[0].x).toISOString()) - 1;
        const prevDate = graphData.x.at(prevIndex);
        const prevValue = graphData.y.at(prevIndex);

        eventData.points = [{x: prevDate, y: prevValue}, ...eventData.points];
      }
      setSelection(eventData);
    }
  };

  useEffect(() => {
    return () => {
      setSelection({});
    };
  }, []);

  const handleRelayout = (e: any) => {
    if (e['selections'] && e['selections'].length === 0) {
      console.log(e);
      setSelection({});
    }

    if (e['dragmode'] === 'zoom') {
      setInitiateSelect(false);
    } else if (e['dragmode'] === 'select') {
      setInitiateSelect(true);
    }
  };

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
                    text: 'Maksimal værdi',
                    y: adjustmentData?.min_max_cutoff?.mincutoff,
                  },
                  {
                    xref: 'paper',
                    yref: 'y',
                    x: 0,
                    xanchor: 'left',
                    yanchor: 'bottom',
                    showarrow: false,
                    text: 'Minimal værdi',
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
        case 'QA':
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

  const layout: Partial<Layout> = {
    yaxis2: {
      title: {
        text: 'Nedbør [mm]',
        font: {size: 12},
      },
      showline: false,
      showgrid: false,
    },
  };

  return (
    <div
      style={{
        height: setGraphHeight(isTouch),
      }}
    >
      <PlotlyGraph
        plotEventProps={{
          onSelected: handlePlotlySelected,
          onRelayout: handleRelayout,
          onClick: (e) => {
            if (initiateConfirmTimeseries || levelCorrection) {
              setSelection({points: e.points});
            }
          },
        }}
        initiateSelect={initiateSelect}
        shapes={shapes}
        annotations={annotations}
        layout={layout}
        plotModebarButtons={['rerun', 'rerunQa', 'select2d']}
        data={data}
        setXRange={setXRange}
      />
    </div>
  );
}
