import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {Layout, PlotData, PlotMouseEvent, PlotRelayoutEvent, PlotSelectionEvent} from 'plotly.js';
import React, {useContext, useEffect} from 'react';
import Plot from 'react-plotly.js';

import {apiClient} from '~/apiClient';
import usePlotlyLayout from '~/features/kvalitetssikring/components/usePlotlyLayout';
import {MergeType} from '~/helpers/EnumHelper';
import {
  rerunQAIcon,
  downloadIcon,
  rawDataIcon,
  makeLinkIcon,
  rerunIcon,
} from '~/helpers/plotlyIcons';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCorrectData} from '~/hooks/useCorrectData';
import {useRunQA} from '~/hooks/useRunQA';
import {APIError} from '~/queryClient';
import {MetadataContext} from '~/state/contexts';

import Button from './Button';

type DefinedModebarButtons =
  | 'raw'
  | 'rerun'
  | 'rerunQa'
  | 'download'
  | 'link'
  | 'select2d'
  | 'toImage';

interface PlotlyGraphProps {
  plotEventProps?: {
    onSelected?: (event: Readonly<PlotSelectionEvent>) => void;
    onRelayout?: (event: Readonly<PlotRelayoutEvent>) => void;
    onClick?: (event: Readonly<PlotMouseEvent>) => void;
  };
  plotModebarButtons: Array<Plotly.ModeBarButton | DefinedModebarButtons>;
  initiateSelect?: boolean;
  layout: Partial<Layout>;
  shapes?: Layout['shapes'];
  annotations?: Layout['annotations'];
  data: Array<Partial<PlotData>>;
  setXRange?: (range: Array<string>) => void;
  showRaw?: () => void;
}

export default function PlotlyGraph({
  plotEventProps,
  plotModebarButtons,
  initiateSelect,
  layout,
  shapes = [],
  annotations = [],
  data,
  setXRange,
  showRaw,
}: PlotlyGraphProps) {
  const [mergedLayout, setLayout] = usePlotlyLayout(MergeType.RECURSIVEMERGE, layout);

  const metadata = useContext(MetadataContext);
  const {mutation: correctMutation} = useCorrectData(metadata?.ts_id, 'graphData');
  const {mutation: rerunQAMutation} = useRunQA(metadata?.ts_id);
  const {isTouch} = useBreakpoints();

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

  useEffect(() => {
    console.log(initiateSelect);
    if (initiateSelect) {
      setLayout({dragmode: 'select'});
    } else {
      setLayout({dragmode: 'zoom'});
    }
  }, [initiateSelect]);

  const handleRelayout = (e: any) => {
    console.log('e', e);

    const doubleclick = e['xaxis.autorange'] === true && e['yaxis.autorange'] === true;

    if (doubleclick) {
      graphLayout('all');
      return;
    }

    if (plotEventProps && plotEventProps.onRelayout) plotEventProps.onRelayout(e);

    if (e['dragmode']) {
      setLayout({dragmode: e['dragmode']});
    }

    if (setXRange && e['xaxis.range[0]'] !== undefined) {
      let x0 = moment(e['xaxis.range[0]']);
      let x1 = moment(e['xaxis.range[1]']);

      const daysdiff = x1.diff(x0, 'days');

      x0 = x0.subtract(Math.max(daysdiff * 0.2, 1), 'days');
      x1 = x1.add(Math.max(daysdiff * 0.2, 1), 'days');

      setXRange([x0.format('YYYY-MM-DD'), x1.format('YYYY-MM-DD')]);

      return;
    }
  };

  const graphLayout = (type: string) => {
    let dates: {firstDate: string | undefined; lastDate: string | undefined};
    if (edgeDates != undefined) {
      dates = edgeDates;
    } else {
      const sortedFlatArray = data
        .flatMap((array) => {
          if (array.x == undefined) {
            return [];
          }
          return array.x.length > 0 ? [array.x[0], array.x[array.x.length - 1]] : [];
        })
        .sort() as Array<string>;

      dates = {
        firstDate: sortedFlatArray[0],
        lastDate: sortedFlatArray[sortedFlatArray.length - 1],
      };
    }

    let range: Array<string> = [];
    const lastDate = moment(dates.lastDate).format('YYYY-MM-DDTHH:mm');
    if (type === 'all') {
      const startDate = moment(dates.firstDate).format('YYYY-MM-DDTHH:mm');
      range = [startDate, lastDate];
    } else if (type === 'year') {
      const x = moment(dates.lastDate).subtract(1, 'year').format('YYYY-MM-DDTHH:mm');
      range = [x, lastDate];
    } else if (type === 'month') {
      const x = moment(dates.lastDate).subtract(1, 'month').format('YYYY-MM-DDTHH:mm');
      range = [x, lastDate];
    } else if (type === 'week') {
      const x = moment(dates.lastDate).subtract(7, 'days').format('YYYY-MM-DDTHH:mm');
      range = [x, lastDate];
    }

    const layout = {
      xaxis: {
        autorange: false,
        range: range,
      },
    };
    if (setXRange != undefined) {
      let x0 = moment(range[0]);
      let x1 = moment(range[1]);

      const daysdiff = x1.diff(x0, 'days');

      x0 = x0.subtract(Math.max(daysdiff * 0.2, 1), 'days');
      x1 = x1.add(Math.max(daysdiff * 0.2, 1), 'days');

      setXRange([x0.format('YYYY-MM-DD'), x1.format('YYYY-MM-DD')]);
    }
    setLayout(layout);
  };

  const rerunButton = {
    name: 'Genberegn data',
    title: 'Genberegn data',
    icon: rerunIcon,
    click: function () {
      correctMutation.mutate();
    },
  };

  const rerunQAButton = {
    name: 'Genberegn QA',
    title: 'Genberegn QA',
    icon: rerunQAIcon,
    click: function () {
      rerunQAMutation.mutate();
    },
  };

  const makeLinkButton = {
    title: 'Ekstern data',
    name: 'Ekstern link',
    icon: makeLinkIcon,
    click: function () {
      const ts_id = window.location.href.split('/').at(-1)?.split('#').at(0);

      const link = document.createElement('a');
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        const url =
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

  const downloadButton = {
    title: 'Download data',
    name: 'Download data',
    icon: downloadIcon,
    click: function (gd: any) {
      console.log(gd);
      // var rows = gd.data[0].x.map((elem, idx) => [
      //   moment(elem).format('YYYY-MM-DD HH:mm'),
      //   gd.data[0].y[idx].toString().replace('.', ','),
      // ]);

      // exportToCsv('data.csv', rows);
    },
  };

  const getRawData = {
    title: 'Hent rå data',
    name: 'Hent rådata',
    icon: rawDataIcon,
    click: function () {
      if (showRaw) showRaw();
      setLayout({yaxis2: {visible: true}});
    },
  };

  const buttonsToShow = plotModebarButtons.map((button) => {
    if (typeof button === 'string') {
      if (button === 'raw') return getRawData;
      else if (button === 'rerun') return rerunButton;
      else if (button === 'download') return downloadButton;
      else if (button === 'rerunQa') return rerunQAButton;
      else if (button === 'link') return makeLinkButton;
    }
    return button;
  });
  return (
    <>
      <Box display={'flex'} flexDirection={'row'} ml={isTouch ? '15%' : 10}>
        <Button
          bttype="link"
          onClick={() => graphLayout('week')}
          size="small"
          sx={{m: 0, textTransform: 'initial', width: 25, minWidth: 35}}
        >
          Uge
        </Button>
        <Button
          bttype="link"
          onClick={() => graphLayout('month')}
          size="small"
          sx={{m: 0, textTransform: 'initial', width: 25, minWidth: 45}}
        >
          Måned
        </Button>
        <Button
          bttype="link"
          onClick={() => graphLayout('year')}
          size="small"
          sx={{m: 0, textTransform: 'initial', width: 25, minWidth: 25}}
        >
          År
        </Button>
        <Button
          bttype="link"
          onClick={() => graphLayout('all')}
          size="small"
          sx={{m: 0, textTransform: 'initial', width: 25, minWidth: 35}}
        >
          Alt
        </Button>
      </Box>
      <Plot
        onSelected={plotEventProps && plotEventProps.onSelected}
        divId="qagraphDiv"
        onRelayout={handleRelayout}
        data={data}
        layout={{
          ...mergedLayout,
          shapes: shapes,
          annotations: annotations,
        }}
        config={{
          // showTips: false,
          responsive: true,
          modeBarButtons: [
            buttonsToShow,
            ['zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
          ],
          displaylogo: false,
          displayModeBar: true,
        }}
        onClick={plotEventProps && plotEventProps.onClick}
        useResizeHandler={true}
        style={{width: '100%', height: '100%'}}
      />
    </>
  );
}
