import {useMediaQuery, useTheme} from '@mui/material';
import {assign, merge} from 'lodash';
import {Layout} from 'plotly.js';
import {useEffect, useState} from 'react';

import {mobileLayout, desktopLayout} from '~/consts';
import {MergeType} from '~/helpers/EnumHelper';
/**
 * For nu er mergetype required. Det kan være at den måske skal være optional i fremtiden
 * Måske skal der også være andre kriterier?
 */

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
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const default_layout = matches ? mobileLayout : desktopLayout;

  const [mergedLayout, setMergedLayout] = useState<Partial<Layout>>(
    mergeLayout(default_layout, layout ?? {}, mergeType)
  );

  // useEffect(() => {
  //   setMergedLayout((prev) => mergeLayout(prev, layout ?? {}, MergeType.RECURSIVEMERGE));
  // }, [layout, mergeType]);

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
