import {Box, ClickAwayListener, FormControlLabel, SvgIcon, Switch, Typography} from '@mui/material';
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
import LinkIcon from '@mui/icons-material/Link';
import {MergeType} from '~/helpers/EnumHelper';
import {rerunQAIcon} from '~/helpers/plotlyIcons';
import {useEdgeDates} from '~/hooks/query/useEdgeDates';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCorrectData} from '~/hooks/useCorrectData';
import {useRunQA} from '~/hooks/useRunQA';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import Button from './Button';
import {Download} from '@mui/icons-material';
import {useAppContext} from '~/state/contexts';
import {dataToShowAtom} from '~/state/atoms';
import {useAtom} from 'jotai';
import {useStationPages} from '~/hooks/useQueryStateParameters';

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
}: PlotlyGraphProps) {
  const [pagetoShow] = useStationPages();
  const {ts_id} = useAppContext([], ['ts_id']);
  const {data: metadata} = useTimeseriesData();
  const tstype_name = metadata?.tstype_name;
  const unit = metadata?.unit;
  const [isOpen, setIsOpen] = useState(false);
  const [dataToShow, setDataToShow] = useAtom(dataToShowAtom);
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

  const actionButtonStyle = {m: 0, textTransform: 'initial', fontSize: isTouch ? 11 : '0.8125rem'};
  const zoomButtonStyle = {m: 0, textTransform: 'initial', minWidth: 25};

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataToShow({...dataToShow, [event.target.name]: event.target.checked});
  };

  useEffect(() => {
    if (tstype_name) setLayout({yaxis: {title: {text: `${tstype_name} [${unit}]`}}});
  }, [tstype_name, unit]);

  return (
    <>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <Box ml={isTouch ? 0 : 10} display={'flex'} flexDirection={'row'}>
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
        <Box alignContent={'center'} mr={isTouch ? 1 : 5}>
          <Box display={'flex'} flexWrap={'wrap'} justifyContent={'end'}>
            <Button
              bttype="link"
              size="small"
              onClick={() => {
                correctMutation.mutate();
              }}
              startIcon={
                <SvgIcon sx={{width: 18, height: 18}} viewBox="0 0 500 500">
                  <path d={rerunQAIcon.path} />
                </SvgIcon>
              }
              sx={actionButtonStyle}
            >
              QA
            </Button>
            <Button
              bttype="link"
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => {
                rerunQAMutation.mutate();
              }}
              sx={actionButtonStyle}
            >
              Genberegn
            </Button>
            <Button
              bttype="link"
              size="small"
              onClick={() => {
                const url = 'https://www.watsonc.dk/calypso/data_export/?ts_ids=' + ts_id;
                window.open(url);
              }}
              startIcon={<Download />}
              sx={actionButtonStyle}
            >
              Download
            </Button>
            <Button
              bttype="link"
              size="small"
              onClick={() => {
                const ts_id = window.location.href.split('/').at(-1)?.split('#').at(0);
                // feature detection
                // Browsers that support HTML5 download attribute
                const url =
                  'https://watsonc.dk/calypso/timeseries_plot.html?&ts_id=' +
                  ts_id +
                  '&pejling=true';
                window.open(url);
                // exportToCsv("data.csv", rows);
              }}
              startIcon={<LinkIcon />}
              sx={actionButtonStyle}
            >
              Ekstern
            </Button>
            {/* <Button
            bttype="link"
            size="small"
            onClick={() => {
              if (showRaw) showRaw();
              setLayout({yaxis2: {visible: true}});
            }}
            startIcon={<TimelineIcon />}
            sx={actionButtonStyle}
          >
            Rådata
          </Button> */}
            <Button
              bttype="secondary"
              endIcon={<TuneRoundedIcon />}
              sx={{textTransform: 'initial'}}
              onClick={() => setIsOpen(!isOpen)}
            >
              Filter
            </Button>
          </Box>

          {isOpen && (
            <ClickAwayListener onClickAway={() => setIsOpen(false)}>
              <Box
                sx={{
                  position: 'absolute',
                  right: '16px',
                  width: '175px',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  pl: '10px',
                  py: '10px',
                  mt: 0.5,
                }}
              >
                {Object.keys(dataToShow).map((key) => (
                  <Box key={key}>
                    <FormControlLabel
                      key={key}
                      control={
                        <Switch
                          checked={
                            Object.entries(dataToShow).find((item) => item[0] === key)?.[1] ===
                              true ||
                            (key === 'Kontrolmålinger' && pagetoShow === 'pejling')
                          }
                          onChange={handleChange}
                          name={key}
                          disabled={key === 'Kontrolmålinger' && pagetoShow === 'pejling'}
                          size={'small'}
                          color="primary"
                        />
                      }
                      label={<Typography variant="caption">{key}</Typography>}
                    />
                  </Box>
                ))}
                <Button
                  sx={{display: 'flex', justifySelf: 'end', mr: 1, textTransform: 'initial'}}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  bttype="secondary"
                >
                  Luk
                </Button>
              </Box>
            </ClickAwayListener>
          )}
        </Box>
      </Box>
      <Plot
        onSelected={(e) => {
          if (plotEventProps?.onSelected) plotEventProps.onSelected(e);
        }}
        divId="qagraphDiv"
        onRelayout={handleRelayout}
        data={data}
        layout={{...mergedLayout, shapes: shapes, annotations: annotations}}
        config={{
          doubleClick: false,
          responsive: true,
          modeBarButtons: [['zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d']],
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
