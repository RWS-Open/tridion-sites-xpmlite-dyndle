import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.tsx";
import ErrorBoundary from "./Components/ErrorBoundary";
import { store } from "./store/index.ts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("xpmlite")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
