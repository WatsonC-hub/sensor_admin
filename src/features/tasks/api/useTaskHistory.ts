import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import {DBTaskComment, PostComment, TaskChanges, TaskComment} from '../types';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
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
const taskCommentPostOptions = {
  mutationKey: ['taskComments_post'],
  mutationFn: async (mutation_data: TaskCommentPost) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/comments`, data);
    return result;
  },
};
const taskCommentPutOptions = {
  mutationKey: ['taskComments_put'],
  mutationFn: async (mutation_data: TaskCommentPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`sensor_admin/tasks/comments/${path}`, data);
    return result;
  },
};
const taskCommentDelOptions = {
  mutationKey: ['taskComments_del'],
  mutationFn: async (mutation_data: TaskCommentBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/comments/${path}`);
    return result;
  },
};
export const useTaskHistory = (task_id: string) => {
  const queryClient = useQueryClient();
  const get = useQuery<Array<TaskComment | TaskChanges>, APIError>({
    queryKey: queryKeys.Tasks.taskHistory(task_id),
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
        queryKey: queryKeys.Tasks.taskHistory(task_id),
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
        queryKey: queryKeys.Tasks.taskHistory(task_id),
      });
    },
  });
  const deleteTaskComment = useMutation({
    ...taskCommentDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Tasks.taskHistory(task_id),
      });
      toast.success('Opgave kommentar slettet');
    },
  });
  return {get, addTaskComment, editTaskComment, deleteTaskComment};
};
