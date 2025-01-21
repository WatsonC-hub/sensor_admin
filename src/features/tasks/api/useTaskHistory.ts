import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import {DBTaskComment, PostComment, TaskChanges, TaskComment} from '../types';
interface TaskCommentBase {
  path: string;
  data?: any;
}
interface TaskCommentPost {
  data: PostComment;
}
interface TaskCommentPut extends TaskCommentBase {
  data: DBTaskComment;
}
export const taskCommentPostOptions = {
  mutationKey: ['taskComments_post'],
  mutationFn: async (mutation_data: TaskCommentPost) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/comments`, data);
    return result;
  },
};
export const taskCommentPutOptions = {
  mutationKey: ['taskComments_put'],
  mutationFn: async (mutation_data: TaskCommentPut) => {
    const {path, data} = mutation_data;
    console.log('path', path, 'data', data);
    const {data: result} = await apiClient.put(`sensor_admin/tasks/comments/${path}`, data);
    return result;
  },
};
export const taskCommentDelOptions = {
  mutationKey: ['taskComments_del'],
  mutationFn: async (mutation_data: TaskCommentBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/comments/${path}`);
    return result;
  },
};
export const useTaskHistory = (task_id: string | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery<Array<TaskComment | TaskChanges>, APIError>({
    queryKey: ['taskHistory', task_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<TaskComment | TaskChanges>>(
        `sensor_admin/tasks/comments/${task_id}`
      );
      return data;
    },
    enabled: task_id !== undefined,
  });
  const addTaskComment = useMutation({
    ...taskCommentPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskHistory', task_id],
      });
    },
  });
  const editTaskComment = useMutation({
    ...taskCommentPutOptions,
    onSuccess: () => {
      toast.success('Opgave kommentar ændret');
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskHistory', task_id],
      });
    },
    // onMutate: async (mutation_data) => {
    //   const {path, data} = mutation_data;

    //   const previous = queryClient.getQueryData<Array<TaskComment>>(['taskComments']);

    //   queryClient.setQueryData<Array<TaskComment>>(
    //     ['taskComments', task_id],
    //     previous?.map((taskComment) => {
    //       if (taskComment.id === path) {
    //         return {id: taskComment.id, ...data};
    //       }
    //       return taskComment;
    //     })
    //   );
    // },
  });
  const deleteTaskComment = useMutation({
    ...taskCommentDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskHistory', task_id],
      });
      toast.success('Opgave kommentar slettet');
    },
  });
  return {get, addTaskComment, editTaskComment, deleteTaskComment};
};
