import { useEffect, useState, type ReactNode } from "react";
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
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavDrawer, type NavDrawerItem } from "../components/layout/NavDrawer";
import { RecipeCreateModal } from "../components/recipes/RecipeCreateModal";
import { useAuth } from "../features/auth/useAuth";
import { useProfile } from "../features/profile/useProfile";
import { supabase } from "../lib/supabase";

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

type RecipeRow = Record<string, unknown>;

type RecipePreview = {
  id: string;
  sortTimestamp: number;
  subtitle: string;
  title: string;
};

type RecipeStatsRow = {
  created_at: string | null;
  id: string;
  is_public: boolean | null;
  title: string | null;
  updated_at: string | null;
};

type DashboardStats = {
  lastUpdatedHint: string;
  lastUpdatedLabel: string;
  privateRecipes: number;
  publicRecipes: number;
  totalRecipes: number;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function formatRecipeSubtitle(row: RecipeRow): string {
  const category = readString(row.category) ?? readString(row.category_name);
  const description =
    readString(row.description) ??
    readString(row.summary) ??
    readString(row.notes);

  if (category && description) {
    return `${category} • ${description}`;
  }

  if (category) {
    return category;
  }

  if (description) {
    return description;
  }

  const createdAt =
    readString(row.created_at) ??
    readString(row.updated_at) ??
    readString(row.inserted_at);

  if (!createdAt) {
    return "Rezept aus Supabase";
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Rezept aus Supabase";
  }

  return `Erstellt am ${parsedDate.toLocaleDateString("de-DE")}`;
}

function mapRecipeRow(row: RecipeRow, index: number): RecipePreview {
  const title =
    readString(row.title) ??
    readString(row.name) ??
    readString(row.recipe_name) ??
    `Rezept ${index + 1}`;

  const id =
    readString(row.id) ??
    readString(row.uuid) ??
    readString(row.slug) ??
    `${title}-${index}`;

  const dateValue =
    readString(row.created_at) ??
    readString(row.updated_at) ??
    readString(row.inserted_at);
  const sortTimestamp = dateValue ? new Date(dateValue).getTime() : 0;

  return {
    id,
    sortTimestamp: Number.isNaN(sortTimestamp) ? 0 : sortTimestamp,
    title,
    subtitle: formatRecipeSubtitle(row),
  };
}

function formatRelativeDate(value: string | null): string {
  if (!value) {
    return "Noch offen";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Noch offen";
  }

  const now = new Date();
  const differenceInDays = Math.floor(
    (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays <= 0) {
    return "Heute";
  }

  if (differenceInDays === 1) {
    return "Gestern";
  }

  if (differenceInDays < 7) {
    return `Vor ${differenceInDays} Tagen`;
  }

  return parsedDate.toLocaleDateString("de-DE");
}

function formatPreciseDate(value: string | null): string {
  if (!value) {
    return "Kein Zeitstempel vorhanden";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Kein Zeitstempel vorhanden";
  }

  return parsedDate.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildDashboardStats(rows: RecipeStatsRow[]): DashboardStats {
  const totalRecipes = rows.length;
  const publicRecipes = rows.filter((row) => row.is_public === true).length;
  const privateRecipes = totalRecipes - publicRecipes;
  const latestRow = rows.reduce<RecipeStatsRow | null>((latest, row) => {
    const dateValue = row.updated_at ?? row.created_at;

    if (!dateValue) {
      return latest;
    }

    const timestamp = new Date(dateValue).getTime();

    if (Number.isNaN(timestamp)) {
      return latest;
    }

    if (!latest) {
      return row;
    }

    const latestValue = latest.updated_at ?? latest.created_at;
    const latestTimestamp = latestValue ? new Date(latestValue).getTime() : 0;

    return timestamp > latestTimestamp ? row : latest;
  }, null);

  const latestDateValue = latestRow?.updated_at ?? latestRow?.created_at ?? null;
  const latestTitle = readString(latestRow?.title) ?? "Unbenanntes Rezept";

  return {
    totalRecipes,
    publicRecipes,
    privateRecipes,
    lastUpdatedLabel: formatRelativeDate(latestDateValue),
    lastUpdatedHint: latestDateValue
      ? `${latestTitle} · ${formatPreciseDate(latestDateValue)}`
      : "Noch keine Rezeptänderung vorhanden.",
  };
}

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

function ActionCard({
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
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const metadataName =
    typeof session?.user.user_metadata.full_name === "string"
      ? session.user.user_metadata.full_name
      : "";
  const { profile } = useProfile(userId);
  const [profileUserName, setProfileUserName] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState<RecipePreview[]>([]);
  const [isRecipesLoading, setIsRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRecipes: 0,
    publicRecipes: 0,
    privateRecipes: 0,
    lastUpdatedLabel: "Noch offen",
    lastUpdatedHint: "Noch keine Rezeptänderung vorhanden.",
  });

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
      disabled: true,
    },
    {
      label: "Einkaufsliste",
      icon: Tag,
      disabled: true,
    },
    {
      label: "Inspiration",
      icon: Sparkles,
      disabled: true,
    },
  ];

  async function handleLogout() {
    await signOut();
  }

  async function loadDashboardRecipes() {
    setIsRecipesLoading(true);
    setRecipesError(null);

    const [recentRecipesResult, statsResult] = await Promise.all([
      supabase
        .from("recipes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("recipes")
        .select("id, title, is_public, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (recentRecipesResult.error || statsResult.error) {
      setRecipesError(
        recentRecipesResult.error?.message ??
          statsResult.error?.message ??
          "Die Rezeptdaten konnten nicht geladen werden.",
      );
      setRecentRecipes([]);
      setStats({
        totalRecipes: 0,
        publicRecipes: 0,
        privateRecipes: 0,
        lastUpdatedLabel: "Noch offen",
        lastUpdatedHint: "Noch keine Rezeptänderung vorhanden.",
      });
      setIsRecipesLoading(false);
      return;
    }

    const recentRows = Array.isArray(recentRecipesResult.data)
      ? recentRecipesResult.data
      : [];
    const statsRows = Array.isArray(statsResult.data) ? statsResult.data : [];
    const mappedRecipes = recentRows.map(mapRecipeRow);

    setRecentRecipes(mappedRecipes);
    setStats(buildDashboardStats(statsRows));
    setIsRecipesLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadProfileUserName() {
      if (!userId) {
        if (isMounted) {
          setProfileUserName("");
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setProfileUserName("");
        return;
      }

      const username =
        data && typeof data.username === "string" ? data.username.trim() : "";

      setProfileUserName(username);
    }

    void loadProfileUserName();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      await loadDashboardRecipes();

      if (!isMounted) {
        return;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <NavDrawer
        onCreateRecipe={() => setIsCreateRecipeOpen(true)}
        isOpen={isDrawerOpen}
        items={navItems}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
        onToggle={() => setIsDrawerOpen((previous) => !previous)}
        userEmail={userEmail}
        userName={profileUserName || metadataName}
        plan={profile?.plan ?? "free"}
        profileTo="/profile"
      />

      <RecipeCreateModal
        open={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        onCreated={() => {
          void loadDashboardRecipes();
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />

      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,168,74,0.16)_0%,rgba(214,168,74,0.04)_38%,rgba(0,0,0,0)_72%)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          {...fadeUp}
          className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
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
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.06 }}
            className="space-y-6"
          >
            

            <SectionCard title="Letzte Rezepte">
              {isRecipesLoading ? (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-5 text-sm text-[#B7AA96]">
                  Rezepte werden geladen...
                </div>
              ) : recipesError ? (
                <div className="rounded-[22px] border border-[rgba(214,168,74,0.14)] bg-[rgba(255,255,255,0.025)] px-4 py-5 text-sm leading-6 text-[#D9C9B1]">
                  Die Rezeptdaten konnten nicht geladen werden.
                  <div className="mt-2 text-[#A99883]">{recipesError}</div>
                </div>
              ) : recentRecipes.length === 0 ? (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-5 text-sm leading-6 text-[#B7AA96]">
                  Noch keine Rezepte vorhanden. Lege dein erstes Rezept in
                  Supabase an, dann erscheint es hier automatisch.
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
                    phase: "Jetzt",
                    title: "Rezeptbasis steht",
                    description:
                      "Dashboard, letzte Rezepte und das Create-Recipe-Modal sind bereits angebunden.",
                  },
                  {
                    phase: "Als Nächstes",
                    title: "Rezepte-Seite aufbauen",
                    description:
                      "Alle Rezepte listen, filtern und den Detailfluss für einzelne Einträge vorbereiten.",
                  },
                  {
                    phase: "Danach",
                    title: "Favoriten und Kategorien ergänzen",
                    description:
                      "Persönliche Organisation mit User-Bezug, Filtern und sauberer Strukturierung ausbauen.",
                  },
                  {
                    phase: "Später",
                    title: "Einkaufsliste und Feinschliff",
                    description:
                      "Rezepte in Einkaufslisten überführen und den Workspace weiter produktiv ausformen.",
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
