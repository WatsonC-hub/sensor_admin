import {useMediaQuery, useTheme} from '@mui/material';
import {assign, merge} from 'lodash';
import {Layout} from 'plotly.js';
import {useEffect, useState} from 'react';

import {mobileLayout, desktopLayout} from '~/consts';
import {MergeType} from '~/helpers/EnumHelper';
/**
 * For nu er mergetype required. Det kan være at den måske skal være optional i fremtiden
 * Det kan være at man helst gerne vil overskrive layout med en hel anden layout som ikke skal tage udgangspunkt i default layouts
 * Måske skal der andre kriterier også?
 * Måske skal useplotlylayout ikke merge default og layout med hinanden? Det kan være at det er bedre parent tager sig af det.
 */
const usePlotlyLayout = (mergeType: MergeType, layout?: Partial<Layout>) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const default_layout = matches ? mobileLayout : desktopLayout;
  const [mergedLayout, setMergedLayout] = useState<Partial<Layout>>();

  useEffect(() => {
    if (!mergedLayout) {
      if (layout) setLayout(layout);
      else setLayout(default_layout);
    } else if (mergedLayout) {
      if (layout) setLayout(layout);
      else setLayout(default_layout);
    }
  }, [matches]);

  const setLayout = (layout: Partial<Layout>) => {
    const baseLayout = mergedLayout ? mergedLayout : default_layout;
    if (mergeType === MergeType.SHALLOWMERGE) {
      setMergedLayout(assign({}, baseLayout, layout));
    } else if (mergeType === MergeType.RECURSIVEMERGE) {
      setMergedLayout(merge({}, baseLayout, layout));
    } else {
      if (layout) setMergedLayout(layout);
      else setMergedLayout(default_layout);
    }
  };

  return [mergedLayout, setLayout] as const;
};

export default usePlotlyLayout;
