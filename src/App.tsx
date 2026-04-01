import { ChefHat } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "./components/ui/Spinner";
import { useAuth } from "./features/auth/useAuth";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

function AppLoadingScreen() {
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
          <p className="text-sm text-neutral-600">
            Session wird geprueft...
          </p>
        </div>
        <Spinner className="h-5 w-5 text-neutral-500" />
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
