import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

function isIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(
    () =>
      !isInStandaloneMode() &&
      !sessionStorage.getItem(DISMISSED_KEY) &&
      isIOS(),
  );

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    if (isIOS()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShowBanner(false);
    setShowIOSGuide(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  }

  if (!showBanner && !showIOSGuide) return null;

  return (
    <div
      role="dialog"
      aria-label="App installieren"
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md px-4 pb-safe"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="rounded-2xl border border-neutral-800 bg-[#0F0E0C] p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900">
            <img src="/icon-192.png" alt="NuVio Taste" className="h-8 w-8 rounded-lg" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-100">
              NuVio Taste installieren
            </p>

            {showIOSGuide ? (
              <p className="mt-0.5 text-xs text-neutral-400">
                Tippe auf{" "}
                <Share className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
                <span className="font-medium text-neutral-300">Teilen</span>{" "}
                → <span className="font-medium text-neutral-300">Zum Home-Bildschirm</span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-neutral-400">
                Zum Home-Bildschirm hinzufügen für schnelleren Zugriff.
              </p>
            )}
          </div>

          <button
            onClick={dismiss}
            aria-label="Schließen"
            className="shrink-0 rounded-lg p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!showIOSGuide && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={dismiss}
              className="flex-1 rounded-xl border border-neutral-800 py-2 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
            >
              Nicht jetzt
            </button>
            <button
              onClick={handleInstall}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-100 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-white"
            >
              <Download className="h-3.5 w-3.5" />
              Installieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
