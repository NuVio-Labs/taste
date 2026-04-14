import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Lock, ShoppingCart, LayoutGrid, X } from "lucide-react";
import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type UpgradePromptProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FunctionErrorPayload = {
  details?: string;
  error?: string;
  stage?: string;
};

const BENEFITS = [
  {
    icon: Bookmark,
    text: "Lieblingsrezepte speichern und schnell wiederfinden",
  },
  {
    icon: ShoppingCart,
    text: "Einkaufslisten direkt aus Rezepten erstellen",
  },
  {
    icon: LayoutGrid,
    text: "Persönliches Dashboard mit deinen Rezeptdaten",
  },
];

/**
 * Reusable upgrade prompt modal.
 * Shown whenever a free user attempts to access a Pro-only feature.
 *
 * TODO (payment): Replace the navigate("/profile") CTA with your Stripe
 * checkout / payment flow once payment is integrated.
 */
export function UpgradePrompt({ isOpen, onClose }: UpgradePromptProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function logFunctionErrorResponse(error: FunctionsHttpError) {
    const response = error.context;
    const status = response instanceof Response ? response.status : undefined;

    if (!(response instanceof Response)) {
      console.error("UpgradePrompt function HTTP error without response context.", error);
      return;
    }

    let responseText: string | null = null;
    let responseJson: FunctionErrorPayload | null = null;

    try {
      responseText = await response.clone().text();
    } catch (readError) {
      console.error("UpgradePrompt could not read function error response text.", readError);
    }

    try {
      responseJson = responseText ? JSON.parse(responseText) as FunctionErrorPayload : null;
    } catch {
      responseJson = null;
    }

    console.error("UpgradePrompt function HTTP error details:", {
      details: responseJson?.details,
      error: responseJson?.error,
      responseJson,
      responseText,
      stage: responseJson?.stage,
      status,
    });
  }

  async function handleUpgradeClick() {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const accessToken = session?.access_token?.trim();

      if (!session || !accessToken) {
        onClose();
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data || typeof data.url !== "string" || !data.url) {
        throw new Error("Checkout-URL konnte nicht erstellt werden.");
      }

      window.location.assign(data.url);
    } catch (error) {
      if (error instanceof FunctionsHttpError) {
        await logFunctionErrorResponse(error);
      }

      console.error("Stripe checkout could not be started.", error);
      setErrorMessage(
        "Der Checkout konnte gerade nicht gestartet werden. Bitte versuche es erneut.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-[95] flex items-center justify-center px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[#D6A84A]/10 px-3 py-1">
                    <Lock size={11} className="text-[#D6A84A]" />
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#F6D78E]">
                      Nur mit Pro
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE]">
                    Dein persönlicher Rezeptbereich
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#B7AA96]">
                    Speichere Favoriten, plane deinen Einkauf und greife
                    jederzeit auf deinen persönlichen Bereich zu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#CDB99B] transition-all duration-300 hover:border-[#D6A84A]/18 hover:text-[#FFF8EE]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Benefits */}
              <div className="mt-5 space-y-2">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.025] px-4 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#D6A84A]">
                      <Icon size={15} />
                    </div>
                    <p className="text-sm text-[#D5C5AF]">{text}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
                >
                  Später
                </button>
                {errorMessage ? (
                  <p className="text-sm leading-6 text-[#f1b6a8] sm:mr-auto sm:self-center">
                    {errorMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleUpgradeClick}
                  disabled={isLoading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D6A84A]/24 bg-[linear-gradient(180deg,rgba(214,168,74,0.22),rgba(214,168,74,0.12))] px-6 text-sm font-semibold text-[#FFF1D4] shadow-[0_8px_20px_rgba(214,168,74,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/34 hover:shadow-[0_12px_28px_rgba(214,168,74,0.16)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                >
                  {isLoading ? "Wird vorbereitet..." : "Pro entdecken"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
