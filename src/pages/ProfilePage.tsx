import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  KeyRound,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  Mail,
  MessageSquareText,
  Save,
  ShoppingCart,
  Sparkles,
  Tag,
  UserCircle2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { FeedbackModal } from "../components/feedback/FeedbackModal";
import { NavDrawer, type NavDrawerItem } from "../components/layout/NavDrawer";
import { buildAppNavItems } from "../components/layout/navItems";
import { ProfileSummarySkeleton } from "../components/ui/PageSkeletons";
import { ErrorStateCard } from "../components/ui/StateCard";
import { UpgradePrompt } from "../components/ui/UpgradePrompt";
import {
  signInWithEmailPassword,
  updateUserEmail,
  updateUserPassword,
} from "../features/auth/auth-service";
import { useAuth } from "../features/auth/useAuth";
import { canAccess } from "../features/plan/entitlements";
import { saveProfile } from "../features/profile/profileService";
import { useProfile } from "../features/profile/useProfile";

function formatCreatedAt(value: string | null) {
  if (!value) {
    return "Noch nicht vorhanden";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Noch nicht vorhanden";
  }

  return parsedDate.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfilePage() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [nextEmail, setNextEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const { profile, isLoading, error, reload } = useProfile(userId);

  const plan = profile?.plan ?? "free";
  const hasFavoritesAccess = canAccess(plan, "favorites");
  const hasShoppingListAccess = canAccess(plan, "shopping_list");

  const navItems: NavDrawerItem[] = useMemo(
    () =>
      buildAppNavItems({
        plan,
        onOpenUpgrade: () => setIsUpgradePromptOpen(true),
        onOpenFeedback: () => {
          setIsDrawerOpen(false);
          setIsFeedbackOpen(true);
        },
      }),
    [plan],
  );

  useEffect(() => {
    if (!profile) {
      return;
    }

    setUsername(profile.username);
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile]);

  useEffect(() => {
    setNextEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("checkout") !== "success") {
      return;
    }

    setCheckoutSuccess("Dein Pro-Zugang wird gerade aktualisiert.");
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
      reload(),
    ]).finally(() => {
      setCheckoutSuccess("Dein Checkout war erfolgreich. Dein Profil wurde aktualisiert.");
      searchParams.delete("checkout");
      const nextSearch = searchParams.toString();
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : "",
        },
        { replace: true },
      );
    });
  }, [location.pathname, location.search, navigate, queryClient, reload, userId]);

  async function handleLogout() {
    await signOut();
  }

  async function handleSave() {
    if (!userId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await saveProfile(userId, {
        username,
        avatarUrl: avatarUrl || null,
      });
      await reload();
      setSaveSuccess("Profil erfolgreich gespeichert.");
    } catch (profileSaveError) {
      setSaveError(
        profileSaveError instanceof Error
          ? profileSaveError.message
          : "Das Profil konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEmailUpdate() {
    const trimmedEmail = nextEmail.trim();

    setEmailError(null);
    setEmailSuccess(null);

    if (!trimmedEmail) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    if (trimmedEmail === userEmail) {
      setEmailError("Die neue E-Mail-Adresse entspricht bereits der aktuellen.");
      return;
    }

    setIsUpdatingEmail(true);

    try {
      await updateUserEmail(trimmedEmail);
      setEmailSuccess(
        "Die Änderung wurde angestoßen. Supabase sendet je nach Projekteinstellung eine Bestätigungs-E-Mail.",
      );
    } catch (userEmailUpdateError) {
      setEmailError(
        userEmailUpdateError instanceof Error
          ? userEmailUpdateError.message
          : "Die E-Mail-Adresse konnte nicht aktualisiert werden.",
      );
    } finally {
      setIsUpdatingEmail(false);
    }
  }

  async function handlePasswordUpdate() {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Bitte gib zuerst dein aktuelles Passwort ein.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Die Passwort-Bestätigung stimmt nicht überein.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await signInWithEmailPassword(userEmail, currentPassword);
      await updateUserPassword(newPassword);
      setPasswordSuccess(
        "Das Passwort wurde aktualisiert.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (userPasswordUpdateError) {
      setPasswordError(
        userPasswordUpdateError instanceof Error
          ? userPasswordUpdateError.message
          : "Das Passwort konnte nicht aktualisiert werden.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <NavDrawer
        _onCreateRecipe={() => navigate("/recipes")}
        isOpen={isDrawerOpen}
        items={navItems}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
        onToggle={() => setIsDrawerOpen((previous) => !previous)}
        userId={userId}
        userEmail={userEmail}
        userName={profile?.username ?? ""}
        plan={plan}
        profileTo="/profile"
      />

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentPage={`${location.pathname}${location.search}`}
        userId={userId}
        userEmail={userEmail}
        username={profile?.username ?? ""}
      />

      <UpgradePrompt
        isOpen={isUpgradePromptOpen}
        onClose={() => setIsUpgradePromptOpen(false)}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
            Konto
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl">
            Profileinstellungen
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7AA96] sm:text-base">
            Hier kannst du dein Profil für NuVio Taste verwalten.
          </p>
        </motion.section>

        {/* Plan section — always visible, prominent for free users */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.38, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          {plan === "pro" ? (
            <div className="flex items-center gap-4 rounded-[28px] border border-[#D6A84A]/18 bg-[linear-gradient(180deg,rgba(214,168,74,0.1),rgba(214,168,74,0.04))] px-5 py-4 shadow-[0_10px_30px_rgba(214,168,74,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D6A84A]/20 bg-[#D6A84A]/12 text-[#D6A84A]">
                <Sparkles size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.24em] text-[#B89A67]">Dein Plan</p>
                <p className="mt-0.5 text-sm font-semibold text-[#FFF8EE]">
                  Pro — alle Features freigeschaltet
                </p>
              </div>
              <span className="rounded-full border border-[#D6A84A]/20 bg-[#D6A84A]/12 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#F6D78E]">
                Pro
              </span>
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#8D7E6E]">
                    <Lock size={16} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">Dein Plan</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#D5C5AF]">
                      Free — Rezepte entdecken und verwalten
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3 text-sm text-[#8D7E6E]">
                    <span className="flex items-center gap-1.5">
                      <Bookmark size={13} className="opacity-50" />
                      Favoriten
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShoppingCart size={13} className="opacity-50" />
                      Einkaufsliste
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUpgradePromptOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D6A84A]/22 bg-[linear-gradient(180deg,rgba(214,168,74,0.16),rgba(214,168,74,0.08))] px-4 py-2 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/30"
                  >
                    Pro entdecken
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
              Kontoübersicht
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
              Dein Account
            </h2>

            {isLoading ? (
              <ProfileSummarySkeleton />
            ) : error ? (
              <div className="mt-5">
                <ErrorStateCard
                  eyebrow="Laden fehlgeschlagen"
                  title="Profil konnte nicht geladen werden"
                  description={error}
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-black/10 p-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={username || "Profilbild"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle2 size={28} />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#FFF8EE]">
                      {username || "Noch kein Benutzername"}
                    </p>
                    <p className="text-sm text-[#B7AA96]">{userEmail || "Keine E-Mail"}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-black/10 p-4 text-sm leading-7 text-[#D5C5AF]">
                  <p>
                    <span className="font-medium text-[#FFF8EE]">User ID:</span>{" "}
                    {userId || "Nicht verfügbar"}
                  </p>
                  <p>
                    <span className="font-medium text-[#FFF8EE]">Profil erstellt:</span>{" "}
                    {formatCreatedAt(profile?.createdAt ?? null)}
                  </p>
                  <p>
                    <span className="font-medium text-[#FFF8EE]">Plan:</span>{" "}
                    {profile?.plan === "pro" ? "Pro" : "Free"}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
              Bearbeiten
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
              Öffentliche Profildaten
            </h2>

            <div className="mt-5 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                  Benutzername
                </label>
                <input
                  data-testid="profile-username-input"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="z. B. Axel"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                  Avatar URL
                </label>
                <div className="relative">
                  <ImageIcon
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E806F]"
                  />
                  <input
                    data-testid="profile-avatar-url-input"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 pl-11 pr-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                  />
                </div>
              </div>

              {saveError ? (
                <div className="rounded-[22px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
                  {saveError}
                </div>
              ) : null}

              {saveSuccess ? (
                <div
                  data-testid="profile-save-success"
                  className="rounded-[22px] border border-[rgba(214,168,74,0.18)] bg-[rgba(214,168,74,0.08)] px-4 py-3 text-sm text-[#F6EFE4]"
                >
                  {saveSuccess}
                </div>
              ) : null}

              {checkoutSuccess ? (
                <div className="rounded-[22px] border border-[rgba(214,168,74,0.18)] bg-[rgba(214,168,74,0.08)] px-4 py-3 text-sm text-[#F6EFE4]">
                  {checkoutSuccess}
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    void handleSave();
                  }}
                  data-testid="profile-save-button"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DEB457] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {isSaving ? "Speichert..." : "Änderungen speichern"}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                  Auth
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                  E-Mail ändern
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                  Neue E-Mail-Adresse
                </label>
                <input
                  value={nextEmail}
                  onChange={(event) => setNextEmail(event.target.value)}
                  placeholder="name@beispiel.de"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
                <p className="mt-2 text-sm text-[#8E806F]">
                  Die Änderung läuft über Supabase Auth und nicht über die `profiles`-Tabelle.
                </p>
              </div>

              {emailError ? (
                <div className="rounded-[22px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
                  {emailError}
                </div>
              ) : null}

              {emailSuccess ? (
                <div className="rounded-[22px] border border-[rgba(214,168,74,0.18)] bg-[rgba(214,168,74,0.08)] px-4 py-3 text-sm text-[#F6EFE4]">
                  {emailSuccess}
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    void handleEmailUpdate();
                  }}
                  disabled={isUpdatingEmail}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DEB457] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {isUpdatingEmail ? "Speichert..." : "E-Mail aktualisieren"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                  Sicherheit
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                  Passwort ändern
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                  Aktuelles Passwort
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Aktuelles Passwort eingeben"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                  Neues Passwort
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Passwort wiederholen"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
                <p className="mt-2 text-sm text-[#8E806F]">
                  Gib zuerst dein aktuelles Passwort ein und bestätige danach das neue Passwort.
                </p>
              </div>

              {passwordError ? (
                <div className="rounded-[22px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
                  {passwordError}
                </div>
              ) : null}

              {passwordSuccess ? (
                <div className="rounded-[22px] border border-[rgba(214,168,74,0.18)] bg-[rgba(214,168,74,0.08)] px-4 py-3 text-sm text-[#F6EFE4]">
                  {passwordSuccess}
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    void handlePasswordUpdate();
                  }}
                  disabled={isUpdatingPassword}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DEB457] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {isUpdatingPassword ? "Speichert..." : "Passwort aktualisieren"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
