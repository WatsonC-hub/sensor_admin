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

  const id = `timeseries.${uuid}.sync`;

  return (
    <Box display="flex" flexDirection="row" alignItems={'start'} width="100%">
      <SyncForm
        loctype_id={meta?.loctype_id}
        tstype_id={tstype_id ?? undefined}
        id={id}
        values={sync}
        setValues={(values) => setState(`timeseries.${uuid}.sync`, values)}
      />
    </Box>
  );
};

export default SyncSection;
