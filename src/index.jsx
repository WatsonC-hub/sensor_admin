import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, StyledEngineProvider, createTheme, adaptV4Theme } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const theme = createTheme(adaptV4Theme({
  palette: {
    mode: "light",
    primary: {
      main: "rgb(0,120,109)",
    },
    secondary: {
      main: "#FFA137",
    },
  },
  typography: {
    fontFamily: "Open Sans",
  },
}));

const queryClient = new QueryClient();

ReactDOM.render(
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
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
