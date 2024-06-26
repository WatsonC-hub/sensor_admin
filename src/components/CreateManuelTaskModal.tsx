import React from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
} from '@mui/material';
import {ErrorOutlineOutlined} from '@mui/icons-material';

import Button from '~/components/Button';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import FormInput from './FormInput';
import {useTaskMutation} from '~/hooks/query/useTaskMutation';
import {useParams} from 'react-router-dom';

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
  const params = useParams();
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
  });

  const {post: createTask, markAsDone} = useTaskMutation();

  const submitTask = async (values: FormValues) => {
    await createTask.mutateAsync({
      path: params.ts_id,
      data: {
        opgave: values.description,
        flag: Number(values.flag),
        notify_type: values.notify_type,
      },
    });
    closeModal();
  };

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
                <ErrorOutlineOutlined
                  sx={{
                    color: '#d32f2f',
                  }}
                />
                Kritisk
              </Box>
            </MenuItem>
            <MenuItem value="2">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <ErrorOutlineOutlined
                  sx={{
                    color: '#FF6C00',
                  }}
                />
                Middel
              </Box>
            </MenuItem>
            <MenuItem value="1">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <ErrorOutlineOutlined
                  sx={{
                    color: '#ffb13f',
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
          />

          <FormInput select label="Type" name="notify_type" fullWidth margin="dense">
            <MenuItem value="primary">Primær</MenuItem>
            <MenuItem value="obs">Sekundær</MenuItem>
            <MenuItem value="station">Station</MenuItem>
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
