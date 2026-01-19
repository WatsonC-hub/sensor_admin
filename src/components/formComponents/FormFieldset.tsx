import Box from '@mui/material/Box';
import React from 'react';

type Props = {
  children: React.ReactNode;
  sx?: object;
  label: React.ReactNode;
  icon?: React.ReactNode;
  labelPosition?: number;
  onClick?: () => void;
};

const FormFieldset = ({children, sx = {}, label, icon, labelPosition = -28, onClick}: Props) => {
  return (
    <Box
      sx={{
        // position: 'relative',
        border: '2px solid',
        borderColor: 'grey.300',
        borderRadius: 2,
        padding: 2,
        marginTop: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: 'fit-content',
        height: 'fit-content',
        ...sx,
      }}
    >
      <Box display={'flex'} flexDirection={'row'} justifyContent="space-between">
        <Box
          component="legend"
          sx={{
            position: 'relative',
            top: labelPosition,
            //   left: 5,
            width: 'fit-content',
            height: 'fit-content',
            backgroundColor: 'background.paper',
            color: 'grey.700',
            px: 1,
            fontSize: '0.875rem',
            mb: -4,
          }}
        >
          {label}
        </Box>
        {icon && (
          <Box
            component="legend"
            sx={{
              position: 'relative',
              top: -28,
              //   left: 5,
              right: 5,
              width: 'fit-content',
              height: 'fit-content',
              backgroundColor: 'background.paper',
              color: 'grey.700',
              mb: -4,
            }}
          >
            <Box onClick={onClick} sx={{cursor: 'pointer'}}>
              {icon}
            </Box>
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
};

export default FormFieldset;
