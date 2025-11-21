import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import {useQuery, useMutation} from '@tanstack/react-query';
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

const UnitEndDateDialog = ({openDialog, setOpenDialog, unit}: UnitEndDateDialogProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const {superUser} = useUser();

  let unitEndSchema;

  const requiredUnitEndSchema = z.object({
    enddate: zodDayjs('slutdato er påkrævet').refine((date) => date.isAfter(unit?.startdato), {
      message: 'Slutdato skal være efter startdato',
    }),
    change_reason: z.number({required_error: 'Vælg årsag'}).optional(),
    action: z.string({required_error: 'Vælg handling'}).optional(),
    comment: z.string().optional(),
  });
  unitEndSchema = requiredUnitEndSchema;

  type UnitEndFormValues = z.infer<typeof unitEndSchema>;

  const {data: parsed} = unitEndSchema.safeParse({
    ...unit,
    enddate: dayjs(),
  });

  if (!superUser) {
    unitEndSchema = unitEndSchema.omit({
      change_reason: true,
      action: true,
    });
  }

  if (superUser) {
    unitEndSchema = unitEndSchema.refine(
      (data) => 'change_reason' in data && data.change_reason !== undefined,
      {
        path: ['change_reason'],
        message: 'Vælg årsag',
      }
    );
  }

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
    enabled: superUser,
    staleTime: 1000 * 60 * 60,
  });

  const {data: actions} = useQuery<Action[]>({
    queryKey: queryKeys.actions(unit?.uuid),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit-actions/${unit?.uuid}`);
      return data;
    },
    enabled: superUser && !!unit?.uuid,
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
    onSuccess: () => {
      handleClose();
      toast.success('Udstyret er hjemtaget');
    },
    meta: {
      invalidates: [['register'], ['metadata']],
    },
  });

  const submit = (values: UnitEndFormValues) => {
    takeHomeMutation.mutate(values);
  };

  return (
    <Dialog open={openDialog} onClose={handleClose}>
      <DialogTitle>Angiv information</DialogTitle>
      <DialogContent sx={{width: 300, display: 'flex', flexDirection: 'column', gap: 1}}>
        <FormProvider {...formMethods}>
          <FormDateTime name="enddate" label="Fra" required minDate={dayjs(unit?.startdato)} />

          {superUser && (
            <>
              <FormInput
                name="change_reason"
                fullWidth
                select
                label="Årsag"
                options={changeReasons?.map((reason) => ({[reason.id]: reason.reason}))}
                keyType="number"
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
              />

              <FormInput
                name="action"
                fullWidth
                select
                label="Handling"
                placeholder="Handling"
                options={actions?.map((action) => ({[action.action]: action.label}))}
              />

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
