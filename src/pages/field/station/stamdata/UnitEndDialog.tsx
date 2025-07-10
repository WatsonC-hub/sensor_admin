import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Dialog, DialogTitle, DialogContent, MenuItem, DialogActions} from '@mui/material';
import {useQueryClient, useQuery, useMutation} from '@tanstack/react-query';
import dayjs from 'dayjs';
import moment from 'moment';
import {useForm, FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FormDateTime from '~/components/FormDateTime';
import FormInput from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import {UnitHistory} from '~/features/stamdata/api/useUnitHistory';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {zodDayjs} from '~/helpers/schemas';
import {useAppContext} from '~/state/contexts';

interface UnitEndDateDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  unit: UnitHistory | undefined;
}

type ChangeReason = {id: number; reason: string; default_actions: string | null};

type Action = {action: string; label: string};

const onTakeHomeMutation = (ts_id: number) => {
  return {
    meta: {
      invalidates: [
        queryKeys.Timeseries.availableUnits(ts_id),
        queryKeys.Location.timeseries(ts_id),
        queryKeys.Timeseries.metadata(ts_id),
        queryKeys.Map.all(),
        queryKeys.Tasks.all(),
        queryKeys.AvailableUnits.all(),
      ],
    },
  };
};

const UnitEndDateDialog = ({openDialog, setOpenDialog, unit}: UnitEndDateDialogProps) => {
  const queryClient = useQueryClient();
  const {ts_id} = useAppContext(['ts_id']);
  const user = useUser();

  let unitEndSchema;

  const requiredUnitEndSchema = z.object({
    enddate: zodDayjs('slutdato er påkrævet'),
    change_reason: z.number({required_error: 'Vælg årsag'}).default(-1),
    action: z.string({required_error: 'Vælg handling'}).default('-1'),
    comment: z.string().optional(),
  });
  type UnitEndFormValues = z.infer<typeof requiredUnitEndSchema>;

  unitEndSchema = requiredUnitEndSchema;

  if (!user?.superUser) {
    unitEndSchema = unitEndSchema.omit({
      change_reason: true,
      action: true,
    });
  }

  unitEndSchema = unitEndSchema.refine(
    (data) => {
      // Ensure enddate is after unit start date
      return data.enddate.isAfter(unit?.startdato);
    },
    {
      message: 'Enddato skal være efter startdato',
    }
  );

  const {data: parsed} = unitEndSchema.safeParse({
    ...unit,
    enddate: dayjs(),
  });

  const formMethods = useForm<UnitEndFormValues>({
    resolver: zodResolver(unitEndSchema),
    defaultValues: parsed,
  });

  const handleClose = () => {
    setOpenDialog(false);
    formMethods.reset({enddate: moment().toISOString()});
  };

  const {data: changeReasons} = useQuery<ChangeReason[]>({
    queryKey: queryKeys.changeReasons(),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/change-reasons`);
      return data;
    },
    enabled: user?.superUser,
    staleTime: 1000 * 60 * 60,
  });

  const {data: actions} = useQuery<Action[]>({
    queryKey: queryKeys.actions(unit?.uuid),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit-actions/${unit?.uuid}`);
      return data;
    },
    enabled: user?.superUser && !!unit?.uuid,
    staleTime: 1000 * 60 * 60,
  });

  const takeHomeMutation = useMutation({
    mutationFn: async (payload: UnitEndFormValues) => {
      const {data} = await apiClient.post(
        `/sensor_field/stamdata/unit_history/end/${ts_id}/${unit?.gid}`,
        payload
      );
      return data;
    },
    onMutate: () => onTakeHomeMutation(ts_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      handleClose();
      toast.success('Udstyret er hjemtaget');
    },
  });

  const submit = (values: UnitEndFormValues) => {
    takeHomeMutation.mutate(values);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Angiv information</DialogTitle>
      <DialogContent sx={{width: 300, display: 'flex', flexDirection: 'column', gap: 1}}>
        <FormProvider {...formMethods}>
          <FormDateTime name="enddate" label="Fra" required minDate={dayjs(unit?.startdato)} />

          {user?.superUser && (
            <>
              <FormInput
                name="change_reason"
                fullWidth
                select
                label="Årsag"
                slotProps={{
                  select: {
                    displayEmpty: true,
                  },
                }}
                placeholder="Vælg årsag"
                onChangeCallback={(e) => {
                  const reason = changeReasons?.find(
                    (reason) =>
                      reason.id === Number((e as React.ChangeEvent<HTMLInputElement>).target.value)
                  );
                  if (reason) {
                    if (reason.default_actions?.includes('CLOSE')) {
                      const action = actions?.find((action) => action.action.includes('CLOSE'));
                      if (action) {
                        formMethods.setValue('action', action.action);
                      }
                    } else {
                      formMethods.setValue('action', reason.default_actions ?? 'DO_NOTHING');
                    }
                  }
                }}
              >
                <MenuItem value={-1} disabled>
                  <em>Vælg årsag</em>
                </MenuItem>
                {changeReasons?.map((reason) => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.reason}
                  </MenuItem>
                ))}
              </FormInput>

              <FormInput
                name="action"
                fullWidth
                select
                label="Handling"
                placeholder="Handling"
                // disabled={formMethods.watch('change_reason') !== 1}
                slotProps={{
                  select: {
                    displayEmpty: true,
                  },
                }}
              >
                <MenuItem value={'-1'} disabled>
                  <em>Vælg handling</em>
                </MenuItem>
                {actions?.map((action) => (
                  <MenuItem key={action.action} value={action.action}>
                    {action.label}
                  </MenuItem>
                ))}
              </FormInput>

              <FormInput
                name="comment"
                label="Kommentar"
                fullWidth
                multiline
                rows={4}
                placeholder="Skriv en kommentar"
              />
            </>
          )}
        </FormProvider>
        <DialogActions>
          <Button bttype="tertiary" onClick={handleClose}>
            Annuller
          </Button>
          <Button
            bttype="primary"
            startIcon={<SaveIcon />}
            onClick={formMethods.handleSubmit(submit, (errors) => {
              console.log(errors);
            })}
          >
            Gem
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default UnitEndDateDialog;
