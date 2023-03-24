import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
import {ThemeProvider, StyledEngineProvider} from '@mui/material';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {QueryClientProvider} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {ToastContainer} from 'react-toastify';
import {createRoot} from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';
import {registerSW} from 'virtual:pwa-register';
import NetworkStatus from './components/NetworkStatus';
import {queryClient, persister} from './queryClient';

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
  registerSW({
    onNeedRefresh() {
      if (confirm('Opdatering tilgængelig. Vil du opdatere?')) {
        updateSW(true);
      }
    },
  });
}

const container = document.getElementById('root');
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
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
            <ToastContainer />
            <NetworkStatus />
          </PersistQueryClientProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </React.StrictMode>
  </BrowserRouter>
);
