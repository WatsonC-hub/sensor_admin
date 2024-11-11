import {Box, Grid, Typography} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import FormInput from '~/components/FormInput';

import {useTaskComments} from '../api/useTaskComments';

const taskCommentSchema = z.object({
  id: z.string().optional(),
  task_id: z.string().optional(),
  comment: z.string().min(0, 'Kommentar feltet skal udfyldes'),
});

const initialValues: InferTaskComment = {
  id: '',
  task_id: '',
  comment: '',
};

type InferTaskComment = z.infer<typeof taskCommentSchema>;

interface TaskInfoCommentFormProps {
  selectedTaskId: string;
}

const TaskInfoCommentForm = ({selectedTaskId}: TaskInfoCommentFormProps) => {
  const {
    get: {data: taskComments},
    post: postComment,
  } = useTaskComments(selectedTaskId);

  const schemaData = taskCommentSchema.safeParse(initialValues);

  const formMethods = useForm<InferTaskComment>({
    defaultValues: schemaData.success ? schemaData.data : {},
  });
  if (!taskComments) return <div></div>;
  console.log(taskComments);

  const {handleSubmit} = formMethods;

  const submit: SubmitHandler<InferTaskComment> = async (values) => {
    const payload = {
      data: {
        task_id: selectedTaskId,
        comment: values.comment,
      },
    };
    console.log(payload);
    postComment.mutate(payload);
  };

  return (
    <Grid container flexDirection={'column'} justifyContent={'space-between'}>
      <Grid item xs={12} mb={2}>
        <Box display={'flex'} flexDirection={'column'} gap={2}>
          {taskComments.map((taskComment) => (
            <Grid container key={taskComment.id} flexDirection={'row'} spacing={1}>
              <Grid item xs={2}>
                <Typography variant="body2">{`${taskComment.initials}: `}</Typography>
              </Grid>
              <Grid item xs={7} alignSelf={'center'}>
                <Typography variant="body2">{`${taskComment.comment}`}</Typography>
              </Grid>
              <Grid item xs={3} alignSelf={'center'}>
                <Box display={'flex'} flexDirection={'row'} justifySelf={'center'} gap={1}>
                  <Typography variant="body2">
                    {moment(taskComment.created_at).format('YYYY-MM-DD')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <FormProvider {...formMethods}>
          <FormInput
            fullWidth
            name="comment"
            label={'Kommentar'}
            multiline
            onKeyDownCallback={handleSubmit(submit, (e) => console.log(e))}
          />
        </FormProvider>
      </Grid>
    </Grid>
  );
};

export default TaskInfoCommentForm;
