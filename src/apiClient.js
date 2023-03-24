import axios from 'axios';
import {authStore} from 'src/state/store';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use(
  function (config) {
    // Add csrf token to request header
    config.headers['X-CSRF-TOKEN'] = authStore.getState().csrfToken;
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
    // const originalRequest = error.config;
    if (error.response.status === 401) {
      authStore.setState({authenticated: false, loginExpired: true});
      return Promise.resolve(error);
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export {apiClient};
