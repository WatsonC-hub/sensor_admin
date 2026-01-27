import React, {useState} from 'react';
import {LocationController} from '../controller/types';
import Button from '~/components/Button';
import {RemoveCircleOutline, AddCircleOutline} from '@mui/icons-material';
import {Typography, Box, IconButton} from '@mui/material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';
import LocationAccessForm from '../forms/LocationAccessForm';

type Props = {
  controller: LocationController | undefined;
};

const LocationAccessSection = ({controller}: Props) => {
  const [show, setShow] = useState(false);

  const {isMobile} = useBreakpoints();
  if (show)
    return (
      <FormFieldset
        label={
          isMobile ? (
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                setShow(false);
                controller?.unregisterSlice('location_access');
              }}
            >
              <Typography variant="body2" color="grey.700">
                Adgangsnøgler
              </Typography>
            </Button>
          ) : (
            'Adgangsnøgler'
          )
        }
        labelPosition={isMobile ? -22 : -20}
        sx={{width: '100%', p: 1}}
      >
        <Box display="flex" flexDirection="row" gap={1}>
          {!isMobile && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setShow(false);
                controller?.unregisterSlice('location_access');
              }}
            >
              <RemoveCircleOutline />
            </IconButton>
          )}
          <LocationAccessForm controller={controller} />
        </Box>
      </FormFieldset>
    );

  return (
    <Box>
      <Button
        bttype="primary"
        startIcon={<AddCircleOutline color="primary" />}
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          border: 'none',
          px: 0.5,
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setShow(true);
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj adgangsnøgle
        </Typography>
      </Button>
    </Box>
  );
};

export default LocationAccessSection;
