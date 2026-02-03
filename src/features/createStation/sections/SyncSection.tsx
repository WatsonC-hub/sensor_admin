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
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  tstype_id?: number;
};

const SyncSection = ({uuid, show, setShow, tstype_id}: Props) => {
  const [meta, setState, deleteState, sync] = useCreateStationStore((state) => [
    state.formState.location?.meta,
    state.setState,
    state.deleteState,
    state.formState.timeseries?.[uuid].sync,
  ]);

  const {isMobile} = useBreakpoints();
  const id = `timeseries.${uuid}.sync`;

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
        <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
          {!isMobile && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setShow(false);
                deleteState(`timeseries.${uuid}.sync`);
              }}
            >
              <RemoveCircleOutline fontSize="small" />
            </IconButton>
          )}
          <Grid2 container size={12} spacing={1}>
            <Grid2 size={12}>
              <SyncForm
                mode="add"
                loctype_id={meta?.loctype_id}
                tstype_id={tstype_id ?? undefined}
                id={id}
                values={sync}
                setValues={(values) => setState(`timeseries.${uuid}.sync`, values)}
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
          Tilføj synkronisering
        </Typography>
      </Button>
    </Box>
  );
};

export default SyncSection;
