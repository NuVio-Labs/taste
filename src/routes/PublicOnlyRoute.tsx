import { Navigate, Outlet } from "react-router-dom";
import { AppLoadingScreen } from "../App";
import { useAuth } from "../features/auth/useAuth";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
