import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {useEffect} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {authStore} from '~/state/store';

export const getUserQueryOptions = queryOptions({
  queryKey: ['getUser'],
  queryFn: async () => {
    const {data} = await apiClient.get('/auth/me/secure');
    return data;
  },
});

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [setAuthenticated, setAuthorization, setLoginExpired, resetState] = authStore((state) => [
    state.setAuthenticated,
    state.setAuthorization,
    state.setLoginExpired,
    state.resetState,
  ]);

  const login = useMutation({
    mutationKey: ['login'],
    mutationFn: async (inputdata: {username: string; password: string}) => {
      const formData = new FormData();
      formData.append('username', inputdata.username);
      formData.append('password', inputdata.password);

      const {data} = await apiClient.post('/auth/login/secure', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return data;
    },
    onSuccess: (data) => {
      setAuthorization(data);
      setAuthenticated(true);
      setLoginExpired(false);
      toast.success('Logged in successfully');
    },
  });

  const logOut = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await apiClient.get('/auth/logout/secure');
    },
    onSuccess: () => {
      queryClient.clear();
      resetState();
    },
  });

  const passwordReset = useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: async (body: {email: string}) => {
      const currentUrl = window.location.href;
      const {data} = await apiClient.post(`/admin/forgot-password?redirect=${currentUrl}`, body);
      return data;
    },
  });

  const getUser = useQuery(getUserQueryOptions);

  const {error} = getUser;

  useEffect(() => {
    console.log('error', error);
    if (error) {
      resetState();
    }
  }, [error, resetState]);

  return {login, logOut, passwordReset, getUser};
};
