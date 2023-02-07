import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
import {ThemeProvider, StyledEngineProvider} from '@mui/material';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ToastContainer} from 'react-toastify';
import {createRoot} from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.response.status === 401 || error.response.status === 404) {
          return false;
        }
        if (failureCount < 3) {
          return true;
        }
        return false;
      },
    },
  },
});
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
            <ToastContainer />
          </QueryClientProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
