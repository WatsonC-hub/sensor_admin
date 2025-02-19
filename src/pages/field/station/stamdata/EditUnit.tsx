import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

import UdstyrReplace from './UdstyrReplace';

const unitSchema = z.object({
  unit: z
    .object({
      unit_uuid: z.string(),
      startdate: z.string(),
      gid: z.number().optional(),
      enddate: z.string(),
    })
    .superRefine((unit, ctx) => {
      if (moment(unit.startdate) > moment(unit.enddate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: 'start dato må ikke være senere end slut dato',
          path: ['startdate'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: 'slut dato må ikke være tidligere end start datoo',
          path: ['enddate'],
        });
      }
    }),
  timeseries: z.object({
    tstype_id: z.number(),
  }),
});

type Unit = z.infer<typeof unitSchema>;

const EditUnit = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: metadata} = useTimeseriesData();
  const {data: unit_history} = useUnitHistory();

  const metadataEditUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/update_unit/${ts_id}`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['udstyr', ts_id]});
    },
  });

  const unit = unit_history?.[0];

  const parsed = unitSchema.safeParse({
    timeseries: {
      tstype_id: metadata?.tstype_id,
    },
    unit: {
      startdate: unit?.startdato,
      enddate: unit?.slutdato,
      gid: unit?.gid,
      unit_uuid: unit?.uuid,
    },
  });

  const {data: defaultValues = {}} = parsed;

  const formMethods = useForm<Unit>({
    resolver: zodResolver(unitSchema),
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

  const handleSubmit = async (data: Unit) => {
    const payload = {
      ...data.unit,
      startdate: moment(data.unit.startdate).toISOString(),
      enddate: moment(data.unit.enddate).toISOString(),
    };
    metadataEditUnitMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['metadata', ts_id],
        });
        toast.success('Udstyr er opdateret');
      },
    });
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <UdstyrReplace />
        <UnitForm mode="edit" />
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

export default EditUnit;
