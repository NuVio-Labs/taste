import { Navigate, Outlet } from "react-router-dom";
import { AppLoadingScreen } from "../App";
import { useAuth } from "../features/auth/useAuth";
import { canAccess, type Feature } from "../features/plan/entitlements";
import { useProfile } from "../features/profile/useProfile";

type ProRouteProps = {
  feature: Feature;
  redirectTo?: string;
};

export function ProRoute({ feature, redirectTo = "/dashboard" }: ProRouteProps) {
  const { session } = useAuth();
  const userId = session?.user.id ?? "";
  const { profile, isLoading } = useProfile(userId);

  if (isLoading) return <AppLoadingScreen />;

  const plan = profile?.plan ?? "free";
  if (!canAccess(plan, feature)) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
