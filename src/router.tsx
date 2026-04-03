import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import AppShell, { AppLoadingScreen } from "./App";
import { useAuth } from "./features/auth/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const FavoritesPage = lazy(() =>
  import("./pages/FavoritesPage").then((module) => ({
    default: module.FavoritesPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ImprintPage = lazy(() =>
  import("./pages/ImprintPage").then((module) => ({
    default: module.ImprintPage,
  })),
);
const InspirationPage = lazy(() =>
  import("./pages/InspirationPage").then((module) => ({
    default: module.InspirationPage,
  })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const RecipeDetailPage = lazy(() =>
  import("./pages/RecipeDetailPage").then((module) => ({
    default: module.RecipeDetailPage,
  })),
);
const RecipesPage = lazy(() =>
  import("./pages/RecipesPage").then((module) => ({
    default: module.RecipesPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ResetPasswordPage").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const ShoppingListPage = lazy(() =>
  import("./pages/ShoppingListPage").then((module) => ({
    default: module.ShoppingListPage,
  })),
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((module) => ({
    default: module.SignupPage,
  })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((module) => ({
    default: module.TermsPage,
  })),
);

function IndexRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      { path: "reset-password", element: <ResetPasswordPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "favorites", element: <FavoritesPage /> },
          { path: "inspiration", element: <InspirationPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "recipes", element: <RecipesPage /> },
          { path: "recipes/:id", element: <RecipeDetailPage /> },
          { path: "shopping-list", element: <ShoppingListPage /> },
        ],
      },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "imprint", element: <ImprintPage /> },
      { index: true, element: <IndexRedirect /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
