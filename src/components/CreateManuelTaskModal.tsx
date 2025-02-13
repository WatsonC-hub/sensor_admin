import {zodResolver} from '@hookform/resolvers/zod';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem} from '@mui/material';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useTaskMutation} from '~/hooks/query/useTaskMutation';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';

interface Props {
  open: boolean;
  closeModal: () => void;
}

const zodSchema = z.object({
  flag: z.enum(['1', '2', '3']),
  description: z
    .string()
    .max(60, 'Beskrivelsen må maks være 60 tegn')
    .min(12, 'Beskrivelsen skal være mindst 12 tegn'),
  notify_type: z.enum(['obs', 'primary', 'station']),
});

type FormValues = z.infer<typeof zodSchema>;

const CreateManuelTaskModal = ({open, closeModal}: Props) => {
  const {ts_id} = useAppContext(['ts_id']);
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      flag: '1',
      description: '',
      notify_type: 'primary',
    },
  });

  const {post: createTask} = useTaskMutation();

  const submitTask = async (values: FormValues) => {
    await createTask.mutateAsync(
      {
        path: ts_id,
        data: {
          opgave: values.description,
          flag: Number(values.flag),
          notify_type: values.notify_type,
        },
      },
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );
    closeModal();
  };

  const descriptionLength = formMethods.watch('description')?.length;
  const flag = formMethods.watch('flag');

  return (
    <Dialog open={open} onClose={closeModal}>
      <FormProvider {...formMethods}>
        <DialogTitle>Registrer opgave</DialogTitle>
        <DialogContent
          sx={{
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <FormInput select label="Niveau" name="flag" fullWidth margin="dense">
            <MenuItem value="3">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <NotificationIcon
                  iconDetails={{
                    flag: 3,
                  }}
                />
                Kritisk
              </Box>
            </MenuItem>
            <MenuItem value="2">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <NotificationIcon
                  iconDetails={{
                    flag: 2,
                  }}
                />
                Middel
              </Box>
            </MenuItem>
            <MenuItem value="1">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <NotificationIcon
                  iconDetails={{
                    flag: 1,
                  }}
                />
                Lav
              </Box>
            </MenuItem>
          </FormInput>

          <FormInput
            label="Beskrivelse"
            name="description"
            type="text"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            inputProps={{maxLength: 60}}
            placeholder="Skriv en kort beskrivelse af opgaven"
            helperText={`${descriptionLength}/60 tegn`}
          />

          <FormInput
            select
            label="Type"
            name="notify_type"
            fullWidth
            margin="dense"
            InputProps={{
              sx: {
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  alignContent: 'center',
                  gap: 1,
                },
              },
            }}
          >
            <MenuItem value="primary" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <NotificationIcon
                iconDetails={{
                  flag: Number(flag),
                }}
              />
              Primær
            </MenuItem>
            <MenuItem value="obs" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <NotificationIcon
                iconDetails={{
                  flag: Number(flag),
                  notify_type: 'obs',
                }}
              />
              Sekundær
            </MenuItem>
            <MenuItem value="station" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <NotificationIcon
                iconDetails={{
                  flag: 0,
                }}
              />
              Station
            </MenuItem>
          </FormInput>
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

export default CreateManuelTaskModal;
