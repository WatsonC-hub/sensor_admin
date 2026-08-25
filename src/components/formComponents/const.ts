import {createContext} from 'react';

import type {GridBaseProps} from '@mui/material';

export const FormContext = createContext<{
  gridSizes?: GridBaseProps['size'];
}>({
  gridSizes: {mobile: 12, laptop: 6},
});
