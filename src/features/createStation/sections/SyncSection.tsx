import {Box, Grid2, IconButton, Typography} from '@mui/material';
import React from 'react';
import useCreateStationContext from '../api/useCreateStationContext';
import JupiterDmpSync from '~/features/synchronization/components/JupiterDmpSync';
import Button from '~/components/Button';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {AggregateController} from '../controller/AggregateController';
import {TimeseriesPayload} from '../controller/types';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  controller: AggregateController<TimeseriesPayload>;
};

const SyncSection = ({show, setShow, controller}: Props) => {
  const {meta} = useCreateStationContext();
  const {isMobile} = useBreakpoints();
  const values = controller.getValues();
  const tstype_id = values.meta?.tstype_id;

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
                controller.unregisterSlice('sync');
                setShow(false);
              }}
            >
              <Typography variant="body2" color="grey.700">
                Synkronisering
              </Typography>
            </Button>
          ) : (
            'Synkronisering'
          )
        }
        labelPosition={isMobile ? -22 : -20}
        sx={{width: '100%', p: 1}}
      >
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          {!isMobile && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                controller.unregisterSlice('sync');
                setShow(false);
              }}
            >
              <RemoveCircleOutline />
            </IconButton>
          )}
          <Grid2 container size={12} spacing={1}>
            <Grid2 size={12}>
              <JupiterDmpSync
                mode="add"
                loctype_id={meta?.loctype_id}
                tstype_id={tstype_id ?? undefined}
                values={values.sync}
                controller={controller}
                onValidChange={(isValid, value) => {
                  controller.updateSlice('sync', isValid, value);
                }}
              />
            </Grid2>
          </Grid2>
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
          Tilføj synkronisering
        </Typography>
      </Button>
    </Box>
  );
};

export default SyncSection;
