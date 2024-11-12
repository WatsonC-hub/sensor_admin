import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

// const dummyData = [
//   {
//     id: '1',
//     initials: 'Amble',
//     comment:
//       'in magna bibendum imperdiet nullam orci pede venenatis non sodales sed tincidunt eu felis fusce posuere felis sed lacus morbi',
//     created_at: '2024-01-24',
//     task_id: '1',
//   },
//   {
//     id: '2',
//     initials: 'Chery',
//     comment:
//       'quisque porta volutpat erat quisque erat eros viverra eget congue eget semper rutrum nulla nunc purus phasellus in felis donec',
//     created_at: '2024-02-21',
//     task_id: '2',
//   },
//   {
//     id: '3',
//     initials: 'Sophie',
//     comment:
//       'mauris viverra diam vitae quam suspendisse potenti nullam porttitor lacus at turpis donec posuere',
//     created_at: '2024-05-28',
//     task_id: '3',
//   },
//   {
//     id: '4',
//     initials: 'Yasmeen',
//     comment:
//       'ac neque duis bibendum morbi non quam nec dui luctus rutrum nulla tellus in sagittis dui',
//     created_at: '2024-07-19',
//     task_id: '4',
//   },
//   {
//     id: '5',
//     initials: 'Tulley',
//     comment:
//       'pretium iaculis justo in hac habitasse platea dictumst etiam faucibus cursus urna ut tellus nulla ut erat id mauris vulputate',
//     created_at: '2024-08-06',
//     task_id: '5',
//   },
//   {
//     id: '6',
//     initials: 'Izak',
//     comment:
//       'ut tellus nulla ut erat id mauris vulputate elementum nullam varius nulla facilisi cras non velit',
//     created_at: '2024-08-26',
//     task_id: '6',
//   },
// ];

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
export const useTaskComments = (task_id: string | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery<Array<TaskComment | TaskChanges>, APIError>({
    queryKey: ['taskComments'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<TaskComment | TaskChanges>>(
        `sensor_admin/tasks/comments/${task_id}`
      );
      return data;
    },
    enabled: task_id !== undefined,
  });
  const post = useMutation({
    ...taskCommentPostOptions,
    onMutate: async (mutation_data) => {
      const {data} = mutation_data;

      const previous = queryClient.getQueryData<Array<TaskComment>>(['taskComments']);

      queryClient.setQueryData<Array<TaskComment>>(
        ['taskComments'],
        [
          ...(previous ? previous : []),
          {id: '', ...data, initials: 'Hvordan?', created_at: moment().format('YYYY-MM-DD HH:mm')},
        ]
      );

      return previous;
    },
    onSuccess: () => {
      toast.success('Opgave kommentar gemt');
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskComments'],
      });
    },
  });
  const put = useMutation({
    ...taskCommentPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskComments'],
      });
      toast.success('Opgave kommentar ændret');
    },
    onMutate: async (mutation_data) => {
      const {path, data} = mutation_data;

      const previous = queryClient.getQueryData<Array<TaskComment>>(['taskComments']);

      queryClient.setQueryData<Array<TaskComment>>(
        ['taskComments'],
        previous?.map((taskComment) => {
          if (taskComment.id === path) {
            return {id: taskComment.id, ...data};
          }
          return taskComment;
        })
      );
    },
  });
  const del = useMutation({
    ...taskCommentDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskComments'],
      });
      toast.success('Opgave kommentar slettet');
    },
  });
  return {get, post, put, del};
};
