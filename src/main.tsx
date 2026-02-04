import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry for error monitoring
Sentry.init({
  dsn: "https://acaeba63f35301591a12577f91a43f69@o4510829963378688.ingest.us.sentry.io/4510829981663232",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring - capture 10% of transactions
  tracesSampleRate: 0.1,
  // Session Replay - capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Environment
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(<App />);
