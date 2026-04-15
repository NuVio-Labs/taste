import { Navigate, useLocation } from "react-router-dom";
import { AppLoadingScreen } from "../App";
import { useAuth } from "../features/auth/useAuth";
import { ProtectedLayout } from "../components/layout/ProtectedLayout";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <ProtectedLayout />;
}
