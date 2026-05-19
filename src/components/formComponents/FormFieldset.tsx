import {SxProps, Typography, TypographyProps} from '@mui/material';

import Box from '@mui/material/Box';
import {merge} from 'lodash';
import React from 'react';

type Props = {
  children: React.ReactNode;
  sx?: SxProps;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  legendProps?: TypographyProps;
};

const FormFieldset = ({children, sx = {}, label, icon, onClick, legendProps}: Props) => {
  const legend_props = {
    position: 'relative',
    backgroundColor: 'background.paper',
    color: 'grey.700',
    px: 1,
    fontSize: '0.875rem',
  };
  const merged_legend_props = merge({}, legend_props, legendProps);

  const fieldset_sx = merge(
    {},
    {
      border: '2px solid',
      borderColor: 'grey.300',
      borderRadius: 2,
      p: 2,
      mt: 1,
    },
    sx
  );

  return (
    <Box component={'fieldset'} sx={fieldset_sx}>
      <Typography
        component={'legend'}
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        {...legendProps}
        sx={merged_legend_props}
      >
        {label}
        <Box onClick={onClick} display={'flex'} alignItems={'center'} sx={{cursor: 'pointer'}}>
          {icon}
        </Box>
      </Typography>
      {children}
    </Box>
  );
};

export default FormFieldset;
