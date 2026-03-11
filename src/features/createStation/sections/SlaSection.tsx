import {RemoveCircleOutline, AddCircleOutline} from '@mui/icons-material';
import {Typography, Box, IconButton} from '@mui/material';
import React from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import SlaForm from '../forms/SlaForm';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import {useCreateStationStore} from '../state/useCreateStationStore';

const SlaSection = () => {
  const {isMobile} = useBreakpoints();

  const [deleteState, setState, resetState, sla] = useCreateStationStore((state) => [
    state.deleteState,
    state.setState,
    state.resetState,
    state.formState.location?.sla,
  ]);

  const show = sla !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        <Box display="flex">
          <SlaForm
            setValues={(values) => {
              setState('location.sla', values);
            }}
          />
          <Button
            bttype="tertiary"
            startIcon={<RemoveCircleOutline color="primary" />}
            sx={{
              width: 'fit-content',
              borderWidth: 0,
            }}
            onClick={() => {
              deleteState('location.sla');
            }}
          >
            <Typography variant="body1" color="primary">
              Senere
            </Typography>
          </Button>
        </Box>
      </Box>
    );

  return (
    <Box alignItems={'center'}>
      <Button
        bttype="primary"
        startIcon={<AddCircleOutline color="primary" />}
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          border: 'none',
          px: 1,
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          resetState('location.sla');
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj SLA (Service Level Agreement)
        </Typography>
      </Button>
    </Box>
  );
};

export default SlaSection;
