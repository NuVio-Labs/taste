import { ChefHat } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/Button";

type AppShellProps = {
  children: ReactNode;
  onLogout: () => Promise<void>;
};

export function AppShell({ children, onLogout }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-10 mb-8 rounded-3xl border border-neutral-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <ChefHat className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Taste
                </p>
                <h1 className="text-lg font-semibold tracking-tight">
                  Dashboard
                </h1>
              </div>
            </div>

            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
