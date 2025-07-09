import {Box, useTheme} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';

import {Layout} from 'plotly.js';
import React, {useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {
  correction_map,
  setGraphHeight,
  defaultDataToShow as globalDefaultDataToShow,
} from '~/consts';
import {useCertifyQa} from '~/features/kvalitetssikring/api/useCertifyQa';
import {usePejling} from '~/features/pejling/api/usePejling';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useAdjustmentData} from '~/hooks/query/useAdjustmentData';
import {useEdgeDates} from '~/hooks/query/useEdgeDates';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {
  dataToShowAtom,
  initiateConfirmTimeseriesAtom,
  initiateSelectAtom,
  levelCorrectionAtom,
  qaSelection,
} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';
import {DataToShow, HorizontalLine, QaGraphLabel} from '~/types';

interface GraphManagerProps {
  dynamicMeasurement?: Array<string | number>;
  defaultDataToShow?: Partial<DataToShow>;
}

const initRange = [
  dayjs('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  dayjs().format('YYYY-MM-DDTHH:mm'),
];

const GraphManager = ({dynamicMeasurement, defaultDataToShow}: GraphManagerProps) => {
  const {ts_id} = useAppContext(['ts_id']);

  const setSelection = useSetAtom(qaSelection);
  const [initiateSelect, setInitiateSelect] = useAtom(initiateSelectAtom);
  const levelCorrection = useAtomValue(levelCorrectionAtom);
  const initiateConfirmTimeseries = useAtomValue(initiateConfirmTimeseriesAtom);
  const [pagetoShow] = useStationPages();
  const {data: timeseries_data} = useTimeseriesData();
  const loc_name = timeseries_data?.loc_name;
  const ts_name = timeseries_data?.ts_name;
  const {isMobile} = useBreakpoints();
  const dataToShowSelected = useAtomValue(dataToShowAtom);
  const [xRange, setXRange] = useState(initRange);
  const {data: graphData} = useGraphData(ts_id, xRange);
  const {data: edgeDates} = useEdgeDates(ts_id);
  const theme = useTheme();

  const layout: Partial<Layout> = {
    yaxis3: {
      visible: false,
    },
  };

  const dataToShow: DataToShow = {
    ...globalDefaultDataToShow,
    ...defaultDataToShow,
    ...dataToShowSelected,
  };

  const {
    get: {data: certifedData},
  } = useCertifyQa();
  const {
    get: {data: controlData},
  } = usePejling();

  const {data: adjustmentData} = useAdjustmentData(ts_id);

  const {data: qaData} = useQuery({
    queryKey: queryKeys.Timeseries.qaLabels(ts_id),
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get<Array<QaGraphLabel>>(`/sensor_admin/qa_labels/${ts_id}`, {
        signal,
      });
      return data;
    },
    enabled: dataToShow['Algoritmer'] && !timeseries_data?.calculated,
  });

  const {data: removed_data} = useQuery({
    queryKey: queryKeys.Timeseries.removedData(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/removed_data/${ts_id}`);
      return data;
    },
    enabled: dataToShow['Fjernet data'] && !timeseries_data?.calculated,
    refetchOnWindowFocus: false,
  });

  const {data: precipitation_data} = useQuery({
    queryKey: queryKeys.Timeseries.precipitationData(ts_id),
    queryFn: async () => {
      const starttime = dayjs(edgeDates?.firstDate);
      const stoptime = dayjs(edgeDates?.lastDate);
      const {data} = await apiClient.get(
        `/data/timeseries/${ts_id}/precipitation/1?start=${starttime}&stop=${stoptime}`
      );
      return data;
    },
    enabled: dataToShow['Nedbør'] && edgeDates !== undefined,
    refetchOnWindowFocus: false,
  });

  const {data: lines_data} = useQuery({
    queryKey: queryKeys.Timeseries.linesData(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<HorizontalLine[]>(`/data/timeseries/${ts_id}/lines`);
      return data;
    },
    select: (data) => data.filter((elem) => elem.tstype_id === timeseries_data?.tstype_id),
    enabled: dataToShow['Horisontale linjer'],
  });

  const {data: rawData} = useQuery({
    queryKey: queryKeys.Timeseries.rawData(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/rawdata/${ts_id}`);
      if (data === null) {
        return [];
      }
      return data;
    },
    enabled: dataToShow.Rådata && !timeseries_data?.calculated,
    placeholderData: [],
  });

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.referenced_measurement);
  const textControl = controlData?.map((d) => correction_map[d.useforcorrection]);

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
            ...(certifedData?.map((d) => {
              return {
                type: 'rect',
                x0: edgeDates?.firstDate,
                x1: dayjs(d.date),
                y0: 0,
                y1: 1,
                yref: 'paper',
                fillcolor: '#4caf50',
                opacity: 0.2,
                line: {
                  width: 0,
                },
              };
            }) ?? []),
          ];
          annotations = [
            ...annotations,
            ...(certifedData?.map((d) => {
              return {
                xref: 'x',
                yref: 'paper',
                x: dayjs(d.date),
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
                x0: dayjs(d.date).format('YYYY-MM-DDTHH:mm'),
                x1: dayjs(d.date).format('YYYY-MM-DDTHH:mm'),
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
                x: dayjs(d.date).format('YYYY-MM-DDTHH:mm'),
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
                x0: dayjs(data.date).format('YYYY-MM-DDTHH:mm'),
                x1: dayjs(data.date).format('YYYY-MM-DDTHH:mm'),
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

        case 'Horisontale linjer':
          shapes = [
            ...shapes,
            ...(lines_data?.map((elem) => {
              return {
                x0: 0,
                x1: 0.97,
                y0: elem.level,
                y1: elem.level,
                name: elem.name,
                type: 'scatter',
                xref: 'paper',
                line: elem.line ?? {width: 1, dash: 'dash'},
                mode: elem.mode ?? 'lines',
                // yaxis: 'y',
              };
            }) ?? []),
          ];
          annotations = [
            ...annotations,
            ...(lines_data?.map((elem) => {
              return {
                xref: 'paper',
                yref: 'y',
                x: 0,
                xanchor: 'left',
                yanchor: 'bottom',
                showarrow: false,
                text: elem.name,
                y: elem.level,
              };
            }) ?? []),
          ];
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

    ...(dataToShow?.Rådata && !timeseries_data?.calculated
      ? [
          {
            x: rawData?.x,
            y: rawData?.y,
            name: 'Rådata',
            type: 'scattergl',
            yaxis: 'y3',
            line: {width: 2},
            mode: 'lines',
            marker: {symbol: '100', size: 3},
          },
        ]
      : []),
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
    {
      x: dynamicMeasurement ? [dynamicMeasurement?.[0]] : [],
      y: dynamicMeasurement ? [dynamicMeasurement?.[1]] : [],
      name: '',
      uid: 'dynamic',
      type: 'scatter',
      mode: 'markers',
      showlegend: false,
      marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
    },
  ];

  useEffect(() => {
    if (dynamicMeasurement?.[0] != undefined && dynamicMeasurement?.[0] !== null) {
      setXRange([
        dayjs(dynamicMeasurement?.[0], 'DD.MM.YYYY HH:mm')
          .subtract(4, 'day')
          .format('YYYY-MM-DDTHH:mm'),
        dayjs(dynamicMeasurement?.[0], 'DD.MM.YYYY HH:mm').add(3, 'day').format('YYYY-MM-DDTHH:mm'),
      ]);
    }
  }, [dynamicMeasurement?.[0]]);

  if (pagetoShow === 'justeringer') {
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
              .map((x) => dayjs(x).toISOString())
              .indexOf(dayjs(eventData.points[0].x).toISOString()) - 1;
          const prevDate = graphData.x.at(prevIndex);
          const prevValue = graphData.y.at(prevIndex);

          eventData.points = [{x: prevDate, y: prevValue}, ...eventData.points];
        }
        setSelection(eventData);
        if (eventData.points && eventData.points.length > 0) toast.dismiss('juster');
      }
    };

    const handleRelayout = (e: any) => {
      if (e['selections'] && e['selections'].length === 0) {
        setSelection({});
      }

      if (e['dragmode'] === 'zoom') {
        setInitiateSelect(false);
      } else if (e['dragmode'] === 'select') {
        setInitiateSelect(true);
      }
    };

    return (
      <Box
        style={{
          height: setGraphHeight(isMobile),
        }}
        my={1}
      >
        <PlotlyGraph
          plotEventProps={{
            onSelected: handlePlotlySelected,
            onRelayout: handleRelayout,
            onClick: (e) => {
              if (
                (initiateConfirmTimeseries || levelCorrection) &&
                e.points[0].data.mode !== 'markers'
              ) {
                setSelection({points: e.points});
                if (e.points && e.points.length > 0) toast.dismiss('juster');
              }
            },
          }}
          initiateSelect={initiateSelect}
          data={data}
          shapes={shapes}
          annotations={annotations}
          layout={layout}
          xRange={xRange}
          setXRange={setXRange}
          dataToShow={dataToShow}
        />
      </Box>
    );
  }

  return (
    <Box
      style={{
        height: setGraphHeight(isMobile),
      }}
      my={1}
    >
      <PlotlyGraph
        layout={layout}
        data={data}
        shapes={shapes}
        annotations={annotations}
        xRange={xRange}
        setXRange={setXRange}
        dataToShow={dataToShow}
      />
    </Box>
  );
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
    ?.sort((a, b) => dayjs(a.startdate).diff(dayjs(b.startdate)))
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

export default GraphManager;
