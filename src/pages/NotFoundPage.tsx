import { Link, Navigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../features/auth/useAuth";

export function NotFoundPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
          Seite nicht gefunden
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Diese Route existiert noch nicht. Zurueck geht es ueber den Login.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
        >
          Zum Login
        </Link>
      </Card>
    </main>
  );
}
