import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";
import { RecipeCreateModal } from "../components/recipes/RecipeCreateModal";
import { RecipeFilters } from "../components/recipes/RecipeFilters";
import { RecipeOverview } from "../components/recipes/RecipeOverview";
import { ShoppingListPickerDialog } from "../components/shopping-list/ShoppingListPickerDialog";
import { RecipeOverviewSkeleton } from "../components/ui/PageSkeletons";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorStateCard } from "../components/ui/StateCard";
import { useAuth } from "../features/auth/useAuth";
import { canAccess } from "../features/plan/entitlements";
import { useProfile } from "../features/profile/useProfile";
import {
  favoriteRecipe,
  likeRecipe,
  unfavoriteRecipe,
  unlikeRecipe,
} from "../features/recipes/recipeService";
import { useRecipes } from "../features/recipes/useRecipes";
import { recipeDetailQueryOptions } from "../features/recipes/queryOptions";
import type {
  RecipeCategorySummary,
  RecipeListItem,
  RecipeSortOption,
} from "../features/recipes/types";
import { useShoppingLists } from "../features/shopping-list/useShoppingLists";

const DEFAULT_SORT: RecipeSortOption = "latest";
const ALL_CATEGORY_KEY = "all";
const SCROLL_STORAGE_KEY = "recipes-scroll-position";
const DEFAULT_VISIBILITY = "all";

type RecipeVisibilityFilter = "all" | "public" | "private";

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
  userId: string,
  category: string,
  search: string,
  sort: RecipeSortOption,
  visibility: RecipeVisibilityFilter,
) {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = recipes.filter((recipe) => {
    if (!matchesRecipeVisibility(recipe, userId, visibility)) {
      return false;
    }

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

function matchesRecipeVisibility(
  recipe: RecipeListItem,
  userId: string,
  visibility: RecipeVisibilityFilter,
) {
  return (
    visibility === "all" ||
    (visibility === "public" && recipe.isPublic) ||
    (visibility === "private" && recipe.userId === userId && !recipe.isPublic)
  );
}

export function RecipesPage() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openUpgrade } = useLayout();
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [favoritePendingRecipeId, setFavoritePendingRecipeId] = useState<string | null>(null);
  const [likePendingRecipeId, setLikePendingRecipeId] = useState<string | null>(null);
  const [shoppingListPendingRecipeId, setShoppingListPendingRecipeId] = useState<string | null>(null);
  const [isShoppingListDialogOpen, setIsShoppingListDialogOpen] = useState(false);
  const [shoppingListError, setShoppingListError] = useState<string | null>(null);
  const [selectedRecipeForShoppingListId, setSelectedRecipeForShoppingListId] = useState<string | null>(null);
  const recipeListRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredScrollRef = useRef(false);

  const userId = session?.user.id ?? "";
  const { profile } = useProfile(userId);
  const plan = profile?.plan ?? "free";
  const hasFavoritesAccess = canAccess(plan, "favorites");
  const hasShoppingListAccess = canAccess(plan, "shopping_list");
  const { recipes, isLoading, error } = useRecipes(userId);
  const shoppingLists = useShoppingLists(userId, plan);

  const activeCategory =
    searchParams.get("category")?.trim().toLowerCase() || ALL_CATEGORY_KEY;
  const searchValue = searchParams.get("q") ?? "";
  const sortValue = (searchParams.get("sort") as RecipeSortOption) || DEFAULT_SORT;
  const visibilityParam = searchParams.get("visibility");
  const visibilityFilter: RecipeVisibilityFilter =
    visibilityParam === "public" || visibilityParam === "private"
      ? visibilityParam
      : DEFAULT_VISIBILITY;

  const visibilityScopedRecipes = useMemo(
    () => recipes.filter((recipe) => matchesRecipeVisibility(recipe, userId, visibilityFilter)),
    [recipes, userId, visibilityFilter],
  );
  const categories = useMemo(
    () => buildCategorySummary(visibilityScopedRecipes),
    [visibilityScopedRecipes],
  );
  const filteredRecipes = useMemo(
    () =>
      filterRecipes(
        recipes,
        userId,
        activeCategory,
        searchValue,
        sortValue,
        visibilityFilter,
      ),
    [activeCategory, recipes, searchValue, sortValue, userId, visibilityFilter],
  );
  const activeVisibilityLabel =
    visibilityFilter === "public"
      ? "Öffentliche Rezepte"
      : visibilityFilter === "private"
        ? "Private Rezepte"
        : "Alle Rezepte";
  const activeCategoryLabel =
    categories.find((entry) => entry.key === activeCategory)?.label ?? "Alle Rezepte";
  const activeFilterLabel =
    visibilityFilter === "all" && activeCategoryLabel === "Alle Rezepte"
      ? "Alle Rezepte"
      : visibilityFilter === "all"
        ? activeCategoryLabel
        : activeCategoryLabel === "Alle Rezepte"
          ? activeVisibilityLabel
          : `${activeVisibilityLabel} • ${activeCategoryLabel}`;

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

  async function handleToggleLike(recipeId: string) {
    const recipe = recipes.find((entry) => entry.id === recipeId);

    if (!userId || !recipe || likePendingRecipeId) {
      return;
    }

    setLikePendingRecipeId(recipeId);

    try {
      if (recipe.isLiked) {
        await unlikeRecipe(userId, recipeId);
      } else {
        await likeRecipe(userId, recipeId);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["recipe", userId, recipeId] }),
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
      ]);
    } finally {
      setLikePendingRecipeId(null);
    }
  }

  async function handleToggleFavorite(recipeId: string) {
    if (!hasFavoritesAccess) {
      openUpgrade();
      return;
    }

    const recipe = recipes.find((entry) => entry.id === recipeId);

    if (!userId || !recipe || favoritePendingRecipeId) {
      return;
    }

    setFavoritePendingRecipeId(recipeId);

    try {
      if (recipe.isFavorite) {
        await unfavoriteRecipe(userId, recipeId);
      } else {
        await favoriteRecipe(userId, recipeId);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["recipe", userId, recipeId] }),
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
      ]);
    } finally {
      setFavoritePendingRecipeId(null);
    }
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

  function handlePrefetchRecipe(recipeId: string) {
    if (!userId) {
      return;
    }

    void queryClient.prefetchQuery(recipeDetailQueryOptions(userId, recipeId));
  }

  function handleOpenShoppingListDialog(recipeId: string) {
    if (!hasShoppingListAccess) {
      openUpgrade();
      return;
    }

    setShoppingListError(null);
    setSelectedRecipeForShoppingListId(recipeId);
    setIsShoppingListDialogOpen(true);
    handlePrefetchRecipe(recipeId);
  }

  function handleCreateShoppingList(name: string) {
    try {
      const nextList = shoppingLists.createList(name);
      setShoppingListError(null);
      return nextList.id;
    } catch (createListError) {
      setShoppingListError(
        createListError instanceof Error
          ? createListError.message
          : "Die Liste konnte nicht erstellt werden.",
      );
      return null;
    }
  }

  async function handleConfirmAddToShoppingList(listId: string, servings: number) {
    if (!userId || !selectedRecipeForShoppingListId) {
      return;
    }

    setShoppingListPendingRecipeId(selectedRecipeForShoppingListId);

    try {
      const recipeDetail = await queryClient.fetchQuery(
        recipeDetailQueryOptions(userId, selectedRecipeForShoppingListId),
      );
      shoppingLists.addRecipe(listId, recipeDetail, servings);
      setIsShoppingListDialogOpen(false);
      setShoppingListError(null);
    } catch (addToListError) {
      setShoppingListError(
        addToListError instanceof Error
          ? addToListError.message
          : "Das Rezept konnte nicht zur Einkaufsliste hinzugefügt werden.",
      );
    } finally {
      setShoppingListPendingRecipeId(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <RecipeCreateModal
        open={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ["recipes", userId] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
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
              activeCategory={activeCategory}
              categories={categories}
              onCategoryChange={setCategory}
              searchValue={searchValue}
              sortValue={sortValue}
              onSearchChange={setSearch}
              onSortChange={setSort}
            />
          </div>
        </motion.section>

        <section ref={recipeListRef} className="mt-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Rezept Overview
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-52 rounded-full" />
              ) : (
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                  {filteredRecipes.length} passende Rezepte
                </h2>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-44 rounded-full" />
            ) : (
              <p className="text-sm text-[#B7AA96]">
                Filter aktiv: {activeFilterLabel}
              </p>
            )}
          </div>

          {isLoading ? (
            <RecipeOverviewSkeleton />
          ) : error ? (
            <ErrorStateCard
              eyebrow="Laden fehlgeschlagen"
              title="Rezeptdaten konnten nicht geladen werden"
              description={error}
            />
          ) : (
            <RecipeOverview
              addToShoppingListPendingRecipeId={shoppingListPendingRecipeId}
              recipes={filteredRecipes}
              onAddToShoppingList={handleOpenShoppingListDialog}
              onPrefetchRecipe={handlePrefetchRecipe}
              onSelectRecipe={handleSelectRecipe}
              onToggleFavorite={handleToggleFavorite}
              onToggleLike={handleToggleLike}
              favoritePendingRecipeId={favoritePendingRecipeId}
              likePendingRecipeId={likePendingRecipeId}
              emptyMessage={
                recipes.length === 0
                  ? "Noch keine Rezepte vorhanden. Erstelle dein erstes Rezept und die Übersicht füllt sich automatisch."
                  : "Keine Rezepte passen aktuell zu Suche und Filter."
              }
            />
          )}
        </section>
      </div>

      <ShoppingListPickerDialog
        externalError={shoppingListError}
        isOpen={isShoppingListDialogOpen}
        canCreateList={!shoppingLists.hasReachedLimit}
        listLimit={shoppingLists.maxLists}
        lists={shoppingLists.lists.map((list) => ({
          id: list.id,
          name: list.name,
          recipeCount: list.recipes.length,
        }))}
        onClose={() => {
          setIsShoppingListDialogOpen(false);
          setShoppingListError(null);
        }}
        onConfirm={handleConfirmAddToShoppingList}
        onCreateList={handleCreateShoppingList}
        plan={plan}
        recipeServings={
          recipes.find((recipe) => recipe.id === selectedRecipeForShoppingListId)?.servings ?? 1
        }
        recipeTitle={
          recipes.find((recipe) => recipe.id === selectedRecipeForShoppingListId)?.title ??
          "Rezept"
        }
      />
    </main>
  );
}
