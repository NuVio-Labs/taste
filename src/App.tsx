import { Outlet, useLocation } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RouteSpeedInsights } from "./components/analytics/RouteSpeedInsights";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Spinner } from "./components/ui/Spinner";
import { InstallPrompt } from "./components/InstallPrompt";

export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-950 text-white">
          <ChefHat className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-neutral-500">
            Taste
          </p>
          <p className="text-sm text-neutral-600">Session wird geprüft...</p>
        </div>
        <Spinner className="h-5 w-5 text-neutral-500" />
      </div>
    </div>
  );
}

function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 18, filter: "blur(3px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: -18, filter: "blur(3px)" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ minHeight: "100dvh" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppShell() {
  return (
    <ErrorBoundary>
      <RouteSpeedInsights />
      <Suspense fallback={<AppLoadingScreen />}>
        <AnimatedOutlet />
      </Suspense>
      <InstallPrompt />
    </ErrorBoundary>
  );
}
