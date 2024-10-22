import {useMediaQuery, useTheme} from '@mui/material';
import {assign, merge} from 'lodash';
import {Layout} from 'plotly.js';
import {useState} from 'react';

import {MergeType} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
/**
 * For nu er mergetype required. Det kan være at den måske skal være optional i fremtiden
 * Måske skal der også være andre kriterier?
 */
const global: Partial<Layout> = {
  yaxis2: {
    showgrid: false,
    overlaying: 'y',
    side: 'right',
    title: {
      font: {
        size: 12,
      },
    },
  },
  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
  },
  font: {
    size: 12,
    color: 'rgb(0, 0, 0)',
  },
};

const desktopLayout: Partial<Layout> = {
  ...global,
  xaxis: {
    domain: [0, 0.97],
    autorange: true,
    type: 'date',
    showline: true,
  },
  yaxis: {
    title: {
      text: '',
      font: {size: 12},
    },
    showline: true,
  },
  margin: {
    // l: 70,
    r: 0,
    // b: 30,
    t: 10,
    pad: 4,
  },
};

const mobileLayout: Partial<Layout> = {
  ...global,
  modebar: {
    orientation: 'v',
  },
  xaxis: {
    autorange: true,
    type: 'date',
  },
  yaxis: {
    showline: true,
    title: {
      text: '',
      font: {size: 12},
    },
  },

  margin: {
    l: 50,
    r: 30,
    b: 40,
    t: 0,
    pad: 4,
  },
};

const mergeLayout = (layout1: Partial<Layout>, layout2: Partial<Layout>, mergeType: MergeType) => {
  if (mergeType === MergeType.SHALLOWMERGE) {
    return assign({}, layout1, layout2);
  } else if (mergeType === MergeType.RECURSIVEMERGE) {
    return merge({}, layout1, layout2);
  } else {
    return layout1;
  }
};

const usePlotlyLayout = (mergeType: MergeType, layout?: Partial<Layout>) => {
  const {isMobile} = useBreakpoints();
  const default_layout = isMobile ? mobileLayout : desktopLayout;

  const [mergedLayout, setMergedLayout] = useState<Partial<Layout>>(
    mergeLayout(default_layout, layout ?? {}, mergeType)
  );

  const setLayout = (layout: Partial<Layout>) => {
    const merged = mergeLayout(mergedLayout, layout, mergeType);
    setMergedLayout({
      ...merged,
      uirevision: Math.random(),
    });
  };

  return [mergedLayout, setLayout] as const;
};

export default usePlotlyLayout;
