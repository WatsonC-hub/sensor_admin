import {Box, Grid, Typography} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

import FormInput from '~/components/FormInput';

import {useTaskComments} from '../api/useTaskComments';

const taskCommentSchema = z.object({
  id: z.string().optional(),
  initials: z.string().length(3, 'initialer skal indeholde 3 bogstaver'),
  comment: z.string().min(1, 'Kommentar feltet skal udfyldes'),
});

const initialValues: InferTaskComment = {
  id: '',
  initials: '',
  comment: '',
};

type InferTaskComment = z.infer<typeof taskCommentSchema>;

interface TaskInfoCommentFormProps {
  selectedTaskId: string;
}

const TaskInfoCommentForm = ({selectedTaskId}: TaskInfoCommentFormProps) => {
  const {
    get: {data: taskComments},
  } = useTaskComments(selectedTaskId);

  const schemaData = taskCommentSchema.safeParse(initialValues);

  const formMethods = useForm<InferTaskComment>({
    defaultValues: schemaData.success ? schemaData.data : {},
  });
  if (!taskComments) return <div></div>;

  return (
    <Grid container flexDirection={'column'} justifyContent={'space-between'}>
      <Grid item xs={12}>
        <Box display={'flex'} flexDirection={'column'} gap={2}>
          {taskComments.map((taskComment) => (
            <Grid container key={taskComment.id} flexDirection={'row'} spacing={1}>
              <Grid item xs={1.3}>
                <Typography>{`${taskComment.initials}: `}</Typography>
              </Grid>
              <Grid item xs={7.5} alignSelf={'center'}>
                <Typography>{`${taskComment.comment}`}</Typography>
              </Grid>
              <Grid item xs={3} alignSelf={'center'}>
                <Typography>
                  {' - '}
                  {moment(taskComment.created_at).format('YYYY-MM-DD')}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <FormProvider {...formMethods}>
          <FormInput fullWidth name={'test'} multiline />
        </FormProvider>
      </Grid>
    </Grid>
  );
};

export default TaskInfoCommentForm;
