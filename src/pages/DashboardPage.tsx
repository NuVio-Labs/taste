import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  ChefHat,
  Clock3,
  Globe2,
  Lock,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RecipeCreateModal } from "../components/recipes/RecipeCreateModal";
import { useLayout } from "../contexts/LayoutContext";
import {
  DashboardRecentRecipesSkeleton,
  DashboardStatsSkeleton,
} from "../components/ui/PageSkeletons";
import { EmptyStateCard, ErrorStateCard } from "../components/ui/StateCard";
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

type RecipeVisibilityFilter = "public" | "private";

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

function RecipeVisibilityCard({
  activeFilter,
  onOpenRecipes,
  onChange,
  privateRecipes,
  publicRecipes,
}: {
  activeFilter: RecipeVisibilityFilter;
  onOpenRecipes: () => void;
  onChange: (filter: RecipeVisibilityFilter) => void;
  privateRecipes: number;
  publicRecipes: number;
}) {
  const filterConfig =
    activeFilter === "public"
      ? {
          description:
            "Bereits freigegebene Rezepte mit aktivierter öffentlicher Sichtbarkeit.",
          icon: <Globe2 size={18} />,
          label: "Öffentlich",
          value: String(publicRecipes),
        }
      : {
          description:
            "Rezepte, die derzeit nur in deinem persönlichen Bereich sichtbar sind.",
          icon: <Lock size={18} />,
          label: "Privat",
          value: String(privateRecipes),
        };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative pt-3"
    >
      <div className="relative">
        <div className="relative z-10 flex items-end gap-0 overflow-x-auto px-0 pb-0">
          {[
            { id: "public" as const, label: "Öffentliche Rezepte" },
            { id: "private" as const, label: "Private Rezepte" },
          ].map((pill) => {
            const isActive = activeFilter === pill.id;
            const isFirst = pill.id === "public";

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onChange(pill.id)}
                className={`relative -mb-px shrink-0 rounded-t-[22px] border px-4 py-3 text-sm font-medium transition-all duration-300 sm:px-5 ${
                  isActive
                    ? "z-20 border-[#D6A84A]/26 border-b-[rgba(34,27,19,0.96)] bg-[linear-gradient(180deg,rgba(214,168,74,0.24),rgba(90,67,27,0.34))] text-[#FFF3DA] shadow-none"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-[#BDAA8F] hover:border-[#D6A84A]/14 hover:text-[#FFF8EE]"
                } ${isFirst ? "ml-0" : "-ml-px"}`}
              >
                {pill.label}
                {isActive ? (
                  <span className="absolute left-0 right-0 top-0 h-px bg-white/10" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="relative -mt-px overflow-hidden rounded-[30px] rounded-tl-none border border-white/8 bg-[linear-gradient(180deg,rgba(64,48,22,0.34),rgba(34,27,19,0.96)_14%,rgba(18,15,12,0.98)_100%)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[linear-gradient(180deg,rgba(214,168,74,0.08),rgba(214,168,74,0.02),transparent)]" />

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
            {filterConfig.icon}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
              {filterConfig.label}
            </p>
            <div className="mt-3 flex w-full items-center justify-between gap-3">
              <div className="text-4xl font-semibold tracking-[-0.05em] text-[#FFF8EE]">
                {filterConfig.value}
              </div>
              <button
                type="button"
                onClick={onOpenRecipes}
                className="inline-flex h-9 items-center rounded-full border border-[#D6A84A]/18 bg-[linear-gradient(180deg,rgba(214,168,74,0.16),rgba(214,168,74,0.08))] px-4 text-sm font-medium text-[#FFF1D4] transition-all duration-300 hover:border-[#D6A84A]/28 hover:bg-[linear-gradient(180deg,rgba(214,168,74,0.2),rgba(214,168,74,0.1))]"
              >
                Anzeigen
              </button>
            </div>
          </div>

            <p className="max-w-md text-sm leading-6 text-[#B7AA96]">
              {filterConfig.description}
            </p>
          </div>
        </div>
      </div>
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
  const { session } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user.id ?? "";
  const { profile } = useProfile(userId);
  const { data, isLoading, error } = useQuery(dashboardQueryOptions(userId));
  const { openUpgrade } = useLayout();
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [activeRecipeVisibility, setActiveRecipeVisibility] =
    useState<RecipeVisibilityFilter>("public");

  const plan = profile?.plan ?? "free";
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

  function handlePrefetchRecipe(recipeId: string) {
    if (!userId) return;
    void queryClient.prefetchQuery(recipeDetailQueryOptions(userId, recipeId));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <RecipeCreateModal
        open={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
          void queryClient.invalidateQueries({ queryKey: ["recipes", userId] });
        }}
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
          className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]"
        >
          {isLoading ? (
            <DashboardStatsSkeleton />
          ) : (
            <>
              <RecipeVisibilityCard
                activeFilter={activeRecipeVisibility}
                onOpenRecipes={() =>
                  navigate(`/recipes?visibility=${activeRecipeVisibility}`)
                }
                onChange={setActiveRecipeVisibility}
                privateRecipes={stats.privateRecipes}
                publicRecipes={stats.publicRecipes}
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
                <ErrorStateCard
                  eyebrow="Laden fehlgeschlagen"
                  title="Rezepte konnten nicht geladen werden"
                  description={error.message}
                />
              ) : recentRecipes.length === 0 ? (
                <EmptyStateCard
                  eyebrow="Noch leer"
                  title="Noch keine sichtbaren Rezepte"
                  description="Erstelle ein eigenes Rezept oder veröffentliche bestehende Inhalte, dann erscheint hier automatisch etwas."
                />
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
            {plan === "pro" ? (
              <SectionCard eyebrow="Dein Bereich" title="Persönlicher Bereich">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate("/favorites")}
                    className="group flex w-full items-center gap-4 rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-4 text-left transition-all duration-300 hover:border-[#D6A84A]/18 hover:bg-white/[0.035]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                      <Bookmark size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#FFF8EE]">Gespeicherte Favoriten</p>
                      <p className="mt-0.5 text-xs text-[#A99883]">Deine Lieblingsrezepte im Überblick</p>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-[#D6A84A] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/shopping-list")}
                    className="group flex w-full items-center gap-4 rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-4 text-left transition-all duration-300 hover:border-[#D6A84A]/18 hover:bg-white/[0.035]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                      <ShoppingCart size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#FFF8EE]">Einkaufsliste planen</p>
                      <p className="mt-0.5 text-xs text-[#A99883]">Zutaten direkt aus Rezepten sammeln</p>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-[#D6A84A] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </SectionCard>
            ) : (
              <SectionCard eyebrow="Nur mit Pro" title="Persönlicher Bereich">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-[#B7AA96]">
                    Speichere Lieblingsrezepte, plane deinen Einkauf und greife
                    jederzeit auf deinen persönlichen Bereich zu.
                  </p>

                  {[
                    { icon: Bookmark, text: "Favoriten speichern und wiederfinden" },
                    { icon: ShoppingCart, text: "Einkaufslisten aus Rezepten erstellen" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.015] px-4 py-3 opacity-60"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#8D7E6E]">
                        <Icon size={14} />
                      </div>
                      <p className="text-sm text-[#8D7E6E]">{text}</p>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={openUpgrade}
                    className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.14),rgba(214,168,74,0.07))] text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28"
                  >
                    Pro entdecken
                  </button>
                </div>
              </SectionCard>
            )}

          </motion.aside>
        </div>
      </div>
    </main>
  );
}
