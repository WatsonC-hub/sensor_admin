import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Dialog, DialogTitle, DialogContent, MenuItem, DialogActions} from '@mui/material';
import {useQueryClient, useQuery, useMutation} from '@tanstack/react-query';
import moment from 'moment';
import {useForm, FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import {useAppContext} from '~/state/contexts';

const unitEndSchema = z.object({
  enddate: z.string(),
  change_reason: z.number({required_error: 'Vælg årsag'}),
  action: z.string({required_error: 'Vælg handling'}),
  comment: z.string({required_error: 'Skriv en kommentar'}),
});

type UnitEndFormValues = z.infer<typeof unitEndSchema>;

interface UnitEndDateDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  unit: any;
}

type ChangeReason = {id: number; reason: string; default_actions: string | null};

type Action = {action: string; label: string};

const UnitEndDateDialog = ({openDialog, setOpenDialog, unit}: UnitEndDateDialogProps) => {
  const queryClient = useQueryClient();
  const {ts_id} = useAppContext(['ts_id']);
  const user = useUser();

  const formMethods = useForm<UnitEndFormValues>({
    resolver: zodResolver(unitEndSchema),
    defaultValues: {enddate: moment().toISOString()},
  });

  const handleClose = () => {
    setOpenDialog(false);
    formMethods.reset({enddate: moment().toISOString()});
  };

  const {data: changeReasons} = useQuery<ChangeReason[]>({
    queryKey: ['change_reasons'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/change-reasons`);
      return data;
    },
    enabled: user?.superUser,
    staleTime: 1000 * 60 * 10,
  });

  const {data: actions} = useQuery<Action[]>({
    queryKey: ['actions', unit?.uuid],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit-actions/${unit.uuid}`);
      return data;
    },
    enabled: user?.superUser && !!unit?.uuid,
    staleTime: 1000 * 60 * 10,
  });

  const takeHomeMutation = useMutation({
    mutationFn: async (payload: UnitEndFormValues) => {
      const {data} = await apiClient.post(
        `/sensor_field/stamdata/unit_history/end/${ts_id}/${unit.gid}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      handleClose();
      toast.success('Udstyret er hjemtaget');
      queryClient.invalidateQueries({queryKey: ['udstyr', ts_id]});
    },
  });

  const submit = (values: UnitEndFormValues) => {
    values.enddate = moment(values.enddate).toISOString();
    takeHomeMutation.mutate(values);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Angiv information</DialogTitle>
      <DialogContent sx={{width: 300, display: 'flex', flexDirection: 'column', gap: 1}}>
        <FormProvider {...formMethods}>
          <FormInput
            name="enddate"
            label="Fra"
            fullWidth
            type="datetime-local"
            required
            warning={(value) => {
              if (moment(value) < moment(unit?.startdato)) {
                return 'Vælg dato efter startdato';
              }
            }}
            inputProps={{min: moment(unit?.startdato).format('YYYY-MM-DDTHH:mm')}}
          />

          {user?.superUser && (
            <>
              <FormInput
                name="change_reason"
                fullWidth
                select
                label="Årsag"
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
              >
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
            onClick={formMethods.handleSubmit(submit)}
          >
            Gem
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default UnitEndDateDialog;
