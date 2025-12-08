import {Box, useTheme} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';

import {Layout, PlotData} from 'plotly.js';
import React, {useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {
  correction_map,
  setGraphHeight,
  defaultDataToShow as globalDefaultDataToShow,
} from '~/consts';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import {useCertifyQa} from '~/features/kvalitetssikring/api/useCertifyQa';
import {usePejling} from '~/features/pejling/api/usePejling';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
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
  tempHorizontalAtom,
} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';
import {
  BoreholeMeasurement,
  BoreholeMeasurementAPI,
  DataToShow,
  HorizontalLine,
  MaalepunktTableData,
  QaGraphLabel,
} from '~/types';

interface GraphManagerProps {
  dynamicMeasurement?: Array<string | number>;
  defaultDataToShow?: Partial<DataToShow>;
}

type JupiterData = {
  data: {
    situation: Array<number | null>;
    x: Array<string>;
    y: Array<number>;
  };
};

const initRange = [
  dayjs('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  dayjs().format('YYYY-MM-DDTHH:mm'),
];

const GraphManager = ({dynamicMeasurement, defaultDataToShow}: GraphManagerProps) => {
  const {ts_id, loc_id, boreholeno, intakeno} = useAppContext(
    ['ts_id', 'loc_id'],
    ['boreholeno', 'intakeno']
  );

  const setSelection = useSetAtom(qaSelection);
  const [initiateSelect, setInitiateSelect] = useAtom(initiateSelectAtom);
  const levelCorrection = useAtomValue(levelCorrectionAtom);
  const initiateConfirmTimeseries = useAtomValue(initiateConfirmTimeseriesAtom);
  const [control, setcontrol] = useState<Array<BoreholeMeasurement> | undefined>();

  const tempLines = useAtomValue(tempHorizontalAtom);
  const [pageToShow] = useStationPages();
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
      overlaying: 'y',
      side: 'right',
    },
  };

  const {data: unitHistory} = useUnitHistory();

  const {
    get: {data: algorithms},
  } = useAlgorithms();

  const hideJupiterIfNotRelevant =
    dataToShowSelected.Jupiter === undefined &&
    boreholeno !== undefined &&
    intakeno !== undefined &&
    intakeno !== -1 &&
    timeseries_data?.tstype_id === 1
      ? timeseries_data.unit_uuid === null
      : !!dataToShowSelected.Jupiter;

  const dataToShow: DataToShow = {
    ...globalDefaultDataToShow,
    ...defaultDataToShow,
    ...dataToShowSelected,
    Jupiter: hideJupiterIfNotRelevant,
  };

  const {
    get: {data: certifedData},
  } = useCertifyQa();
  const {
    get: {data: controlData},
  } = usePejling();

  const {data: measurements} = useQuery<
    Array<BoreholeMeasurementAPI>,
    Error,
    Array<BoreholeMeasurement>
  >({
    queryKey: queryKeys.Borehole.measurementsWithIntake(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<BoreholeMeasurementAPI>>(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    select: (data): Array<BoreholeMeasurement> =>
      data.map((e) => ({
        ...e,
        timeofmeas: dayjs(e.timeofmeas),
        pumpstop: e.pumpstop ? dayjs(e.pumpstop) : null,
      })),
    enabled: boreholeno !== undefined && intakeno !== undefined && intakeno !== -1,
    placeholderData: [],
  });

  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.watlevmpWithIntake(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<MaalepunktTableData>>(
        `/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && intakeno !== undefined,
    placeholderData: [],
  });

  const {data: adjustmentData} = useAdjustmentData(ts_id);

  const {data: qaData} = useQuery({
    queryKey: queryKeys.Timeseries.qaLabels(ts_id),
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get<Array<QaGraphLabel>>(`/sensor_admin/qa_labels/${ts_id}`, {
        signal,
      });
      return data;
    },
    enabled: dataToShow['Algoritmer'],
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
    queryKey: queryKeys.Timeseries.precipitationData(loc_id),
    queryFn: async () => {
      const starttime = dayjs(edgeDates?.firstDate).format('YYYY-MM-DDTHH:mm');
      const stoptime = dayjs(edgeDates?.lastDate).format('YYYY-MM-DDTHH:mm');
      const {data} = await apiClient.get(
        `/wrapper/dmi/precipitation/location/${loc_id}?start=${starttime}&stop=${stoptime}&agg=balanced`
      );
      return data;
    },
    enabled: dataToShow['Nedbør'] && edgeDates !== undefined && edgeDates?.firstDate !== null,
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
    enabled:
      dataToShow.Rådata && timeseries_data?.unit_uuid !== null && !timeseries_data?.calculated,
    placeholderData: [],
  });

  const {data: jupiterData} = useQuery({
    queryKey: queryKeys.Borehole.jupiterData(boreholeno, intakeno),
    queryFn: async () => {
      const params = {
        startdato:
          unitHistory && unitHistory.length > 1
            ? unitHistory[unitHistory.length - 1].startdato
            : timeseries_data?.startdato,
      };

      const {data} = await apiClient.get<JupiterData>(
        `/sensor_field/borehole/jupiter/measurements/${boreholeno}/${intakeno}`,
        {params}
      );
      return data;
    },
    enabled:
      boreholeno !== undefined &&
      intakeno !== undefined &&
      intakeno !== -1 &&
      timeseries_data?.tstype_id === 1 &&
      dataToShow.Jupiter,
  });

  const jupiterTraces = [null, 0, 1].map((situation) => {
    // get indexes where data.situation is 0, 1 or null
    const indexes = jupiterData?.data?.situation
      ?.map((innersituation, index) => ({isSituation: innersituation == situation, index: index}))
      .filter((d) => d.isSituation !== false)
      .map((item) => item.index);
    // get x and y values for each situation
    const x = jupiterData ? indexes?.map((index) => jupiterData.data.x[index]) : [];
    const y = jupiterData ? indexes?.map((index) => jupiterData.data.y[index]) : [];

    let name = 'Jupiter - ukendt årsag';
    if (situation === 0) name = 'Jupiter - i ro';
    else if (situation === 1) name = 'Jupiter - i drift';

    const trace: Partial<PlotData> = {
      x,
      y,
      // name: i ? (i in TRACE_NAMES ? TRACE_NAMES[i] : null) : null,
      name: name,
      type: 'scattergl',
      line: {width: 2},
      mode: 'lines+markers',
      marker: {symbol: '100', size: 8},
      uid: `jupiter-situation-${situation}`,
    };
    return trace;
  });

  const xOurData = control?.map((d) => d.timeofmeas.toISOString());
  const yOurData = control?.map((d) => (d.waterlevel ? d.waterlevel : null));

  const plotOurData: Partial<PlotData> = {
    x: xOurData,
    y: yOurData,
    name: 'Calypso data',
    type: 'scattergl',
    mode: 'markers',
    marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
    uid: 'calypso-data',
  };

  const borehole_data: Array<Partial<PlotData>> = [...jupiterTraces, plotOurData];

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.referenced_measurement);
  const textControl = controlData?.map((d) => correction_map[d.useforcorrection]);

  const [shapes, annotations] = useMemo(() => {
    const [qaShapes, qaAnnotate] = transformQAData(qaData ?? []);
    let shapes: Array<object> = [];
    let annotations: Array<object> = [];

    let alarm_lines: Array<{name: string; level: number}> = [];
    if (
      algorithms?.find(
        (algorithm) => algorithm.algorithm === 'ThresholdAlarm' && algorithm.disabled === false
      ) !== undefined
    ) {
      const algorithm = algorithms.find(
        (algorithm) => algorithm.algorithm === 'ThresholdAlarm' && algorithm.disabled === false
      );
      alarm_lines = Object.entries(algorithm?.parameter_values ?? {})
        .filter((value) => value[0] !== 'aggregation_option' && value[1] !== null)
        ?.map((elem) => {
          const parameter = algorithm?.parameters.find((param) => param.name == elem[0]);
          return {
            name: parameter?.label ?? '',
            level: elem[1],
          };
        });
    }

    Object.entries(dataToShow).forEach((entry) => {
      if (entry[1] == false) return;
      switch (entry[0]) {
        case 'Alarm niveauer':
          shapes = [
            ...shapes,
            ...(alarm_lines?.map((elem) => {
              return {
                x0: 0,
                x1: 0.97,
                y0: elem.level,
                y1: elem.level,
                name: elem.name,
                type: 'scatter',
                xref: 'paper',
                line: {width: 1, dash: 'dash'},
                mode: 'lines',
              };
            }) ?? []),
          ];
          annotations = [
            ...annotations,
            ...(alarm_lines?.map((elem) => {
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
        case 'Godkendt':
          shapes = [
            ...shapes,
            ...(certifedData?.map((d) => {
              return {
                type: 'rect',
                x0: edgeDates?.firstDate,
                x1: dayjs(d.date).format('YYYY-MM-DDTHH:mm'),
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
                x: dayjs(d.date).format('YYYY-MM-DDTHH:mm'),
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
  }, [dataToShow, adjustmentData, certifedData, qaData, tempLines]);

  const data = [
    {
      x: graphData?.x,
      y: graphData?.y,
      name: loc_name + ' ' + ts_name,
      type: 'scattergl',
      line: {width: 2},
      mode: 'lines+markers',
      marker: {symbol: '100', size: '3', color: '#177FC1'},
      uid: 'data',
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
            mode: 'lines+markers',
            marker: {symbol: '100', size: 3},
            uid: 'rawData',
          },
        ]
      : []),
    ...(dataToShow?.Jupiter ? borehole_data : []),
    {
      x: dynamicMeasurement ? [dynamicMeasurement?.[0]] : [],
      y: dynamicMeasurement ? [dynamicMeasurement?.[1]] : [],
      name: '',
      uid: 'dynamic',
      type: 'scatter',
      mode: 'markers',
      showlegend: true,
      marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
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
            uid: 'controlData',
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
            uid: 'removedData',
          },
        ]
      : []),
    ...(dataToShow?.['Nedbør']
      ? [
          {
            ...precipitation_data,
            yaxis: 'y2',
            uid: 'precipitationData',
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (dynamicMeasurement?.[0] != undefined && dynamicMeasurement?.[0] !== null) {
      setXRange([
        dayjs(dynamicMeasurement?.[0]).subtract(4, 'day').format('YYYY-MM-DDTHH:mm'),
        dayjs(dynamicMeasurement?.[0]).add(3, 'day').format('YYYY-MM-DDTHH:mm'),
      ]);
    }
  }, [dynamicMeasurement?.[0]]);

  useEffect(() => {
    let ctrls = [];
    if (measurements !== undefined) {
      if (watlevmp && watlevmp.length > 0) {
        ctrls = measurements?.map((e) => {
          const elev = watlevmp.filter((e2) => {
            return (
              e.timeofmeas.isSameOrAfter(e2.startdate) && e.timeofmeas.isSameOrBefore(e2.enddate)
            );
          })[0].elevation;

          return {
            ...e,
            waterlevel: e.disttowatertable_m ? elev - e.disttowatertable_m : null,
          };
        });
      } else {
        ctrls = measurements?.map((elem) => {
          return {...elem, waterlevel: elem.disttowatertable_m};
        });
      }
      setcontrol(ctrls);
    }
  }, [watlevmp, measurements !== undefined]);

  useEffect(() => {
    let ctrls = [];
    if (measurements !== undefined) {
      if (watlevmp && watlevmp.length > 0) {
        ctrls = measurements?.map((e) => {
          const elev = watlevmp.filter((e2) => {
            return (
              e.timeofmeas.isSameOrAfter(e2.startdate) && e.timeofmeas.isSameOrBefore(e2.enddate)
            );
          })[0].elevation;

          return {
            ...e,
            waterlevel: e.disttowatertable_m ? elev - e.disttowatertable_m : null,
          };
        });
      } else {
        ctrls = measurements?.map((elem) => {
          return {...elem, waterlevel: elem.disttowatertable_m};
        });
      }
      setcontrol(ctrls);
    }
  }, [watlevmp, measurements !== undefined]);

  if (pageToShow === 'justeringer') {
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
