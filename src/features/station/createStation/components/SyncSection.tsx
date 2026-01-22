import {Box, Grid2, IconButton, Typography} from '@mui/material';
import React from 'react';
import {FieldArrayWithId, UseFieldArrayUpdate} from 'react-hook-form';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {FormState} from '~/helpers/CreateStationContextProvider';
import useCreateStationContext from '../api/useCreateStationContext';
import JupiterDmpSync from '~/features/synchronization/components/JupiterDmpSync';
import Button from '~/components/Button';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';

type Props = {
  index: number;
  SyncIndex: Array<number>;
  setSyncIndex: React.Dispatch<React.SetStateAction<Array<number>>>;
  removeSyncAtIndex: (index: number, validate?: boolean) => void;
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>;
  setValue: (value: SyncFormValues | undefined) => void;
  update: UseFieldArrayUpdate<{timeseries: FormState['timeseries'] | undefined}, 'timeseries'>;
};

const SyncSection = ({
  index,
  SyncIndex,
  setSyncIndex,
  removeSyncAtIndex,
  field,
  setValue,
  update,
}: Props) => {
  const {meta, onValidate} = useCreateStationContext();
  const timeseriesHasSync = SyncIndex.includes(index);
  const {isMobile} = useBreakpoints();

  return (
    <>
      {timeseriesHasSync ? (
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  removeSyncAtIndex(index, true);
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
                  removeSyncAtIndex(index, true);
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
                  tstype_id={field.tstype_id ?? undefined}
                  values={field.sync}
                  onValidate={(key, data) => {
                    update(index, {...field, sync: {...field.sync, ...data}});
                    onValidate(key, data, index);
                    setValue(data);
                  }}
                />
              </Grid2>
            </Grid2>
          </Box>
        </FormFieldset>
      ) : (
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
              setSyncIndex((prev) => [...prev, index]);
            }}
          >
            <Typography variant="body1" color="primary">
              Tilføj synkronisering
            </Typography>
          </Button>
        </Box>
      )}
    </>
  );
};

export default SyncSection;
