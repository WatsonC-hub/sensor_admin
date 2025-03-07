import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
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
import usePermissions from '~/features/permissions/api/usePermissions';

const unitSchema = z.object({
  timeseries: z.object({
    tstype_id: z.number(),
  }),
  unit: z
    .object({
      unit_uuid: z.string(),
      gid: z.number().optional(),
      startdate: z.string(),
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
});

type Unit = z.infer<typeof unitSchema>;

const EditUnit = () => {
  const {ts_id, loc_id} = useAppContext(['ts_id'], ['loc_id']);
  const {data: metadata} = useTimeseriesData();
  const {data: unit_history} = useUnitHistory();
  const [selectedUnit, setSelectedUnit] = useState<number | ''>(unit_history?.[0]?.gid ?? '');

  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const metadataEditUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/update_unit/${ts_id}`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['udstyr', ts_id]});
      queryClient.invalidateQueries({queryKey: ['metadata', ts_id]});
    },
  });

  const unit = unit_history?.find((item) => item.gid == selectedUnit);

  const {data: defaultValues} = unitSchema.safeParse({
    timeseries: {
      tstype_id: metadata?.tstype_id,
    },
    unit: {
      startdate: moment(unit?.startdato).format('YYYY-MM-DDTHH:mm'),
      enddate: moment(unit?.slutdato).format('YYYY-MM-DDTHH:mm'),
      gid: unit?.gid,
      unit_uuid: unit?.uuid,
    },
  });

  const formMethods = useForm<Unit>({
    resolver: zodResolver(unitSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
  });

  const {
    formState: {isDirty},
    getValues,
    reset,
  } = formMethods;

  useEffect(() => {
    if (unit_history != undefined) {
      reset(defaultValues);
    }
  }, [unit_history]);

  useEffect(() => {
    if (metadata != undefined && unit !== undefined && ts_id !== undefined) {
      reset(defaultValues);
    }
  }, [selectedUnit]);

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
    <Box maxWidth={1080}>
      <FormProvider {...formMethods}>
        <UdstyrReplace selected={selectedUnit} setSelected={setSelectedUnit} />
        <UnitForm mode="edit" />
        <footer>
          <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
            <Button
              bttype="tertiary"
              disabled={disabled}
              onClick={() => {
                reset(defaultValues);
              }}
            >
              Annuller
            </Button>

            <Button
              bttype="primary"
              disabled={!isDirty || !getValues('unit.unit_uuid') || disabled}
              onClick={formMethods.handleSubmit(handleSubmit)}
              startIcon={<SaveIcon />}
              sx={{marginRight: 1}}
            >
              Gem
            </Button>
          </Box>
        </footer>
      </FormProvider>
    </Box>
  );
};

export default EditUnit;
