import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../features/auth/auth-service";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

type AuthMode = "login" | "signup";

const MIN_PASSWORD_LENGTH = 6;

type AuthFieldProps = {
  dataTestId?: string;
  icon: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  showPasswordToggle?: boolean;
  type?: string;
  value: string;
};

function AuthField({
  dataTestId,
  icon,
  label,
  onChange,
  placeholder,
  showPasswordToggle = false,
  type = "text",
  value,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="AuthField space-y-3">
      <label className="block text-[0.9rem] font-semibold tracking-[-0.02em] text-[#F6EFE4]">
        {label}
      </label>

      <div className="group relative">
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#B7AA96] transition-colors duration-300 group-focus-within:text-[#E9D8B4]">
          {icon}
        </div>

        <input
          data-testid={dataTestId}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full border-b border-white/10 bg-transparent pb-3 pl-8 pr-10 text-[1.05rem] text-[#F6EFE4] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
        />

        {showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8E806F] transition-colors duration-300 hover:text-[#E9D8B4]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BottomWaveGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 overflow-hidden rounded-b-[34px]">
      <div className="absolute inset-x-6 bottom-[-28px] h-36 rounded-full bg-[radial-gradient(circle_at_center,_rgba(214,168,74,0.55)_0%,_rgba(201,133,47,0.28)_28%,_rgba(111,123,59,0.12)_52%,_rgba(0,0,0,0)_76%)] blur-2xl" />
      <div className="absolute bottom-[-14px] left-[-18%] h-28 w-[68%] rounded-[999px] bg-[linear-gradient(90deg,rgba(94,71,32,0.72)_0%,rgba(214,168,74,0.78)_38%,rgba(201,133,47,0.64)_68%,rgba(111,123,59,0.52)_100%)] opacity-80 blur-[20px]" />
      <div className="absolute bottom-[-18px] right-[-14%] h-24 w-[64%] rounded-[999px] bg-[linear-gradient(90deg,rgba(214,168,74,0.54)_0%,rgba(233,216,180,0.36)_22%,rgba(201,133,47,0.58)_58%,rgba(111,123,59,0.42)_100%)] opacity-70 blur-[22px]" />
      <div className="absolute bottom-10 left-1/2 h-16 w-[72%] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_center,_rgba(245,239,228,0.14)_0%,_rgba(214,168,74,0.10)_40%,_rgba(0,0,0,0)_76%)] blur-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#171411] via-[#171411]/85 to-transparent" />
    </div>
  );
}

const formVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 26 : -26,
    filter: "blur(4px)",
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -26 : 26,
    filter: "blur(4px)",
    transition: {
      duration: 0.32,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
};

const itemVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mapAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "E-Mail oder Passwort sind nicht korrekt.";
  }

  if (message.includes("user already registered")) {
    return "Diese E-Mail ist bereits registriert.";
  }

  if (message.includes("password should be at least")) {
    return `Bitte wähle ein Passwort mit mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`;
  }

  if (message.includes("unable to validate email address")) {
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  }

  if (message.includes("signup is disabled")) {
    return "Registrierungen sind aktuell nicht verfügbar.";
  }

  if (message.includes("network")) {
    return "Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.";
  }

  return "Die Anfrage konnte nicht verarbeitet werden. Bitte versuche es erneut.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");

  const redirectPath =
    (location.state as LocationState | null)?.from?.pathname ?? "/dashboard";
  const isLogin = mode === "login";

  const title = useMemo(() => {
    return isLogin ? "Willkommen" : "Konto erstellen";
  }, [isLogin]);

  const subtitle = useMemo(() => {
    return isLogin
      ? "Melde dich mit deinem Taste Konto an."
      : "Erstelle dein Konto und starte mit dem Free-Plan.";
  }, [isLogin]);

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) {
      return;
    }

    setLoginError(null);
    setSignUpError(null);
    setSignUpSuccess(null);
    setDirection(nextMode === "signup" ? 1 : -1);
    setMode(nextMode);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const trimmedEmail = loginEmail.trim();

    if (!isValidEmail(trimmedEmail)) {
      setLoginError("Bitte gib eine gültige E-Mail-Adresse ein.");
      setIsSubmitting(false);
      return;
    }

    if (!loginPassword) {
      setLoginError("Bitte gib dein Passwort ein.");
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailPassword(trimmedEmail, loginPassword);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setLoginError(mapAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignUpError(null);
    setSignUpSuccess(null);
    setIsSubmitting(true);

    const trimmedName = signupName.trim();
    const trimmedEmail = signupEmail.trim();

    if (!trimmedName) {
      setSignUpError("Bitte gib deinen Namen ein.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setSignUpError("Bitte gib eine gültige E-Mail-Adresse ein.");
      setIsSubmitting(false);
      return;
    }

    if (signupPassword.length < MIN_PASSWORD_LENGTH) {
      setSignUpError(
        `Bitte gib ein gültiges Passwort mit mindestens ${MIN_PASSWORD_LENGTH} Zeichen ein.`,
      );
      setIsSubmitting(false);
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignUpError("Die Passwörter stimmen nicht überein.");
      setIsSubmitting(false);
      return;
    }

    try {
      const session = await signUpWithEmailPassword(trimmedName, trimmedEmail, signupPassword);

      if (session) {
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupPasswordConfirm("");
        navigate(redirectPath, { replace: true });
        return;
      }

      setSignUpSuccess(
        "Dein Konto wurde erstellt. Prüfe dein Postfach, um dein Konto zu bestätigen.",
      );
    } catch (error) {
      setSignUpError(mapAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative h-[100svh] min-h-[100svh] overflow-hidden bg-[#0F0E0C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(214,168,74,0.12),transparent_22%),radial-gradient(circle_at_50%_45%,rgba(94,71,32,0.1),transparent_30%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />

      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 flex h-[100svh] items-center justify-center px-4 py-4">
        <div className="relative w-full max-w-[390px]">
          <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_top,rgba(214,168,74,0.14),transparent_35%)] blur-2xl" />

          <section className="relative max-h-[calc(100svh-2rem)] overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.96)_0%,rgba(20,16,13,0.97)_100%)] px-6 pb-6 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:px-7 sm:pb-7 sm:pt-6">
            <div className="relative z-10">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <ChefHat size={18} />
                </div>

                <div>
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                    NuvioLabs Taste
                  </p>
                  <p className="mt-1 text-[0.96rem] text-[#B7AA96]">
                    Culinary workspace
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${mode}-heading`}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1 className="text-[2.55rem] font-semibold leading-[0.95] tracking-[-0.05em] text-[#FFF8EE]">
                      <span data-testid="auth-title">{title}</span>
                    </h1>
                    <p className="mt-4 max-w-[29ch] text-[1.02rem] leading-7 text-[#C0B09A]">
                      {subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mb-6">
                <div className="relative grid grid-cols-2 rounded-full border border-white/5 bg-white/[0.035] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <motion.div
                    layout
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-1 top-1 z-0 w-[calc(50%-4px)] rounded-full border border-[#E9D8B4]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] shadow-[0_8px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]"
                    style={{
                      left: isLogin ? 4 : "calc(50% + 0px)",
                    }}
                  />
                  <motion.div
                    animate={{
                      left: isLogin ? "7%" : "53%",
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-[1px] z-10 h-[2px] w-[40%] rounded-full bg-[#D6A84A] shadow-[0_0_14px_rgba(214,168,74,0.55)]"
                  />

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`relative z-20 rounded-full px-5 py-3 text-[1.05rem] font-medium transition-colors duration-300 ${
                      isLogin
                        ? "text-[#FFF8EE]"
                        : "text-[#8F806F] hover:text-[#CDB99B]"
                    }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={`relative z-20 rounded-full px-5 py-3 text-[1.05rem] font-medium transition-colors duration-300 ${
                      !isLogin
                        ? "text-[#FFF8EE]"
                        : "text-[#8F806F] hover:text-[#CDB99B]"
                    }`}
                  >
                    Registrieren
                  </button>
                </div>
              </div>

              <div className="relative min-h-[420px]">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  {isLogin ? (
                    <motion.form
                      key="login-form"
                      custom={direction}
                      variants={formVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      onSubmit={handleLogin}
                      className="absolute inset-0 flex flex-col"
                    >
                      <motion.div variants={itemVariants} className="space-y-8">
                        <AuthField
                          dataTestId="login-email-input"
                          label="E-Mail"
                          type="email"
                          placeholder="name@beispiel.de"
                          icon={<Mail size={18} />}
                          value={loginEmail}
                          onChange={setLoginEmail}
                        />

                        <AuthField
                          dataTestId="login-password-input"
                          label="Passwort"
                          type="password"
                          placeholder="Passwort eingeben"
                          icon={<LockKeyhole size={18} />}
                          value={loginPassword}
                          onChange={setLoginPassword}
                          showPasswordToggle
                        />
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="mt-7 flex justify-center"
                      >
                        <Link
                          to="/forgot-password"
                          data-testid="forgot-password-link"
                          className="text-center text-[1rem] text-[#D8C3A0] transition-colors duration-300 hover:text-[#F6EFE4]"
                        >
                          Passwort zurücksetzen
                        </Link>
                      </motion.div>

                      {loginError ? (
                        <motion.p
                          variants={itemVariants}
                          data-testid="login-error"
                          className="mt-5 text-sm leading-6 text-[#f1b6a8]"
                        >
                          {loginError}
                        </motion.p>
                      ) : null}

                      <motion.button
                        variants={itemVariants}
                        type="submit"
                        data-testid="login-submit-button"
                        disabled={isSubmitting}
                        className="mt-9 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] text-[1.08rem] font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#DEB457] disabled:translate-y-0 disabled:bg-[#6d5940] disabled:text-[#d7c8ae] disabled:shadow-none"
                      >
                        {isSubmitting ? "Bitte warten" : "Login"}
                        <ArrowRight size={18} />
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup-form"
                      custom={direction}
                      variants={formVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      onSubmit={handleSignUp}
                      className="absolute inset-0 flex flex-col"
                    >
                      <motion.div variants={itemVariants} className="space-y-8">
                        <AuthField
                          label="Name"
                          placeholder="Dein Name"
                          icon={<User size={18} />}
                          value={signupName}
                          onChange={setSignupName}
                        />

                        <AuthField
                          label="E-Mail"
                          type="email"
                          placeholder="name@beispiel.de"
                          icon={<Mail size={18} />}
                          value={signupEmail}
                          onChange={setSignupEmail}
                        />

                        <AuthField
                          label="Passwort"
                          type="password"
                          placeholder="Mindestens 6 Zeichen"
                          icon={<LockKeyhole size={18} />}
                          value={signupPassword}
                          onChange={setSignupPassword}
                          showPasswordToggle
                        />

                        <AuthField
                          label="Passwort wiederholen"
                          type="password"
                          placeholder="Passwort bestätigen"
                          icon={<LockKeyhole size={18} />}
                          value={signupPasswordConfirm}
                          onChange={setSignupPasswordConfirm}
                          showPasswordToggle
                        />
                      </motion.div>

                      {signUpError ? (
                        <motion.p
                          variants={itemVariants}
                          className="mt-8 text-sm leading-6 text-[#f1b6a8]"
                        >
                          {signUpError}
                        </motion.p>
                      ) : null}

                      {signUpSuccess ? (
                        <motion.p
                          variants={itemVariants}
                          className="mt-8 text-sm leading-6 text-[#E9D8B4]"
                        >
                          {signUpSuccess}
                        </motion.p>
                      ) : null}

                      <motion.button
                        variants={itemVariants}
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-9 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] text-[1.08rem] font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#DEB457] disabled:translate-y-0 disabled:bg-[#6d5940] disabled:text-[#d7c8ae] disabled:shadow-none"
                      >
                        {isSubmitting ? "Bitte warten" : "Registrieren"}
                        <ArrowRight size={18} />
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-10 mt-4 text-center text-[0.8rem] leading-5 text-[#ffffff]">
                Mit der Nutzung akzeptierst du die{" "}
                <Link
                  to="/terms"
                  className="text-[#E9D8B4] underline underline-offset-4 transition-colors duration-300 hover:text-white"
                >
                  Nutzungsbedingungen
                </Link>{" "}
                und die{" "}
                <Link
                  to="/privacy"
                  className="text-[#E9D8B4] underline underline-offset-4 transition-colors duration-300 hover:text-white"
                >
                  Datenschutzerklärung
                </Link>
                . Zum{" "}
                <Link
                  to="/imprint"
                  className="text-[#E9D8B4] underline underline-offset-4 transition-colors duration-300 hover:text-white"
                >
                  Impressum
                </Link>
                .
              </div>
            </div>

            <BottomWaveGlow />
          </section>
        </div>
      </div>
    </main>
  );
}
