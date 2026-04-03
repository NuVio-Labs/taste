import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Clock3,
  Globe2,
  Heart,
  LayoutGrid,
  Lock,
  MessageSquareText,
  Plus,
  Tag,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { FeedbackModal } from "../components/feedback/FeedbackModal";
import { NavDrawer, type NavDrawerItem } from "../components/layout/NavDrawer";
import { RecipeCreateModal } from "../components/recipes/RecipeCreateModal";
import {
  DashboardRecentRecipesSkeleton,
  DashboardStatsSkeleton,
} from "../components/ui/PageSkeletons";
import { useAuth } from "../features/auth/useAuth";
import { dashboardQueryOptions } from "../features/dashboard/queryOptions";
import { useProfile } from "../features/profile/useProfile";
import { recipeDetailQueryOptions } from "../features/recipes/queryOptions";

type StatCardProps = {
  hint: string;
  icon: ReactNode;
  label: string;
  value: string;
};

type ActionCardProps = {
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  title: string;
};

const EMPTY_STATS = {
  totalRecipes: 0,
  publicRecipes: 0,
  privateRecipes: 0,
  lastUpdatedLabel: "–",
  lastUpdatedHint: "Noch keine Rezeptänderung vorhanden.",
};

function SectionCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
      <div className="mb-5">
        {eyebrow ? (
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function StatCard({ hint, icon, label, value }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.03)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
          {icon}
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
          {label}
        </span>
      </div>

      <div className="text-3xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
        {value}
      </div>

      <p className="mt-2 text-sm leading-6 text-[#B7AA96]">{hint}</p>
    </motion.div>
  );
}

// ActionCard ist vorbereitet für spätere Nutzung (Dashboard-Schnellaktionen)
function _ActionCard({
  description,
  disabled = false,
  icon,
  title,
}: ActionCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      disabled={disabled}
      className={`group rounded-[28px] border p-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-300 ${
        disabled
          ? "cursor-not-allowed border-white/6 bg-white/[0.02] opacity-70"
          : "border-white/8 bg-white/[0.03] hover:border-[#D6A84A]/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
        {icon}
      </div>

      <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#FFF8EE]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#B7AA96]">{description}</p>

      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#D6A84A]">
        {disabled ? "Bald verfügbar" : "Öffnen"}
        {!disabled ? (
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        ) : null}
      </div>
    </motion.button>
  );
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const metadataName =
    typeof session?.user.user_metadata.full_name === "string"
      ? session.user.user_metadata.full_name
      : "";
  const { profile } = useProfile(userId);
  const { data, isLoading, error } = useQuery(dashboardQueryOptions(userId));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const userName = profile?.username || metadataName;
  const stats = data?.stats ?? EMPTY_STATS;
  const recentRecipes = data?.recentRecipes ?? [];

  const fadeUp = {
    initial: { opacity: 0, y: 14, filter: "blur(6px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const navItems: NavDrawerItem[] = [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      to: "/dashboard",
    },
    {
      label: "Rezepte",
      icon: BookOpen,
      to: "/recipes",
    },
    {
      label: "Favoriten",
      icon: Heart,
      to: "/favorites",
    },
    {
      label: "Einkaufsliste",
      icon: Tag,
      to: "/shopping-list",
    },
    {
      label: "Feedback",
      icon: MessageSquareText,
      onSelect: () => {
        setIsDrawerOpen(false);
        setIsFeedbackOpen(true);
      },
    },
  ];

  async function handleLogout() {
    await signOut();
  }

  function handlePrefetchRecipe(recipeId: string) {
    if (!userId) return;
    void queryClient.prefetchQuery(recipeDetailQueryOptions(userId, recipeId));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <NavDrawer
        _onCreateRecipe={() => setIsCreateRecipeOpen(true)}
        isOpen={isDrawerOpen}
        items={navItems}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
        onToggle={() => setIsDrawerOpen((previous) => !previous)}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        plan={profile?.plan ?? "free"}
        profileTo="/profile"
      />

      <RecipeCreateModal
        open={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
          void queryClient.invalidateQueries({ queryKey: ["recipes", userId] });
        }}
      />

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentPage={`${location.pathname}${location.search}`}
        userId={userId}
        userEmail={userEmail}
        username={userName}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />

      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,168,74,0.16)_0%,rgba(214,168,74,0.04)_38%,rgba(0,0,0,0)_72%)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          {...fadeUp}
          className="mb-6 flex items-center justify-end"
        >
          <button
            type="button"
            onClick={() => setIsCreateRecipeOpen(true)}
            data-testid="open-create-recipe-button"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-5 text-sm font-semibold text-[#FFF1D4] shadow-[0_12px_24px_rgba(214,168,74,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28 hover:bg-[linear-gradient(180deg,rgba(214,168,74,0.22),rgba(214,168,74,0.12))]"
          >
            <Plus size={16} />
            Rezept hinzufügen
          </button>
        </motion.section>

        <motion.section
          {...fadeUp}
          className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {isLoading ? (
            <DashboardStatsSkeleton />
          ) : (
            <>
              <StatCard
                label="Rezepte"
                value={String(stats.totalRecipes)}
                hint="Gesamtzahl aller aktuell gespeicherten Rezepte in deiner Sammlung."
                icon={<BookOpen size={18} />}
              />
              <StatCard
                label="Privat"
                value={String(stats.privateRecipes)}
                hint="Rezepte, die derzeit nur in deinem persönlichen Bereich sichtbar sind."
                icon={<Lock size={18} />}
              />
              <StatCard
                label="Öffentlich"
                value={String(stats.publicRecipes)}
                hint="Bereits freigegebene Rezepte mit aktivierter öffentlicher Sichtbarkeit."
                icon={<Globe2 size={18} />}
              />
              <StatCard
                label="Letztes Update"
                value={stats.lastUpdatedLabel}
                hint={stats.lastUpdatedHint}
                icon={<Clock3 size={18} />}
              />
            </>
          )}
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.06 }}
            className="space-y-6"
          >
            <SectionCard title="Letzte Rezepte">
              {isLoading ? (
                <DashboardRecentRecipesSkeleton />
              ) : error ? (
                <div className="rounded-[22px] border border-[rgba(214,168,74,0.14)] bg-[rgba(255,255,255,0.025)] px-4 py-5 text-sm leading-6 text-[#D9C9B1]">
                  Die Rezeptdaten konnten nicht geladen werden.
                  <div className="mt-2 text-[#A99883]">{error.message}</div>
                </div>
              ) : recentRecipes.length === 0 ? (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-5 text-sm leading-6 text-[#B7AA96]">
                  Noch keine sichtbaren Rezepte vorhanden. Erstelle ein eigenes
                  Rezept oder veröffentliche bestehende Inhalte, dann erscheint
                  hier automatisch etwas.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + index * 0.06, duration: 0.35 }}
                      className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                          <ChefHat size={16} />
                        </div>
                        <div>
                          <p className="text-base font-medium text-[#FFF8EE]">
                            {recipe.title}
                          </p>
                          <p className="text-sm text-[#A99883]">
                            {recipe.subtitle}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        onMouseEnter={() => handlePrefetchRecipe(recipe.id)}
                        onFocus={() => handlePrefetchRecipe(recipe.id)}
                        onTouchStart={() => handlePrefetchRecipe(recipe.id)}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-[#D6A84A] transition-colors duration-300 hover:border-[#D6A84A]/20 hover:text-[#E9D8B4]"
                      >
                        Öffnen
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </SectionCard>
          </motion.div>

          <motion.aside
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <SectionCard title="Roadmap">
              <div className="space-y-4">
                {[
                  {
                    phase: "Stand heute",
                    title: "Kernflows vollständig",
                    description:
                      "Auth, Rezepte, Favoriten, Einkaufsliste, Profil und Feedback sind fertig und benutzbar.",
                  },
                  {
                    phase: "Als Nächstes",
                    title: "Testphase starten",
                    description:
                      "RLS-Check aller Tabellen, manuelle Happy-Path- und Fehlertests, Bugfixing aus Tester-Feedback.",
                  },
                  {
                    phase: "Danach",
                    title: "Technische Verbesserungen",
                    description:
                      "Dashboard und Profil auf React Query umstellen, Route-Level Code Splitting, Error Boundary einführen.",
                  },
                  {
                    phase: "Später",
                    title: "Inspiration, Bilder und Feinschliff",
                    description:
                      "Inspiration-Bereich mit echten Vorschlägen füllen, Bild-Upload integrieren und UX weiter ausfeilen.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#E9D8B4]/10 bg-white/[0.03] text-xs font-semibold text-[#E9D8B4]">
                          {index + 1}
                        </div>
                        {index < 3 ? (
                          <div className="mt-2 h-8 w-px bg-white/10" />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#B89A67]">
                          {item.phase}
                        </p>
                        <h3 className="mt-2 text-sm font-semibold text-[#F6EFE4]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#D5C5AF]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
