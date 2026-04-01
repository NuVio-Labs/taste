import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, LayoutGrid, Plus, Sparkles, Tag } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { NavDrawer, type NavDrawerItem } from "../components/layout/NavDrawer";
import { CategoryOverview } from "../components/recipes/CategoryOverview";
import { RecipeCreateModal } from "../components/recipes/RecipeCreateModal";
import { RecipeFilters } from "../components/recipes/RecipeFilters";
import { RecipeOverview } from "../components/recipes/RecipeOverview";
import { useAuth } from "../features/auth/useAuth";
import { useRecipes } from "../features/recipes/useRecipes";
import type {
  RecipeCategorySummary,
  RecipeListItem,
  RecipeSortOption,
} from "../features/recipes/types";

const DEFAULT_SORT: RecipeSortOption = "latest";
const ALL_CATEGORY_KEY = "all";
const SCROLL_STORAGE_KEY = "recipes-scroll-position";

function normalizeCategoryKey(value: string) {
  return value.trim().toLowerCase();
}

function buildCategorySummary(recipes: RecipeListItem[]): RecipeCategorySummary[] {
  const categoryMap = new Map<string, RecipeCategorySummary>();

  for (const recipe of recipes) {
    const label = recipe.category || "Ohne Kategorie";
    const key = normalizeCategoryKey(label);
    const currentEntry = categoryMap.get(key);

    if (currentEntry) {
      currentEntry.count += 1;
      continue;
    }

    categoryMap.set(key, {
      key,
      label,
      count: 1,
    });
  }

  return [
    {
      key: ALL_CATEGORY_KEY,
      label: "Alle Rezepte",
      count: recipes.length,
    },
    ...Array.from(categoryMap.values()).sort((left, right) =>
      left.label.localeCompare(right.label, "de-DE"),
    ),
  ];
}

function filterRecipes(
  recipes: RecipeListItem[],
  category: string,
  search: string,
  sort: RecipeSortOption,
) {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = recipes.filter((recipe) => {
    const matchesCategory =
      category === ALL_CATEGORY_KEY ||
      normalizeCategoryKey(recipe.category) === category;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [recipe.title, recipe.description, recipe.category]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  return filtered.sort((left, right) => {
    if (sort === "title") {
      return left.title.localeCompare(right.title, "de-DE");
    }

    if (sort === "prepTime") {
      const leftTime = left.prepTime ?? Number.MAX_SAFE_INTEGER;
      const rightTime = right.prepTime ?? Number.MAX_SAFE_INTEGER;

      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }
    }

    const leftDate = new Date(left.createdAt ?? left.updatedAt ?? 0).getTime();
    const rightDate = new Date(right.createdAt ?? right.updatedAt ?? 0).getTime();
    return rightDate - leftDate;
  });
}

function updateParams(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue?: string,
) {
  if (!value || value === defaultValue) {
    params.delete(key);
    return;
  }

  params.set(key, value);
}

export function RecipesPage() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const recipeListRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredScrollRef = useRef(false);

  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const metadataName =
    typeof session?.user.user_metadata.full_name === "string"
      ? session.user.user_metadata.full_name
      : "";
  const { recipes, isLoading, error, reload } = useRecipes(userId);

  const activeCategory =
    searchParams.get("category")?.trim().toLowerCase() || ALL_CATEGORY_KEY;
  const searchValue = searchParams.get("q") ?? "";
  const sortValue = (searchParams.get("sort") as RecipeSortOption) || DEFAULT_SORT;

  const categories = useMemo(() => buildCategorySummary(recipes), [recipes]);
  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, activeCategory, searchValue, sortValue),
    [activeCategory, recipes, searchValue, sortValue],
  );

  useEffect(() => {
    if (isLoading || hasRestoredScrollRef.current) {
      return;
    }

    const savedScroll = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);

    if (!savedScroll) {
      hasRestoredScrollRef.current = true;
      return;
    }

    const scrollValue = Number(savedScroll);

    if (Number.isFinite(scrollValue)) {
      window.scrollTo({ top: scrollValue, behavior: "auto" });
    }

    window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    hasRestoredScrollRef.current = true;
  }, [isLoading]);

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

  function setCategory(categoryKey: string) {
    const nextParams = new URLSearchParams(searchParams);
    updateParams(nextParams, "category", categoryKey, ALL_CATEGORY_KEY);
    setSearchParams(nextParams, { replace: true });
    recipeListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setSearch(search: string) {
    const nextParams = new URLSearchParams(searchParams);
    updateParams(nextParams, "q", search.trim());
    setSearchParams(nextParams, { replace: true });
  }

  function setSort(sort: RecipeSortOption) {
    const nextParams = new URLSearchParams(searchParams);
    updateParams(nextParams, "sort", sort, DEFAULT_SORT);
    setSearchParams(nextParams, { replace: true });
  }

  async function handleLogout() {
    await signOut();
  }

  function handleSelectRecipe(recipeId: string) {
    window.sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
    navigate(`/recipes/${recipeId}`, {
      state: {
        fromPath: location.pathname,
        fromSearch: location.search,
      },
    });
  }

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
        userName={metadataName}
      />

      <RecipeCreateModal
        open={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        onCreated={() => {
          void reload();
        }}
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
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Rezeptsammlung
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl">
                Rezepte
              </h1>
             <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7AA96] sm:text-base">
  Wähle oben eine Kategorie aus oder stöbere direkt durch deine Rezepte. Mit einem Tap öffnest du die vollständige Detailansicht.
</p>
            </div>


          </div>

          <div className="mt-6 space-y-6">
            <RecipeFilters
              searchValue={searchValue}
              sortValue={sortValue}
              onSearchChange={setSearch}
              onSortChange={setSort}
            />

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Kategorien Overview
              </p>
              <CategoryOverview
                activeCategory={activeCategory}
                categories={categories}
                onSelectCategory={setCategory}
              />
            </div>
          </div>
        </motion.section>

        <section ref={recipeListRef} className="mt-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Rezept Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                {filteredRecipes.length} passende Rezepte
              </h2>
            </div>
            <p className="text-sm text-[#B7AA96]">
              Filter aktiv:{" "}
              {categories.find((entry) => entry.key === activeCategory)?.label ??
                "Alle Rezepte"}
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-[24px] border border-white/8 bg-white/[0.025] px-4 py-5 text-sm text-[#B7AA96]">
              Rezepte werden geladen...
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-[rgba(214,168,74,0.14)] bg-[rgba(255,255,255,0.025)] px-4 py-5 text-sm leading-6 text-[#D9C9B1]">
              Die Rezeptdaten konnten nicht geladen werden.
              <div className="mt-2 text-[#A99883]">{error}</div>
            </div>
          ) : (
            <RecipeOverview
              recipes={filteredRecipes}
              onSelectRecipe={handleSelectRecipe}
              emptyMessage={
                recipes.length === 0
                  ? "Noch keine Rezepte vorhanden. Erstelle dein erstes Rezept und die Übersicht füllt sich automatisch."
                  : "Keine Rezepte passen aktuell zu Suche und Filter."
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}
