import {zodResolver} from '@hookform/resolvers/zod';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {Notification} from '~/hooks/query/useNotificationOverview';
import {useTaskMutation} from '~/hooks/query/useTaskMutation';

interface Props {
  open: boolean;
  closeModal: () => void;
  notification: Notification;
}

const zodSchema = z.object({
  ts_id: z.number(),
  notification_id: z.number(),
  status: z.enum(['POSTPONED']),
  enddate: z.string().nullish(),
  notify_type: z.enum(['obs', 'primary', 'station']).nullish(),
});

type FormValues = z.infer<typeof zodSchema>;

const UpdateNotificationModal = ({open, closeModal, notification}: Props) => {
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      ts_id: notification.ts_id,
      notification_id: notification.notification_id,
      status: 'POSTPONED',
      enddate: notification.enddate,
      notify_type: 'obs',
    },
  });

  const {update} = useTaskMutation();

  const submitTask = async (values: FormValues) => {
    await update.mutateAsync([
      {
        ts_id: values.ts_id,
        notification_id: values.notification_id,
        status: values.status,
        enddate: moment(values.enddate).toISOString(),
        notify_type: values.notify_type,
      },
    ]);
    closeModal();
  };

  return (
    <Dialog open={open} onClose={closeModal}>
      <FormProvider {...formMethods}>
        <DialogTitle>Opdater opgave</DialogTitle>
        <DialogContent
          sx={{
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <FormInput
            name="enddate"
            label="Udskyd opgave til"
            fullWidth
            type="datetime-local"
            required
            sx={{
              mb: 2,
            }}
            // error={pejlingOutOfRange}
            // warning={() => (pejlingOutOfRange ? 'Dato ligger uden for et målepunkt' : '')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} bttype="tertiary">
            Annuller
          </Button>
          <Button onClick={formMethods.handleSubmit(submitTask)} bttype="primary">
            Registrer
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default UpdateNotificationModal;
