import {RemoveCircleOutline, AddCircleOutline} from '@mui/icons-material';
import {Typography, Box, IconButton} from '@mui/material';
import React from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import SlaForm from '../forms/SlaForm';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
};

const SlaSection = ({show, setShow}: Props) => {
  const {isMobile} = useBreakpoints();

  const [deleteState, setState] = useCreateStationStore((state) => [
    state.deleteState,
    state.setState,
  ]);

  return (
    <>
      {show && (
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  setShow(false);
                  deleteState(`location.sla`);
                }}
              >
                <Typography variant="body2" color="grey.700">
                  SLA (Service Level Agreement)
                </Typography>
              </Button>
            ) : (
              'SLA (Service Level Agreement)'
            )
          }
          labelPosition={isMobile ? -22 : -20}
          sx={{width: '100%', p: 1}}
        >
          <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
            {!isMobile && (
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setShow(false);
                  deleteState(`location.sla`);
                }}
              >
                <RemoveCircleOutline fontSize="small" />
              </IconButton>
            )}
            <SlaForm
              setValues={(values) => {
                setState('location.sla', values);
              }}
            />
          </Box>
        </FormFieldset>
      )}
      {!show && (
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
              setShow(true);
            }}
          >
            <Typography variant="body1" color="primary">
              Tilføj SLA (Service Level Agreement)
            </Typography>
          </Button>
        </Box>
      )}
    </>
  );
};

export default SlaSection;
