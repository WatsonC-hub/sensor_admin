import {CssBaseline, StyledEngineProvider, ThemeProvider} from '@mui/material';
import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {registerSW} from 'virtual:pwa-register';

import NetworkStatus from '~/components/NetworkStatus';
import {persister, queryClient} from '~/queryClient';
import theme from '~/theme';

import App from './App';
import '~/index.css';
import Chooser from './Chooser';
import LocationSelector, {
  loader as locationLoader,
} from './features/station/components/LocationSelector';
import OverviewPage from './pages/field/overview/OverviewPage';
import ErrorPage from './pages/field/station/ErrorPage';
import Station, {loader as stationLoader} from './pages/field/station/Station';
import Login from './pages/login/Login';
import ProtectedRoutes from './ProtectedRoutes';
import Root, {loader as rootLoader} from './Root';
import {apiClient} from './apiClient';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://bed215865bd94af0a00cf106f9e990b0@o4504178973474816.ingest.sentry.io/4504178982715392',
    integrations: [new BrowserTracing()],
    environment: import.meta.env.VITE_ENVIRONMENT,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.2,
  });
}

if ('serviceWorker' in navigator) {
  // && !/localhost/.test(window.location)) {
  registerSW({immediate: true});
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoutes />,
    children: [
      {
        element: <Root />,
        loader: rootLoader({queryClient, apiClient}),
        // errorElement: <div>error</div>,
        children: [
          {
            path: '/',
            element: <Chooser />,
          },
          {
            path: 'field',
            children: [
              {
                path: '',
                element: <OverviewPage />,
              },
              {
                path: 'location/:locid',
                element: <LocationSelector />,
                loader: locationLoader({queryClient, apiClient}),
              },
              {
                path: 'location/:locid/:ts_id',
                element: <Station />,
                loader: stationLoader({queryClient, apiClient}),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <ErrorPage error={{message: 'Siden er ikke fundet'}} />,
  },
]);

const ele = document.getElementById('ipl-progress-indicator');
if (ele) {
  // fade out

  setTimeout(() => {
    ele.classList.add('available');
  }, 2000);
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('No root element found');
}
const root = createRoot(container);

root.render(
  // <BrowserRouter>
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{persister}}
          onSuccess={() => {
            queryClient.resumePausedMutations().then(() => {
              queryClient.resetQueries();
            });
          }}
        >
          <CssBaseline />
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer
            draggablePercent={30}
            closeOnClick
            toastStyle={{
              borderRadius: '0.5rem',
              margin: '0.5rem',
            }}
            newestOnTop={true}
            limit={3}
            autoClose={2000}
            closeButton={false}
          />
          <NetworkStatus />
        </PersistQueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>
  // </BrowserRouter>
);
