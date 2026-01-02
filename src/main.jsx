import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import store from "./store/store.js";
import { initializeAuth } from "./features/authSlice.js";

// Restore session from localStorage and set axios header
store.dispatch(initializeAuth());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
