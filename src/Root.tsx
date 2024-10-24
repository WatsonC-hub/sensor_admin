import {CssBaseline} from '@mui/material';
import {QueryClient} from '@tanstack/react-query';
import {Axios} from 'axios';
import React, {useEffect} from 'react';
import {LoaderFunctionArgs, Outlet, redirect, useLoaderData, useNavigation} from 'react-router-dom';

import NavBar from './components/NavBar';
import {getUserQueryOptions, useAuth} from './hooks/query/useAuth';
import {RemoveTrailingSlash} from './RemoveTrailingSlash';
import {LoaderFunction} from './types';

export const loader: LoaderFunction<any> =
  ({queryClient}) =>
  async () => {
    return await queryClient.ensureQueryData(getUserQueryOptions);
  };

const Root = () => {
  const {
    getUser: {data},
  } = useAuth();

  const navigation = useNavigation();

  useEffect(() => {
    const ele = document.getElementById('ipl-progress-indicator');
    if (ele) {
      // fade out
      ele.classList.add('available');
      setTimeout(() => {
        // remove from DOM
        // ele.outerHTML = '';
      }, 2000);
    }
  }, []);

  console.log('data', data);

  return (
    <>
      {/* <RemoveTrailingSlash /> */}
      {navigation.state === 'loading' && <div>Loading....</div>}
      <NavBar />
      <CssBaseline />
      <Outlet />
    </>
  );
};

export default Root;
