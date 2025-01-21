import {Typography, Box} from '@mui/material';
import moment from 'moment';
import React from 'react';

import {TaskChanges, TaskStatus, TaskUser} from '~/features/tasks/types';

type Props = {
  taskChanges: TaskChanges;
  taskUsers: Array<TaskUser> | undefined;
  taskStatus: Array<TaskStatus> | undefined;
};

enum FieldsMap {
  'name' = 'Navn',
  'status_id' = 'Status',
  'due_date' = 'Dato',
  'assigned_to' = 'Ansvarlig',
  'description' = 'Beskrivelse',
  'block_all' = 'Bloker alle',
  'block_on_location' = 'Bloker på lokation',
}

const TaskInfoChanges = ({taskChanges, taskUsers, taskStatus}: Props) => {
  let old_value: string | undefined = taskChanges.old_value;
  let new_value: string | undefined = taskChanges.new_value;
  const field_name = Object.entries(FieldsMap).find(
    (value) => value[0] === taskChanges.field_name
  )?.[1];
  if (taskChanges.field_name === 'due_date') {
    if (old_value) old_value = moment(old_value).format('YYYY-MM-DD');
    if (new_value) new_value = moment(new_value).format('YYYY-MM-DD');
  }

  if (taskChanges.field_name === 'assigned_to') {
    if (old_value)
      old_value = taskUsers?.find((user) => user.id === taskChanges.old_value)?.display_name;
    if (new_value)
      new_value = taskUsers?.find((user) => user.id === taskChanges.new_value)?.display_name;
  }

  if (taskChanges.field_name === 'status_id') {
    if (old_value)
      old_value = taskStatus?.find((status) => status.id === parseInt(taskChanges.old_value))?.name;
    if (new_value)
      new_value = taskStatus?.find((status) => status.id === parseInt(taskChanges.new_value))?.name;
  }

  return (
    <Box display="flex" justifyContent="space-between" key={taskChanges.id} flexDirection={'row'}>
      <ChangeText
        old_value={old_value}
        new_value={new_value}
        field_name={field_name}
        taskChanges={taskChanges}
      />

      <Typography variant="body2">
        {moment(taskChanges.created_at).format('YYYY-MM-DD HH:mm')}
      </Typography>
    </Box>
  );
};

interface ChangeTextProps {
  old_value: string | undefined;
  new_value: string | undefined;
  field_name: FieldsMap | undefined;
  taskChanges: TaskChanges;
}

const ChangeText = ({old_value, new_value, field_name, taskChanges}: ChangeTextProps) => {
  let text = '';
  if (taskChanges.field_name !== 'description') {
    if (old_value && old_value !== 'None' && new_value && new_value !== 'None')
      text = `ændrede ${field_name} fra ${old_value} til ${new_value}`;
    else if (old_value && old_value !== 'None' && (!new_value || new_value === 'None'))
      text = `har fjernet værdien ${old_value} fra ${field_name} feltet`;
    else text = `har givet ${field_name} værdien ${new_value}`;
  } else {
    text = `opdaterede ${field_name}`;
  }

  return (
    <Typography whiteSpace={'pre-line'} variant="body2" sx={{wordWrap: 'break-word'}}>
      <b>{taskChanges.initials} </b> {text}
    </Typography>
  );
};

export default TaskInfoChanges;
