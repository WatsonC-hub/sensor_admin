import {GridBaseProps} from '@mui/material';
import {createContext} from 'react';

export const FormContext = createContext<{
  gridSizes?: GridBaseProps['size'];
}>({
  gridSizes: {mobile: 12, laptop: 6},
});
