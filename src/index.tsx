import {CssBaseline, StyledEngineProvider, ThemeProvider} from '@mui/material';
import * as Sentry from '@sentry/react';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {NuqsAdapter} from 'nuqs/adapters/react';
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {PostHogProvider} from 'posthog-js/react';

// @ts-expect-error this is a workaround for the missing types
import {registerSW} from 'virtual:pwa-register';

import NetworkStatus from '~/components/NetworkStatus';
import {persister, queryClient} from '~/queryClient';
import theme from '~/theme';

import App from './App';

import '~/index.css';
import {CommandProvider} from './features/commandpalette/components/CommandContext';
import moment from 'moment';
import 'moment/locale/da';
import dayjs from 'dayjs';
import dayDA from 'dayjs/locale/da';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);
dayjs.locale('da', dayDA);
moment.locale('da');

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://bed215865bd94af0a00cf106f9e990b0@o4504178973474816.ingest.sentry.io/4504178982715392',
    integrations: [Sentry.browserTracingIntegration()],
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

const container = document.getElementById('root');
if (!container) {
  throw new Error('No root element found');
}
const root = createRoot(container);

root.render(
  <BrowserRouter>
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
            <PostHogProvider
              apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
              options={{
                api_host: '/events',
                capture_exceptions: true,
                debug: import.meta.env.MODE === 'development',
                opt_out_capturing_by_default: import.meta.env.MODE === 'development',
                autocapture: import.meta.env.MODE !== 'development',
              }}
            >
              <CommandProvider>
                <NuqsAdapter>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="da">
                    <App />
                  </LocalizationProvider>
                </NuqsAdapter>
              </CommandProvider>
            </PostHogProvider>
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
  </BrowserRouter>
);
