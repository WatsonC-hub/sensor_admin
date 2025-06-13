import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React from 'react';
import {FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import useLocationForm from '~/features/station/api/useLocationForm';
import StamdataLocation from '~/features/station/components/stamdata/StamdataLocation';
import {boreholeEditLocationSchema, defaultEditLocationSchema} from '~/features/station/schema';
import {useLocationData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

const EditLocation = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {data: metadata} = useLocationData();
  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const metadataEditLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_location/${loc_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['location_data', loc_id]});
      queryClient.invalidateQueries({queryKey: ['metadata', ts_id]});
    },
  });

  let schema;

  if (metadata?.loctype_id === 9) {
    schema = boreholeEditLocationSchema;
  } else {
    schema = defaultEditLocationSchema;
  }

  const {data: defaultValues} = schema.safeParse({
    ...metadata,
    initial_project_no: metadata?.projectno,
  });

  const [formMethods, LocationForm] = useLocationForm({
    formProps: {
      context: {
        loc_id: loc_id,
      },
      values: defaultValues,
    },
    mode: 'Edit',
    initialLocTypeId: metadata?.loctype_id,
  });

  const {
    formState: {isDirty, isValid},
    reset,
    handleSubmit,
  } = formMethods;

  const Submit = async (data: z.infer<typeof schema>) => {
    const payload = {
      ...data,
    };
    metadataEditLocationMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Location er opdateret');
      },
    });
  };

  return (
    <Box maxWidth={1080}>
      <FormProvider {...formMethods}>
        <StamdataLocation>
          <LocationForm size={size} loc_id={metadata?.loc_id} />
        </StamdataLocation>
        <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
          <Button
            bttype="tertiary"
            onClick={() => reset()}
            disabled={location_permissions !== 'edit'}
          >
            Annuller
          </Button>

          <Button
            bttype="primary"
            disabled={!isDirty || !isValid || location_permissions !== 'edit'}
            onClick={handleSubmit(Submit)}
            startIcon={<SaveIcon />}
            sx={{marginRight: 1}}
          >
            Gem
          </Button>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default EditLocation;
