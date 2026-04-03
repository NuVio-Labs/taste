import { lazy, Suspense } from "react";
import { ChefHat } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Spinner } from "./components/ui/Spinner";
import { useAuth } from "./features/auth/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const FavoritesPage = lazy(() =>
  import("./pages/FavoritesPage").then((m) => ({ default: m.FavoritesPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ImprintPage = lazy(() =>
  import("./pages/ImprintPage").then((m) => ({ default: m.ImprintPage })),
);
const InspirationPage = lazy(() =>
  import("./pages/InspirationPage").then((m) => ({ default: m.InspirationPage })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const RecipeDetailPage = lazy(() =>
  import("./pages/RecipeDetailPage").then((m) => ({ default: m.RecipeDetailPage })),
);
const RecipesPage = lazy(() =>
  import("./pages/RecipesPage").then((m) => ({ default: m.RecipesPage })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const ShoppingListPage = lazy(() =>
  import("./pages/ShoppingListPage").then((m) => ({ default: m.ShoppingListPage })),
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((m) => ({ default: m.SignupPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);

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
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingScreen />}>
        <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
        </Route>

        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/imprint" element={<ImprintPage />} />

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
      </Suspense>
    </ErrorBoundary>
  );
}
