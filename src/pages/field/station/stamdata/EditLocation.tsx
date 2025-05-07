import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import {initial} from 'lodash';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import LocationForm from '~/features/stamdata/components/stamdata/LocationForm';
import {locationSchema} from '~/helpers/zodSchemas';
import {useLocationData} from '~/hooks/query/useMetadata';
import {queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

const editLocationSchema = locationSchema.extend({
  location: locationSchema.shape.location.extend({
    initial_project_no: z.string().nullish(),
  }),
  unit: z.object({
    unit_uuid: z.string().nullish(),
  }),
});

type Location = z.infer<typeof editLocationSchema>;

const EditLocation = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {data: metadata} = useLocationData();
  const {data: unit_history} = useUnitHistory();
  const {location_permissions} = usePermissions(loc_id);

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

  const {data: defaultValues} = editLocationSchema.safeParse({
    location: {
      ...metadata,
      initial_project_no: metadata?.projectno,
    },
    unit: {
      unit_uuid: unit_history?.[0]?.uuid,
    },
  });

  const formMethods = useForm<Location>({
    resolver: zodResolver(editLocationSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
  });

  const {
    formState: {isDirty, isValid},
    reset,
  } = formMethods;

  useEffect(() => {
    if (metadata != undefined) {
      reset(defaultValues);
    }
  }, [metadata, unit_history]);

  const handleSubmit = async (data: Location) => {
    const payload = {
      ...data.location,
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
        <LocationForm mode="edit" disable={location_permissions !== 'edit'} />
        <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
          <Button
            bttype="tertiary"
            onClick={() => reset(defaultValues)}
            disabled={location_permissions !== 'edit'}
          >
            Annuller
          </Button>

          <Button
            bttype="primary"
            disabled={!isDirty || !isValid || location_permissions !== 'edit'}
            onClick={formMethods.handleSubmit(handleSubmit)}
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
