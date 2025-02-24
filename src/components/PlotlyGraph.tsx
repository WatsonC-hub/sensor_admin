import {Box} from '@mui/material';
import moment from 'moment';
import type {
  Layout,
  PlotData,
  PlotMouseEvent,
  PlotRelayoutEvent,
  PlotSelectionEvent,
} from 'plotly.js';
// @ts-expect-error not part of type
import Plotly from 'plotly.js/dist/plotly-gl2d';
import React, {useEffect} from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

import usePlotlyLayout from '~/features/kvalitetssikring/components/usePlotlyLayout';
import {MergeType} from '~/helpers/EnumHelper';
import {
  rerunQAIcon,
  downloadIcon,
  rawDataIcon,
  makeLinkIcon,
  rerunIcon,
} from '~/helpers/plotlyIcons';
import {useEdgeDates} from '~/hooks/query/useEdgeDates';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCorrectData} from '~/hooks/useCorrectData';
import {useRunQA} from '~/hooks/useRunQA';

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
  xRange?: Array<string>;
  setXRange?: (range: Array<string>) => void;
  showRaw?: () => void;
}

const Plot = createPlotlyComponent(Plotly);

export default function PlotlyGraph({
  plotEventProps,
  plotModebarButtons,
  initiateSelect,
  layout,
  shapes = [],
  annotations = [],
  data,
  xRange,
  setXRange,
  showRaw,
}: PlotlyGraphProps) {
  const {data: metadata} = useTimeseriesData();
  const tstype_name = metadata?.tstype_name;
  const unit = metadata?.unit;

  const [mergedLayout, setLayout] = usePlotlyLayout(MergeType.RECURSIVEMERGE, layout);

  const {mutation: correctMutation} = useCorrectData(metadata?.ts_id, 'graphData');
  const {mutation: rerunQAMutation} = useRunQA(metadata?.ts_id);
  const {isTouch} = useBreakpoints();

  const {data: edgeDates} = useEdgeDates(metadata?.ts_id);

  useEffect(() => {
    if (xRange != undefined) {
      const layout = {xaxis: {autorange: false, range: xRange}};

      setLayout(layout);
    }
  }, [xRange]);

  useEffect(() => {
    if (initiateSelect) {
      setLayout({dragmode: 'select'});
    } else {
      setLayout({dragmode: 'zoom'});
    }
  }, [initiateSelect]);

  const handleRelayout = (e: any) => {
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
      setXRange([e['xaxis.range[0]'], e['xaxis.range[1]']]);

      return;
    }
  };

  const graphLayout = (type: string) => {
    const flatArray = data
      .filter((data) => data.yaxis != 'y2')
      .flatMap((array) => {
        if (array.x == undefined) {
          return [];
        }
        return array.x.length > 0 ? [array.x[0], array.x[array.x.length - 1]] : [];
      });

    if (edgeDates != undefined) {
      flatArray.push(edgeDates.firstDate);
      flatArray.push(edgeDates.lastDate);
    }
    const sortedFlatArray = flatArray.sort() as string[];
    const dates: {firstDate: string; lastDate: string} = {
      firstDate: sortedFlatArray[0],
      lastDate: sortedFlatArray[sortedFlatArray.length - 1],
    };

    if (dates.firstDate && dates.lastDate) {
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

      if (setXRange != undefined) {
        setXRange(range);
      }
      const layout: Partial<Layout> = {
        xaxis: {autorange: false, range: range},
        yaxis: {autorange: true},
        yaxis2: {autorange: true},
      };
      setLayout(layout);
    }
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

  useEffect(() => {
    if (tstype_name) setLayout({yaxis: {title: `${tstype_name} [${unit}]`}});
  }, [tstype_name, unit]);

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
        onSelected={(e) => {
          console.log('onselected', e);
          if (plotEventProps?.onSelected) plotEventProps.onSelected(e);
        }}
        divId="qagraphDiv"
        onRelayout={handleRelayout}
        data={data}
        layout={{...mergedLayout, shapes: shapes, annotations: annotations}}
        config={{
          doubleClick: false,
          responsive: true,
          modeBarButtons: [
            buttonsToShow,
            ['zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
          ],
          displaylogo: false,
          displayModeBar: true,
        }}
        onDoubleClick={() => {
          graphLayout('all');
        }}
        onClick={plotEventProps && plotEventProps.onClick}
        useResizeHandler={true}
        style={{width: '99.863%', height: '90%'}}
      />
    </>
  );
}
