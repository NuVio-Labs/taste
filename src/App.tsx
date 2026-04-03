import { Outlet } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { Suspense } from "react";
import { RouteSpeedInsights } from "./components/analytics/RouteSpeedInsights";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Spinner } from "./components/ui/Spinner";

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

export default function AppShell() {
  return (
    <ErrorBoundary>
      <RouteSpeedInsights />
      <Suspense fallback={<AppLoadingScreen />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}
