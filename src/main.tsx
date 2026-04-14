import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { AuthProvider } from "./features/auth/AuthProvider";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";

registerSW({
  onRegistered(registration) {
    if (!registration) return;
    // Periodic sync every 60 minutes
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Analytics />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
