import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, Plus, Timer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatRecipeIngredientAmount,
  type RecipeDetailData,
} from "../../features/recipes/types";

type Props = {
  recipe: RecipeDetailData;
  servings: number;
  onClose: () => void;
};

// Extract minutes from step text — matches patterns like "10 Minuten", "2 Min", "1 Stunde", "1,5 Stunden"
function extractMinutes(text: string): number | null {
  const hourMatch = text.match(/(\d+(?:[.,]\d+)?)\s*Stunden?/i);
  if (hourMatch) {
    const h = parseFloat(hourMatch[1].replace(",", "."));
    return Math.round(h * 60);
  }
  const minMatch = text.match(/(\d+(?:[.,]\d+)?)\s*Min(?:uten?)?\.?/i);
  if (minMatch) {
    return Math.round(parseFloat(minMatch[1].replace(",", ".")));
  }
  return null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function requestNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    await Notification.requestPermission().catch(() => {});
  }
}

function fireTimerNotification(recipeTitle: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  new Notification("Timer fertig!", {
    body: `${recipeTitle} — Zeit ist um.`,
    icon: "/icon-192.png",
    tag: "cooking-timer",
  });
}

export function CookingMode({ recipe, servings, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  // For smooth arc animation independent of React re-renders
  const [arcProgress, setArcProgress] = useState(1);
  const [isManualTimerOpen, setIsManualTimerOpen] = useState(false);
  const [manualMinutes, setManualMinutes] = useState(10);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerStartRef = useRef<number | null>(null);
  const timerDurationRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(1);
  const totalSteps = recipe.steps.length;
  const isIngredientStep = step === 0;
  const currentStep = recipe.steps[step - 1];
  const detectedMinutes = currentStep ? extractMinutes(currentStep.text) : null;

  // Keep screen on while cooking
  useEffect(() => {
    if ("wakeLock" in navigator) {
      void navigator.wakeLock.request("screen").then((lock) => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    }
    return () => { void wakeLockRef.current?.release(); };
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && "wakeLock" in navigator) {
        void navigator.wakeLock.request("screen").then((lock) => {
          wakeLockRef.current = lock;
        }).catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);


  // rAF loop for smooth arc
  useEffect(() => {
    if (!timerRunning) return;
    const totalMs = timerDurationRef.current * 1000;

    function tick() {
      if (timerStartRef.current === null) return;
      const elapsed = performance.now() - timerStartRef.current;
      const remaining = Math.max(0, 1 - elapsed / totalMs);
      setArcProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [timerRunning]);

  // Seconds countdown + finish
  useEffect(() => {
    if (!timerRunning) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          setTimerDone(true);
          setArcProgress(0);
          if ("vibrate" in navigator) navigator.vibrate([400, 200, 400, 200, 400]);
          fireTimerNotification(recipe.title);
          try {
            const ctx = new AudioContext();
            const beep = (startAt: number, freq: number, duration: number) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.value = freq;
              gain.gain.setValueAtTime(0.4, startAt);
              gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
              osc.start(startAt);
              osc.stop(startAt + duration);
            };
            beep(ctx.currentTime, 880, 0.18);
            beep(ctx.currentTime + 0.25, 880, 0.18);
            beep(ctx.currentTime + 0.5, 1100, 0.35);
          } catch { /* AudioContext not available */ }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timerRunning, recipe.title]);

  function stopAll() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }

  function startTimer(minutes: number) {
    void requestNotificationPermission();
    const totalSecs = minutes * 60;
    timerDurationRef.current = totalSecs;
    timerStartRef.current = performance.now();
    pausedProgressRef.current = 1;
    setTimerSeconds(totalSecs);
    setArcProgress(1);
    setTimerDone(false);
    setTimerRunning(true);
  }

  function handleStartTimer() {
    if (detectedMinutes === null) return;
    startTimer(detectedMinutes);
  }

  function handleStartManualTimer() {
    stopAll();
    setIsManualTimerOpen(false);
    startTimer(manualMinutes);
  }

  function handleTogglePause() {
    if (timerRunning) {
      // Pause: snapshot current progress
      pausedProgressRef.current = arcProgress;
      timerStartRef.current = null;
      setTimerRunning(false);
    } else {
      // Resume: adjust start time so arc continues from where it was
      const elapsed = (1 - pausedProgressRef.current) * timerDurationRef.current * 1000;
      timerStartRef.current = performance.now() - elapsed;
      setTimerRunning(true);
    }
  }

  function handleStopTimer() {
    stopAll();
    setTimerRunning(false);
    setTimerSeconds(null);
    setTimerDone(false);
    setArcProgress(1);
    pausedProgressRef.current = 1;
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setTimerSeconds(null);
    setTimerRunning(false);
    setTimerDone(false);
    setArcProgress(1);
    pausedProgressRef.current = 1;
  }

  function handleNext() {
    if (step < totalSteps) { resetTimer(); setStep((s) => s + 1); }
  }

  function handlePrev() {
    if (step > 0) { resetTimer(); setStep((s) => s - 1); }
  }

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  }

  const servingRatio = recipe.servings && recipe.servings > 0 ? servings / recipe.servings : 1;

  function scaleAmount(amountValue: string): string {
    const num = parseFloat(amountValue.replace(",", "."));
    if (!isFinite(num)) return amountValue;
    const scaled = num * servingRatio;
    return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1).replace(/\.0$/, "");
  }

  const timerActive = timerSeconds !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0F0E0C] text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8D7E6E]">Kochmodus</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-[#FFF8EE]">{recipe.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/8">
        <motion.div
          className="h-full bg-[#D6A84A]"
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isIngredientStep ? (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="px-5 py-8"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">Vorbereitung</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE]">
                Zutaten
              </h2>
              <p className="mt-1 text-sm text-[#8D7E6E]">
                {servings} {servings === 1 ? "Portion" : "Portionen"}
              </p>
              <div className="mt-6 space-y-3">
                {recipe.ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4"
                  >
                    <span className="text-base font-medium text-[#FFF8EE]">{ingredient.name}</span>
                    <span className="shrink-0 text-base text-[#D5C5AF]">
                      {ingredient.amountValue
                        ? `${scaleAmount(ingredient.amountValue)}${ingredient.amountNote ? ` ${ingredient.amountNote}` : ""}`
                        : formatRecipeIngredientAmount(ingredient)}{" "}
                      {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex min-h-full flex-col px-5 py-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D6A84A]/24 bg-[#D6A84A]/10 text-lg font-bold text-[#F6D78E]">
                  {step}
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#8D7E6E]">
                  Schritt {step} von {totalSteps}
                </p>
              </div>

              <p className="mt-8 text-2xl leading-[1.55] tracking-[-0.02em] text-[#F0E6D4] sm:text-3xl sm:leading-[1.5]">
                {currentStep?.text}
              </p>

              {/* Timer */}
              {detectedMinutes !== null ? (
                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    {!timerActive ? (
                      <motion.button
                        key="start"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        type="button"
                        onClick={handleStartTimer}
                        className="inline-flex items-center gap-3 rounded-[22px] border border-[#D6A84A]/24 bg-[#D6A84A]/8 px-5 py-4 text-[#F6D78E] transition-all duration-200 hover:bg-[#D6A84A]/14"
                      >
                        <Timer size={18} />
                        <span className="text-sm font-semibold">
                          Timer starten — {detectedMinutes} {detectedMinutes === 1 ? "Minute" : "Minuten"}
                        </span>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="running"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-6 py-4"
                      >
                        {/* Circular timer */}
                        {(() => {
                          const size = 180;
                          const stroke = 6;
                          const r = (size - stroke) / 2;
                          const circ = 2 * Math.PI * r;
                          const dash = timerDone ? 0 : circ * arcProgress;
                          return (
                            <div className="relative" style={{ width: size, height: size }}>
                              <svg width={size} height={size} className="-rotate-90">
                                {/* Track */}
                                <circle
                                  cx={size / 2}
                                  cy={size / 2}
                                  r={r}
                                  fill="none"
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeWidth={stroke}
                                />
                                {/* Progress */}
                                <circle
                                  cx={size / 2}
                                  cy={size / 2}
                                  r={r}
                                  fill="none"
                                  stroke={timerDone ? "#F6D78E" : "#D6A84A"}
                                  strokeWidth={stroke}
                                  strokeLinecap="round"
                                  strokeDasharray={circ}
                                  strokeDashoffset={circ - dash}
                                  style={{ transition: "stroke 0.4s ease" }}
                                />
                              </svg>
                              {/* Center content */}
                              <div
                                aria-live="polite"
                                aria-atomic="true"
                                className="absolute inset-0 flex flex-col items-center justify-center"
                              >
                                <p className={`text-4xl font-bold tabular-nums tracking-[-0.04em] ${timerDone ? "text-[#F6D78E]" : "text-[#FFF8EE]"}`}>
                                  {timerDone ? "✓" : formatTime(timerSeconds ?? 0)}
                                </p>
                                <p className="mt-1 text-xs text-[#6B5E4E]">
                                  {timerDone ? "Fertig!" : timerRunning ? "läuft" : "pausiert"}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                          {!timerDone ? (
                            <button
                              type="button"
                              onClick={handleTogglePause}
                              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
                            >
                              {timerRunning ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                  <rect x="2" y="2" width="4" height="10" rx="1"/>
                                  <rect x="8" y="2" width="4" height="10" rx="1"/>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                  <path d="M4 2.5l8 4.5-8 4.5V2.5z"/>
                                </svg>
                              )}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={handleStopTimer}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual timer sheet */}
      <AnimatePresence>
        {isManualTimerOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Schließen"
              onClick={() => setIsManualTimerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0 z-20 rounded-t-[28px] border-t border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.99),rgba(14,12,10,0.99))] px-5 pb-8 pt-4 shadow-[0_-16px_40px_rgba(0,0,0,0.5)]"
            >
              {/* Handle */}
              <div className="mb-4 flex justify-center">
                <div className="h-1 w-10 rounded-full bg-white/15" />
              </div>

              <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[#8D7E6E]">Timer einstellen</p>

              {/* Presets */}
              <div className="mb-5 flex gap-2">
                {[5, 10, 15, 20].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setManualMinutes(min)}
                    className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition-colors duration-150 ${
                      manualMinutes === min
                        ? "border-[#D6A84A]/30 bg-[#D6A84A]/14 text-[#F6D78E]"
                        : "border-white/8 bg-white/[0.03] text-[#A99883] hover:text-[#F6EFE4]"
                    }`}
                  >
                    {min}'
                  </button>
                ))}
              </div>

              {/* Custom +/- */}
              <div className="mb-6 flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => setManualMinutes((m) => Math.max(1, m - 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-[4rem] text-center text-3xl font-bold tabular-nums tracking-[-0.04em] text-[#FFF8EE]">
                  {manualMinutes}'
                </span>
                <button
                  type="button"
                  onClick={() => setManualMinutes((m) => Math.min(120, m + 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Start */}
              <button
                type="button"
                onClick={handleStartManualTimer}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D6A84A]/24 bg-[linear-gradient(180deg,rgba(214,168,74,0.22),rgba(214,168,74,0.12))] py-4 text-sm font-semibold text-[#FFF1D4] transition-all duration-200 hover:border-[#D6A84A]/34"
              >
                <Timer size={16} />
                Timer starten — {manualMinutes} {manualMinutes === 1 ? "Minute" : "Minuten"}
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {/* Navigation */}
      <div className="border-t border-white/8 px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0}
            className="inline-flex h-13 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-200 hover:border-white/18 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Zurück
          </button>

          <button
            type="button"
            onClick={() => setIsManualTimerOpen((v) => !v)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${
              timerActive
                ? "border-[#D6A84A]/30 bg-[#D6A84A]/12 text-[#F6D78E]"
                : "border-white/10 bg-white/[0.03] text-[#6B5E4E] hover:text-[#A99883]"
            }`}
          >
            <Timer size={15} />
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-13 items-center gap-2 rounded-full border border-[#D6A84A]/24 bg-[linear-gradient(180deg,rgba(214,168,74,0.22),rgba(214,168,74,0.12))] px-5 text-sm font-semibold text-[#FFF1D4] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D6A84A]/34"
            >
              Weiter
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-13 items-center gap-2 rounded-full border border-[#D6A84A]/24 bg-[linear-gradient(180deg,rgba(214,168,74,0.22),rgba(214,168,74,0.12))] px-5 text-sm font-semibold text-[#FFF1D4] transition-all duration-200 hover:-translate-y-0.5"
            >
              Fertig
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
