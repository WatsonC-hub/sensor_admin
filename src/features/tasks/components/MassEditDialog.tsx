import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {MRT_TableInstance} from 'material-react-table';
import React, {useState} from 'react';
import {UseFormReturn} from 'react-hook-form';

import Button from '~/components/Button';

import {useTasks} from '../api/useTasks';
import {Task} from '../types';

import TaskForm, {FormValues} from './TaskForm';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  table: MRT_TableInstance<Task>;
};

const MassEditDialog = ({open, setOpen, table}: Props) => {
  const [dueDateChecked, setDueDateChecked] = useState(true);
  const [assignedChecked, setAssignedChecked] = useState(true);
  const [statusChecked, setStatusChecked] = useState(true);

  const {
    getStatus: {data: taskStatus},
    getUsers: {data: taskUsers},
    patch,
  } = useTasks();

  const onSubmit = (data: FormValues, formMethods?: UseFormReturn<FormValues>) => {
    if (formMethods) {
      let patchData = {};

      if (dueDateChecked) patchData = {...patchData, due_date: data.due_date};

      if (assignedChecked)
        patchData = {
          ...patchData,
          assigned_to: data.assigned_to,
          assigned_display_name: taskUsers?.find((user) => user.id == data.assigned_to)
            ?.display_name,
        };

      if (statusChecked)
        patchData = {
          ...patchData,
          status_id: data.status_id,
          status_name: taskStatus?.find((status) => status.id === data.status_id)?.name,
        };

      const rows = table
        .getSelectedRowModel()
        .rows.map((row) => ({id: row.id, ts_id: row.original.ts_id}));

      if (Object.keys(patchData).length > 0) {
        rows?.forEach((row) => {
          if (row.id) {
            const submit = {
              path: row.id,
              data: {
                ...patchData,
                ts_id: row.ts_id,
              },
            };
            patch.mutate(submit, {
              onSuccess: () => {
                setOpen(false);
                setDueDateChecked(true);
                setAssignedChecked(true);
                setStatusChecked(true);
              },
            });
          }
        });
      }
    }
  };
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Masse opdatere opgaver</DialogTitle>

      <TaskForm
        onSubmit={onSubmit}
        defaultValues={{
          assigned_to: null,
          due_date: null,
          status_id: undefined,
        }}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 400,
          }}
        >
          <Box display={'flex'} flexDirection={'row'}>
            <Tooltip title="Ændre på duedate">
              <FormControlLabel
                label=""
                control={
                  <Checkbox
                    checked={dueDateChecked}
                    onChange={() => setDueDateChecked(!dueDateChecked)}
                  />
                }
              />
            </Tooltip>
            <TaskForm.DueDate disabled={!dueDateChecked} />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <Tooltip title="Ændre på tildelt">
              <FormControlLabel
                label=""
                control={
                  <Checkbox
                    checked={assignedChecked}
                    onChange={() => setAssignedChecked(!assignedChecked)}
                  />
                }
              />
            </Tooltip>
            <TaskForm.AssignedTo disabled={!assignedChecked} />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <Tooltip title="Ændre på status">
              <FormControlLabel
                label=""
                control={
                  <Checkbox
                    checked={statusChecked}
                    onChange={() => setStatusChecked(!statusChecked)}
                  />
                }
              />
            </Tooltip>
            <TaskForm.StatusSelect disabled={!statusChecked} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={() => setOpen(false)}>
            Annuller
          </Button>
          <TaskForm.SubmitButton />
        </DialogActions>
      </TaskForm>
    </Dialog>
  );
};

export default MassEditDialog;
