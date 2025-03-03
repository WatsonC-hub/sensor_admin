import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import moment from 'moment';
import {Layout} from 'plotly.js';
import React, {useState} from 'react';
import {toast} from 'react-toastify';

import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {
  initiateConfirmTimeseriesAtom,
  initiateSelectAtom,
  levelCorrectionAtom,
  qaSelection,
} from '~/state/atoms';

import useQAGraph from './hooks/useQAGraph';

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

interface PlotGraphProps {
  ts_id: number;
}

export default function PlotGraph({ts_id}: PlotGraphProps) {
  const setSelection = useSetAtom(qaSelection);
  const [xRange, setXRange] = useState(initRange);
  const [initiateSelect, setInitiateSelect] = useAtom(initiateSelectAtom);
  const levelCorrection = useAtomValue(levelCorrectionAtom);
  const initiateConfirmTimeseries = useAtomValue(initiateConfirmTimeseriesAtom);

  const {data, shapes, annotations, graphData} = useQAGraph(ts_id, xRange);

  const {isTouch} = useBreakpoints();

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
      if (eventData.points && eventData.points.length > 0) toast.dismiss('juster');
    }
  };

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
