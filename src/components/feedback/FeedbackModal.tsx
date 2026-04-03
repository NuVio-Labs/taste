import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Send, X } from "lucide-react";
import { createFeedback } from "../../features/feedback/feedbackService";
import type { FeedbackCategory } from "../../features/feedback/types";

type FeedbackModalProps = {
  currentPage: string;
  onClose: () => void;
  open: boolean;
  userEmail?: string;
  userId: string;
  username?: string;
};

type PageOption = {
  label: string;
  value: string;
};

function buildPageOptions(currentPage: string): PageOption[] {
  const defaults: PageOption[] = [
    { value: "/dashboard", label: "Dashboard" },
    { value: "/recipes", label: "Rezepte" },
    { value: "/recipes/:id", label: "Rezeptdetails" },
    { value: "/profile", label: "Profil" },
  ];

  const normalizedCurrentPage = currentPage.startsWith("/recipes/")
    ? "/recipes/:id"
    : currentPage;

  const options = new Map(defaults.map((entry) => [entry.value, entry]));

  if (!options.has(normalizedCurrentPage)) {
    options.set(normalizedCurrentPage, {
      value: normalizedCurrentPage,
      label: normalizedCurrentPage,
    });
  }

  return Array.from(options.values());
}

export function FeedbackModal({
  currentPage,
  onClose,
  open,
  userEmail,
  userId,
  username,
}: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [page, setPage] = useState(currentPage);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageOptions = buildPageOptions(currentPage);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCategory("bug");
    setPage(currentPage);
    setMessage("");
    setSubmitError(null);
    setSubmitSuccess(null);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- currentPage wird nur beim Öffnen gesetzt, kein re-sync gewollt
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  async function handleSubmit() {
    const trimmedMessage = message.trim();

    setSubmitError(null);
    setSubmitSuccess(null);

    if (!trimmedMessage) {
      setSubmitError("Bitte beschreibe kurz dein Feedback.");
      return;
    }

    if (!userId) {
      setSubmitError("Kein eingeloggter Nutzer gefunden.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createFeedback({
        category,
        email: userEmail?.trim() || null,
        message: trimmedMessage,
        page,
        userAgent: window.navigator.userAgent,
        userId,
        username: username?.trim() || null,
      });

      setSubmitSuccess("Danke. Dein Feedback wurde gespeichert.");
      setMessage("");
      setCategory("bug");
      setPage(currentPage);
    } catch (feedbackError) {
      setSubmitError(
        feedbackError instanceof Error
          ? feedbackError.message
          : "Das Feedback konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Feedback schließen"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-[95] overflow-y-auto px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,74,0.12),transparent_34%)]" />

                <div className="relative z-10 border-b border-white/8 px-5 py-5 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                        <MessageSquareText size={20} />
                      </div>

                      <div>
                        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                          Nuvio Taste
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-3xl">
                          Feedback senden
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#B7AA96]">
                          Teile Bugs, Ideen oder allgemeines Feedback direkt aus der App.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#CDB99B] transition-all duration-300 hover:border-[#D6A84A]/18 hover:text-[#FFF8EE]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="relative z-10 space-y-5 px-5 py-5 sm:px-7">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                      Kategorie
                    </label>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
                      className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#171411] px-4 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]"
                    >
                      <option value="bug" className="bg-[#171411] text-[#FFF8EE]">
                        Bug
                      </option>
                      <option value="feedback" className="bg-[#171411] text-[#FFF8EE]">
                        Feedback
                      </option>
                      <option value="idea" className="bg-[#171411] text-[#FFF8EE]">
                        Idee
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                      Seite
                    </label>
                    <select
                      value={page}
                      onChange={(event) => setPage(event.target.value)}
                      className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#171411] px-4 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]"
                    >
                      {pageOptions.map((entry) => (
                        <option
                          key={entry.value}
                          value={entry.value}
                          className="bg-[#171411] text-[#FFF8EE]"
                        >
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                      Nachricht
                    </label>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={7}
                      placeholder="Was wolltest du tun, was ist passiert und auf welcher Seite warst du?"
                      className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                    />
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4 text-sm leading-7 text-[#D5C5AF]">
                    <p>
                      <span className="font-medium text-[#FFF8EE]">Benutzer:</span>{" "}
                      {username?.trim() || userEmail || userId}
                    </p>
                  </div>

                  {submitError ? (
                    <div className="rounded-[22px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
                      {submitError}
                    </div>
                  ) : null}

                  {submitSuccess ? (
                    <div className="rounded-[22px] border border-[rgba(214,168,74,0.18)] bg-[rgba(214,168,74,0.08)] px-4 py-3 text-sm text-[#F6EFE4]">
                      {submitSuccess}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
                    >
                      Abbrechen
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleSubmit();
                      }}
                      disabled={isSubmitting}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DEB457] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Send size={16} />
                      {isSubmitting ? "Sendet..." : "Feedback senden"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
