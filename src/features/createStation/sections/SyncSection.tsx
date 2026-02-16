import {Box, Grid2, IconButton, Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';
import SyncForm from '../forms/SyncForm';

type Props = {
  uuid: string;
  tstype_id?: number;
};

const SyncSection = ({uuid, tstype_id}: Props) => {
  const [meta, setState, deleteState, sync] = useCreateStationStore((state) => [
    state.formState.location?.meta,
    state.setState,
    state.deleteState,
    state.formState.timeseries?.[uuid].sync,
  ]);

  const {isMobile} = useBreakpoints();
  const id = `timeseries.${uuid}.sync`;

  const show = sync !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState(`timeseries.${uuid}.sync`);
            }}
          >
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        )}
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  deleteState(`timeseries.${uuid}.sync`);
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
          <Grid2 container size={12} spacing={1}>
            <Grid2 size={12}>
              <SyncForm
                loctype_id={meta?.loctype_id}
                tstype_id={tstype_id ?? undefined}
                id={id}
                values={sync}
                setValues={(values) => setState(`timeseries.${uuid}.sync`, values)}
              />
            </Grid2>
          </Grid2>
        </FormFieldset>
      </Box>
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
          px: 1,
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setState(`timeseries.${uuid}.sync`, {});
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
