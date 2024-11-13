import {Box, Grid} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import FormInput from '~/components/FormInput';

import {useTaskComments} from '../api/useTaskComments';
import {useTasks} from '../api/useTasks';

import TaskInfoChanges from './TaskInfoChanges';
import TaskInfoComment from './TaskInfoComment';

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
  const {
    getUsers: {data: taskUsers},
    getStatus: {data: taskStatus},
  } = useTasks();

  const schemaData = taskCommentSchema.safeParse(initialValues);

  const formMethods = useForm<InferTaskComment>({
    defaultValues: schemaData.success ? schemaData.data : {},
  });

  useEffect(() => {
    console.log(taskComments);
  }, [selectedTaskId]);

  const {handleSubmit} = formMethods;

  const submit: SubmitHandler<InferTaskComment> = async (values) => {
    if (values.comment !== '') {
      const payload = {
        data: {
          task_id: selectedTaskId,
          comment: values.comment,
        },
      };
      postComment.mutate(payload);
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} mb={2} overflow={'auto'}>
        <Box display={'flex'} flexDirection={'column'} maxHeight={500} gap={2}>
          {taskComments?.map((taskComment) => {
            if ('comment' in taskComment)
              return <TaskInfoComment key={taskComment.id} comment={taskComment} />;
            else
              return (
                <TaskInfoChanges
                  key={taskComment.id}
                  taskChanges={taskComment}
                  taskUsers={taskUsers}
                  taskStatus={taskStatus}
                />
              );
          })}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <FormProvider {...formMethods}>
          <FormInput
            fullWidth
            name="comment"
            label={'Kommentar'}
            multiline
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const callback = handleSubmit(submit, (e) => console.log(e));
                callback(e);
              }
            }}
          />
        </FormProvider>
      </Grid>
    </Grid>
  );
};

export default TaskInfoCommentForm;
