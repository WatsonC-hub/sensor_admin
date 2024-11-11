import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Notification} from '~/hooks/query/useNotificationOverview';

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

  const {updateNotification} = useTasks();

  const submitTask = async (values: FormValues) => {
    await updateNotification.mutateAsync([
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
        <DialogTitle>Opdater notifikation</DialogTitle>
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
            label="Udskyd notifikation til"
            fullWidth
            type="datetime-local"
            required
            sx={{
              mb: 2,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} bttype="tertiary">
            Annuller
          </Button>
          <Button
            onClick={formMethods.handleSubmit(submitTask)}
            bttype="primary"
            startIcon={<Save />}
          >
            Udskyd
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default UpdateNotificationModal;
