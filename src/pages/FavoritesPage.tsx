import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookMarked,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";
import { RecipeFilters } from "../components/recipes/RecipeFilters";
import { RecipeOverview } from "../components/recipes/RecipeOverview";
import { ShoppingListPickerDialog } from "../components/shopping-list/ShoppingListPickerDialog";
import { RecipeOverviewSkeleton } from "../components/ui/PageSkeletons";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyStateCard, ErrorStateCard } from "../components/ui/StateCard";
import { useAuth } from "../features/auth/useAuth";
import { canAccess } from "../features/plan/entitlements";
import { useProfile } from "../features/profile/useProfile";
import {
  favoriteRecipe,
  likeRecipe,
  unfavoriteRecipe,
  unlikeRecipe,
} from "../features/recipes/recipeService";
import { useFavoriteRecipes } from "../features/recipes/useFavoriteRecipes";
import { recipeDetailQueryOptions } from "../features/recipes/queryOptions";
import type {
  RecipeCategorySummary,
  RecipeListItem,
  RecipeSortOption,
} from "../features/recipes/types";
import { useShoppingLists } from "../features/shopping-list/useShoppingLists";

const DEFAULT_SORT: RecipeSortOption = "latest";
const ALL_CATEGORY_KEY = "all";
const SCROLL_STORAGE_KEY = "favorites-scroll-position";
const DEFAULT_DIET = "all";

type RecipeDietFilter = "all" | "vegetarian" | "vegan";

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
      label: "Alle Favoriten",
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
  diet: RecipeDietFilter,
) {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = recipes.filter((recipe) => {
    const matchesCategory =
      category === ALL_CATEGORY_KEY ||
      normalizeCategoryKey(recipe.category) === category;

    if (!matchesCategory) {
      return false;
    }

    if (diet === "vegan" && !recipe.isVegan) {
      return false;
    }

    if (diet === "vegetarian" && !recipe.isVegetarian && !recipe.isVegan) {
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

export function FavoritesPage() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openUpgrade } = useLayout();
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
  const { favorites, isLoading, error, reload } = useFavoriteRecipes(userId);
  const shoppingLists = useShoppingLists(userId, plan);

  const activeCategory =
    searchParams.get("category")?.trim().toLowerCase() || ALL_CATEGORY_KEY;
  const searchValue = searchParams.get("q") ?? "";
  const sortValue = (searchParams.get("sort") as RecipeSortOption) || DEFAULT_SORT;
  const dietParam = searchParams.get("diet");
  const dietFilter: RecipeDietFilter =
    dietParam === "vegetarian" || dietParam === "vegan" ? dietParam : DEFAULT_DIET;

  const categories = useMemo(() => buildCategorySummary(favorites), [favorites]);
  const filteredRecipes = useMemo(
    () => filterRecipes(favorites, activeCategory, searchValue, sortValue, dietFilter),
    [activeCategory, dietFilter, favorites, searchValue, sortValue],
  );
  const hasActiveFilters =
    activeCategory !== ALL_CATEGORY_KEY ||
    searchValue.trim().length > 0 ||
    sortValue !== DEFAULT_SORT ||
    dietFilter !== DEFAULT_DIET;

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

  function setDiet(diet: RecipeDietFilter) {
    const nextParams = new URLSearchParams(searchParams);
    updateParams(nextParams, "diet", diet, DEFAULT_DIET);
    setSearchParams(nextParams, { replace: true });
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
    recipeListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleToggleLike(recipeId: string) {
    const recipe = favorites.find((entry) => entry.id === recipeId);

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
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["recipe", userId, recipeId] }),
      ]);
    } finally {
      setLikePendingRecipeId(null);
    }
  }

  async function handleToggleFavorite(recipeId: string) {
    const recipe = favorites.find((entry) => entry.id === recipeId);

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
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["recipe", userId, recipeId] }),
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
              Gespeicherte Rezepte
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl">
              <BookMarked className="text-[#E7C26E]" size={28} />
              Favoriten
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7AA96] sm:text-base">
              Hier liegen nur Rezepte, die du bewusst gespeichert hast. Likes und
              Favoriten bleiben damit sauber getrennt.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <RecipeFilters
              activeCategory={activeCategory}
              categories={categories}
              dietFilter={dietFilter}
              onCategoryChange={setCategory}
              onDietChange={setDiet}
              searchValue={searchValue}
              sortValue={sortValue}
              onSearchChange={setSearch}
              onSortChange={setSort}
            />
          </div>
        </motion.section>

        <section ref={recipeListRef} className="mt-6 space-y-4">
          {!hasFavoritesAccess ? (
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D6A84A]/20 bg-[#D6A84A]/10 text-[#D6A84A]">
                <BookMarked size={22} />
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Nur mit Pro
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE]">
                Lieblingsrezepte speichern
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#B7AA96]">
                Mit Pro kannst du Rezepte als Favorit markieren und schnell
                wiederfinden – ganz ohne scrollen.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/recipes")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
                >
                  Rezepte entdecken
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => openUpgrade()}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D6A84A]/24 bg-[linear-gradient(180deg,rgba(214,168,74,0.22),rgba(214,168,74,0.12))] px-5 py-3 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/34"
                >
                  Pro entdecken
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                    Deine Merkliste
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-8 w-64 rounded-full" />
                  ) : (
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                      {filteredRecipes.length} gespeicherte Rezepte
                    </h2>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {isLoading ? (
                    <Skeleton className="h-4 w-44 rounded-full" />
                  ) : (
                    <p className="text-sm text-[#B7AA96]">
                      Filter aktiv:{" "}
                      {categories.find((entry) => entry.key === activeCategory)?.label ??
                        "Alle Favoriten"}
                    </p>
                  )}
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18 hover:text-[#FFF8EE]"
                    >
                      Filter zurücksetzen
                    </button>
                  ) : null}
                </div>
              </div>

              {isLoading ? (
                <RecipeOverviewSkeleton />
              ) : error ? (
                <ErrorStateCard
                  eyebrow="Laden fehlgeschlagen"
                  title="Favoriten konnten nicht geladen werden"
                  description={error}
                  action={
                    <button
                      type="button"
                      onClick={() => void reload()}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/20 hover:bg-white/[0.045]"
                    >
                      Erneut versuchen
                    </button>
                  }
                />
              ) : favorites.length === 0 ? (
                <EmptyStateCard
                  eyebrow="Noch leer"
                  title="Noch keine Favoriten gespeichert"
                  description="Nutze das Bookmark an einem Rezept, um dir Gerichte gezielt für später zu merken."
                  action={
                    <button
                      type="button"
                      onClick={() => navigate("/recipes")}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/20"
                    >
                      Rezepte entdecken
                      <ArrowRight size={16} />
                    </button>
                  }
                />
              ) : filteredRecipes.length === 0 ? (
                <EmptyStateCard
                  eyebrow="Kein Treffer"
                  title="Keine Favoriten passen zu deinem Filter"
                  description="Passe Suche, Kategorie oder Sortierung an oder setze die Filter direkt zurück."
                  action={
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/20"
                    >
                      Filter zurücksetzen
                    </button>
                  }
                />
              ) : (
                <RecipeOverview
                  addToShoppingListPendingRecipeId={shoppingListPendingRecipeId}
                  recipes={filteredRecipes}
                  onAddToShoppingList={
                    hasShoppingListAccess
                      ? handleOpenShoppingListDialog
                      : () => openUpgrade()
                  }
                  onPrefetchRecipe={handlePrefetchRecipe}
                  onSelectRecipe={handleSelectRecipe}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleLike={handleToggleLike}
                  favoritePendingRecipeId={favoritePendingRecipeId}
                  likePendingRecipeId={likePendingRecipeId}
                  emptyMessage=""
                />
              )}
            </>
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
          favorites.find((recipe) => recipe.id === selectedRecipeForShoppingListId)?.servings ?? 1
        }
        recipeTitle={
          favorites.find((recipe) => recipe.id === selectedRecipeForShoppingListId)?.title ??
          "Rezept"
        }
      />
    </main>
  );
}
