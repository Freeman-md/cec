import React from "react";
import ReactDOM from "react-dom/client";
import "bulma/css/bulma.min.css";
import "./design/design-tokens.css";
import "./styles.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
