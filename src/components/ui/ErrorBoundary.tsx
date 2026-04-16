import { Component, type ErrorInfo, type ReactNode } from "react";
import { ChefHat, RefreshCw } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    (window as unknown as { va?: (event: string, data: Record<string, string>) => void })
      .va?.("event", { name: "error_boundary", message: error.message });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0E0C] px-4 text-white">
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#E9D8B4]">
            <ChefHat className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8D7E6E]">
              Fehler
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-sm leading-6 text-[#B7AA96]">
              Ein unerwarteter Fehler ist aufgetreten. Versuche die Seite neu zu
              laden.
            </p>
          </div>

          {this.state.error ? (
            <p className="w-full rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left font-mono text-xs text-[#A99883]">
              {this.state.error.message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-6 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5"
          >
            <RefreshCw size={15} />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }
}
