import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppLoadingScreen } from "../App";
import { useAuth } from "../features/auth/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
