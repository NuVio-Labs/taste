import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RecipeDetail } from "../components/recipes/RecipeDetail";
import { CookingMode } from "../components/recipes/CookingMode";
const RecipeCreateModal = lazy(() =>
  import("../components/recipes/RecipeCreateModal").then((m) => ({ default: m.RecipeCreateModal })),
);
import { ShoppingListPickerDialog } from "../components/shopping-list/ShoppingListPickerDialog";
import { RecipeDetailSkeleton } from "../components/ui/PageSkeletons";
import { ErrorStateCard } from "../components/ui/StateCard";
import { useAuth } from "../features/auth/useAuth";
import { canAccess } from "../features/plan/entitlements";
import { useSwipeBack } from "../hooks/useSwipeBack";
import { useLayout } from "../contexts/LayoutContext";
import { useProfile } from "../features/profile/useProfile";
import { deleteRecipeImage } from "../features/recipes/imageUpload";
import {
  deleteRecipe,
  favoriteRecipe,
  likeRecipe,
  unfavoriteRecipe,
  unlikeRecipe,
} from "../features/recipes/recipeService";
import { useRecipe } from "../features/recipes/useRecipe";
import { trackRecentlyViewed } from "../features/recipes/useRecentlyViewed";
import { useShoppingLists } from "../features/shopping-list/useShoppingLists";

export function RecipeDetailPage() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "" } = useParams();
  const { openUpgrade } = useLayout();
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isShoppingListDialogOpen, setIsShoppingListDialogOpen] = useState(false);
  const [shoppingListError, setShoppingListError] = useState<string | null>(null);
  const [shoppingListSuccess, setShoppingListSuccess] = useState<string | null>(null);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [cookingServings, setCookingServings] = useState<number | null>(null);

  const userId = session?.user.id ?? "";
  const { profile } = useProfile(userId);
  const plan = profile?.plan ?? "free";
  const hasFavoritesAccess = canAccess(plan, "favorites");
  const hasShoppingListAccess = canAccess(plan, "shopping_list");
  const { recipe, isLoading, error, reload } = useRecipe(userId, id);
  const shoppingLists = useShoppingLists(userId, plan);
  const canManageRecipe = recipe?.userId === userId;

  useEffect(() => {
    if (userId && id && recipe) {
      trackRecentlyViewed(userId, id);
    }
  }, [userId, id, recipe]);

  const handleBack = useCallback(() => {
    const state = location.state as
      | {
          fromPath?: string;
          fromSearch?: string;
        }
      | undefined;

    navigate(`${state?.fromPath ?? "/recipes"}${state?.fromSearch ?? ""}`);
  }, [location.state, navigate]);

  useSwipeBack(handleBack);

  async function handleDelete() {
    if (!userId || !recipe) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const imageUrl = recipe.imageUrl;
      await deleteRecipe(userId, recipe.id);
      if (imageUrl) {
        await deleteRecipeImage(imageUrl).catch(() => {});
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", userId] }),
      ]);
      navigate("/recipes");
    } catch (deleteRecipeError) {
      setDeleteError(
        deleteRecipeError instanceof Error
          ? deleteRecipeError.message
          : "Das Rezept konnte nicht gelöscht werden.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleLike() {
    if (!userId || !recipe || isLikePending) {
      return;
    }

    setIsLikePending(true);

    try {
      if (recipe.isLiked) {
        await unlikeRecipe(userId, recipe.id);
      } else {
        await likeRecipe(userId, recipe.id);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recipe", userId, id] }),
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
      ]);
    } finally {
      setIsLikePending(false);
    }
  }

  async function handleToggleFavorite() {
    if (!hasFavoritesAccess) {
      openUpgrade();
      return;
    }

    if (!userId || !recipe || isFavoritePending) {
      return;
    }

    setIsFavoritePending(true);

    try {
      if (recipe.isFavorite) {
        await unfavoriteRecipe(userId, recipe.id);
      } else {
        await favoriteRecipe(userId, recipe.id);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recipe", userId, id] }),
        queryClient.invalidateQueries({ queryKey: ["recipes", userId] }),
        queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] }),
      ]);
    } finally {
      setIsFavoritePending(false);
    }
  }

  function handleOpenShoppingList() {
    if (!hasShoppingListAccess) {
      openUpgrade();
      return;
    }

    setShoppingListSuccess(null);
    setShoppingListError(null);
    setIsShoppingListDialogOpen(true);
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

  function handleConfirmAddToShoppingList(listId: string, servings: number) {
    if (!recipe) {
      return;
    }

    try {
      shoppingLists.addRecipe(listId, recipe, servings);
      setIsShoppingListDialogOpen(false);
      setShoppingListError(null);
      setShoppingListSuccess(`„${recipe.title}“ wurde zur Einkaufsliste hinzugefügt.`);
    } catch (addToListError) {
      setShoppingListError(
        addToListError instanceof Error
          ? addToListError.message
          : "Das Rezept konnte nicht zur Einkaufsliste hinzugefügt werden.",
      );
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <AnimatePresence>
        {isCookingMode && recipe ? (
          <CookingMode
            key="cooking-mode"
            recipe={recipe}
            servings={cookingServings ?? recipe.servings ?? 1}
            onClose={() => setIsCookingMode(false)}
          />
        ) : null}
      </AnimatePresence>

      <Suspense fallback={null}>
        <RecipeCreateModal
          open={isCreateRecipeOpen}
          onClose={() => setIsCreateRecipeOpen(false)}
          recipe={recipe}
          onCreated={() => {
            queryClient.removeQueries({ queryKey: ["recipe", userId, id] });
            void queryClient.invalidateQueries({ queryKey: ["recipes", userId] });
            void queryClient.invalidateQueries({ queryKey: ["favorite-recipes", userId] });
            void queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
          }}
        />
      </Suspense>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {isLoading ? (
            <RecipeDetailSkeleton />
          ) : error || !recipe ? (
            <ErrorStateCard
              eyebrow="Laden fehlgeschlagen"
              title="Rezept konnte nicht geladen werden"
              description={error ?? "Rezept nicht gefunden."}
              action={
                error ? (
                  <button
                    type="button"
                    onClick={() => void reload()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/20 hover:bg-white/[0.045]"
                  >
                    Erneut versuchen
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="space-y-4">
              {shoppingListSuccess ? (
                <div className="rounded-[24px] border border-[rgba(214,168,74,0.18)] bg-[rgba(214,168,74,0.08)] px-4 py-4 text-sm leading-6 text-[#F4E1B6]">
                  {shoppingListSuccess}
                </div>
              ) : null}

              {shoppingListError ? (
                <div className="rounded-[24px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-4 text-sm leading-6 text-red-200">
                  {shoppingListError}
                </div>
              ) : null}

              <RecipeDetail
                canManageRecipe={canManageRecipe}
                recipe={recipe}
                onAddToShoppingList={handleOpenShoppingList}
                onBack={handleBack}
                onEdit={() => setIsCreateRecipeOpen(true)}
                onStartCooking={(servings) => {
                  setCookingServings(servings);
                  setIsCookingMode(true);
                }}
                onToggleFavorite={() => {
                  void handleToggleFavorite();
                }}
                onToggleLike={() => {
                  void handleToggleLike();
                }}
                onDelete={() => {
                  setDeleteError(null);
                  setIsDeleteConfirmOpen(true);
                }}
                isDeleting={isDeleting}
                isFavoritePending={isFavoritePending}
                isLikePending={isLikePending}
              />
            </div>
          )}
        </motion.section>
      </div>

      <ShoppingListPickerDialog
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
        recipeServings={recipe?.servings ?? 1}
        recipeTitle={recipe?.title ?? "Rezept"}
      />

      {isDeleteConfirmOpen ? (
        <>
          <button
            type="button"
            aria-label="Löschdialog schließen"
            onClick={() => {
              if (!isDeleting) {
                setIsDeleteConfirmOpen(false);
                setDeleteError(null);
              }
            }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-[95] flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#B89A67]">
                Rezept löschen
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                Wirklich löschen?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#D5C5AF]">
                {recipe?.title
                  ? `„${recipe.title}“ wird dauerhaft entfernt.`
                  : "Dieses Rezept wird dauerhaft entfernt."}
              </p>

              {deleteError ? (
                <div className="mt-4 rounded-[22px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
                  {deleteError}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={isDeleting}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(255,120,120,0.22)] bg-[rgba(255,120,120,0.14)] px-5 text-sm font-medium text-red-100 transition-all duration-300 hover:bg-[rgba(255,120,120,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDeleting ? "Löscht..." : "Rezept löschen"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
