import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import TimeseriesForm from '~/features/stamdata/components/stamdata/TimeseriesForm';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

const timeseriesSchema = z.object({
  location: z.object({
    loc_name: z.string().nullable(),
  }),
  timeseries: z.object({
    prefix: z.string().nullable(),
    sensor_depth_m: z.number().nullable(),
    tstype_id: z.number({required_error: 'Vælg tidsserietype'}),
  }),
});

type Timeseries = z.infer<typeof timeseriesSchema>;

const EditTimeseries = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: metadata} = useTimeseriesData();

  const metadataEditTimeseriesMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
  });

  const {data: defaultValues} = timeseriesSchema.safeParse({
    timeseries: {
      prefix: metadata?.prefix,
      sensor_depth_m: metadata?.sensor_depth_m,
      tstype_id: metadata?.tstype_id,
    },
    location: {
      loc_name: metadata?.loc_name,
    },
  });

  const formMethods = useForm<Timeseries>({
    resolver: zodResolver(timeseriesSchema),
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
  }, [metadata]);

  const handleSubmit = async (data: Timeseries) => {
    const payload = {
      tstype_id: data.timeseries.tstype_id,
      sensor_depth_m: data.timeseries.sensor_depth_m,
      prefix: data.timeseries.prefix,
    };
    metadataEditTimeseriesMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['metadata', ts_id],
        });
        toast.success('Tidsserie er opdateret');
      },
    });
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <TimeseriesForm mode="edit" />
        <footer>
          <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
            <Button bttype="tertiary" onClick={() => reset(defaultValues)}>
              Annuller
            </Button>

            <Button
              bttype="primary"
              disabled={!isDirty || !isValid}
              onClick={formMethods.handleSubmit(handleSubmit)}
              startIcon={<SaveIcon />}
              sx={{marginRight: 1}}
            >
              Gem
            </Button>
          </Box>
        </footer>
      </FormProvider>
    </>
  );
};

export default EditTimeseries;
