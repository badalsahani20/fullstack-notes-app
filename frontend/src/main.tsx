import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 👈 import router
import App from "./App.tsx";
import "./index.css";
import { SessionProvider } from "./providers/SessionProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </SessionProvider>
  </StrictMode>
);
