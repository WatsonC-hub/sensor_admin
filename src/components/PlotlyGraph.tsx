import {Box, ClickAwayListener, Tooltip} from '@mui/material';
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
import React, {useEffect, useState} from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import ReplayIcon from '@mui/icons-material/Replay';
import usePlotlyLayout from '~/features/kvalitetssikring/components/usePlotlyLayout';
import {MergeType} from '~/helpers/EnumHelper';
import {useEdgeDates} from '~/hooks/query/useEdgeDates';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCorrectData} from '~/hooks/useCorrectData';

import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import Button from './Button';
import {Download} from '@mui/icons-material';
import {useAppContext} from '~/state/contexts';

import {DataToShow} from '~/types';
import GraphSwitch from '~/features/station/components/GraphSwitch';

interface PlotlyGraphProps {
  plotEventProps?: {
    onSelected?: (event: Readonly<PlotSelectionEvent>) => void;
    onRelayout?: (event: Readonly<PlotRelayoutEvent>) => void;
    onClick?: (event: Readonly<PlotMouseEvent>) => void;
  };
  initiateSelect?: boolean;
  layout: Partial<Layout>;
  shapes?: Layout['shapes'];
  annotations?: Layout['annotations'];
  data: Array<Partial<PlotData>>;
  xRange?: Array<string>;
  setXRange?: (range: Array<string>) => void;
  dataToShow?: Partial<DataToShow>;
}

const Plot = createPlotlyComponent(Plotly);

export default function PlotlyGraph({
  plotEventProps,
  initiateSelect,
  layout,
  shapes = [],
  annotations = [],
  data,
  xRange,
  setXRange,
  dataToShow = {},
}: PlotlyGraphProps) {
  const {ts_id, boreholeno} = useAppContext([], ['ts_id', 'boreholeno']);
  const {data: metadata} = useTimeseriesData();
  const tstype_name = metadata?.tstype_name;
  const unit = metadata?.unit;

  const plot = document.getElementById('graph');
  if (plot) Plotly.Plots.resize(plot);
  // console.log('plot', Plotly.rezi);
  const [isOpen, setIsOpen] = useState(false);
  const [mergedLayout, setLayout] = usePlotlyLayout(MergeType.RECURSIVEMERGE, layout);

  const {mutation: correctMutation} = useCorrectData(metadata?.ts_id, 'graphData');

  const {isTouch, isMobile} = useBreakpoints();

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

  const actionButtonStyle = {
    m: 0,
    textTransform: 'initial',
    fontSize: isTouch ? 11 : '0.8125rem',
    minWidth: 0,
  };
  const zoomButtonStyle = {m: 0, textTransform: 'initial', minWidth: 25};

  useEffect(() => {
    if (tstype_name) setLayout({yaxis: {title: {text: `${tstype_name} [${unit}]`}}});
  }, [tstype_name, unit]);

  return (
    <>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <Box pl={isTouch ? 0 : 7} display={'flex'} flexDirection={'row'}>
          <Button
            bttype="link"
            onClick={() => graphLayout('week')}
            size="small"
            sx={zoomButtonStyle}
          >
            Uge
          </Button>
          <Button
            bttype="link"
            onClick={() => graphLayout('month')}
            size="small"
            sx={zoomButtonStyle}
          >
            Måned
          </Button>
          <Button
            bttype="link"
            onClick={() => graphLayout('year')}
            size="small"
            sx={zoomButtonStyle}
          >
            År
          </Button>
          <Button
            bttype="link"
            onClick={() => graphLayout('all')}
            size="small"
            sx={zoomButtonStyle}
          >
            Alt
          </Button>
        </Box>
        {boreholeno === undefined && (
          <Box display={'flex'} flexDirection={'row'} pr={1} gap={isTouch ? 0 : 1}>
            <Tooltip title={'Genberegn tidsserie data'} arrow placement="top">
              <Button
                bttype="link"
                size="small"
                startIcon={!isMobile && <ReplayIcon />}
                onClick={() => {
                  correctMutation.mutate();
                }}
                sx={actionButtonStyle}
              >
                {isMobile && <ReplayIcon fontSize="small" />}
                {!isMobile && 'Genberegn'}
              </Button>
            </Tooltip>
            <Tooltip title={'Download tidsserie data'} arrow placement="top">
              <Button
                bttype="link"
                size="small"
                onClick={() => {
                  const url = 'https://www.watsonc.dk/calypso/data_export/?ts_ids=' + ts_id;
                  window.open(url);
                }}
                startIcon={!isMobile && <Download />}
                sx={actionButtonStyle}
              >
                {isMobile && <Download fontSize="small" />}
                {!isMobile && 'Download'}
              </Button>
            </Tooltip>
            <Button
              bttype="secondary"
              startIcon={!isMobile && <TuneRoundedIcon />}
              sx={{textTransform: 'initial', my: 'auto', px: isMobile ? 0 : 2, minWidth: 32}}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isMobile && <TuneRoundedIcon fontSize="small" />}
              {!isMobile && 'Grafer'}
            </Button>
          </Box>
        )}
      </Box>

      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <Box>
            <GraphSwitch dataToShow={dataToShow} setIsOpen={setIsOpen} />
          </Box>
        </ClickAwayListener>
      )}

      <Plot
        onSelected={(e) => {
          if (plotEventProps?.onSelected) plotEventProps.onSelected(e);
        }}
        divId="graph"
        onRelayout={handleRelayout}
        data={data}
        layout={{...mergedLayout, shapes: shapes, annotations: annotations}}
        config={{
          doubleClick: false,
          responsive: true,
          modeBarButtons: [
            boreholeno ? ['toImage'] : [],
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
