import {Box} from '@mui/material';
import React from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import FormInput from '~/components/FormInput';
import {useTaskHistory} from '~/features/tasks/api/useTaskHistory';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskInfoChanges from '~/features/tasks/components/TaskInfoChanges';
import TaskInfoComment from '~/features/tasks/components/TaskInfoComment';

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
    get: {data: taskHistory},
    addTaskComment,
  } = useTaskHistory(selectedTaskId);
  const {
    getUsers: {data: taskUsers},
    getStatus: {data: taskStatus},
  } = useTasks();

  const schemaData = taskCommentSchema.safeParse(initialValues);

  const formMethods = useForm<InferTaskComment>({
    defaultValues: schemaData.success ? schemaData.data : {},
  });

  const {handleSubmit, reset} = formMethods;

  const submit: SubmitHandler<InferTaskComment> = async (values) => {
    if (values.comment !== '') {
      const payload = {
        data: {
          task_id: selectedTaskId,
          comment: values.comment,
        },
      };
      addTaskComment.mutate(payload);
      reset();
    }
  };

  return (
    <Box display="flex" flexDirection="column" maxHeight={'100%'} gap={2}>
      <Box
        // maxHeight={'100%'}
        display={'flex'}
        flexDirection={'column'}
        gap={2}
        sx={{overflowY: 'auto', overflowX: 'hidden'}}
      >
        {taskHistory?.map((row) => {
          if ('comment' in row) return <TaskInfoComment key={row.id} comment={row} />;
          else
            return (
              <TaskInfoChanges
                key={row.id}
                taskChanges={row}
                taskUsers={taskUsers}
                taskStatus={taskStatus}
              />
            );
        })}
      </Box>
      <Box>
        <FormProvider {...formMethods}>
          <FormInput
            fullWidth
            name="comment"
            label={'Kommentar'}
            disabled={selectedTaskId.includes(':')}
            multiline
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const callback = handleSubmit(submit, (e) => console.log(e));
                callback(e);
              }
            }}
          />
        </FormProvider>
      </Box>
    </Box>
  );
};

export default TaskInfoCommentForm;
