import axios from 'axios';

import {queryClient} from './queryClient';
import {userQueryOptions} from './features/auth/useUser';

const apiClient = axios.create({baseURL: '/api', withCredentials: true});

apiClient.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && originalRequest.url != '/auth/me/secure') {
      queryClient.invalidateQueries({queryKey: userQueryOptions.queryKey});
    }

    return Promise.reject(error);
  }
);

export {apiClient};
