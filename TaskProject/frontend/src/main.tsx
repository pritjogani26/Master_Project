import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MasterLogoutListener from "./components/MasterLogoutListener";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MasterLogoutListener />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
