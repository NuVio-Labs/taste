import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Heart, LayoutGrid, MessageSquareText, Tag } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FeedbackModal } from "../components/feedback/FeedbackModal";
import { NavDrawer, type NavDrawerItem } from "../components/layout/NavDrawer";
import { RecipeDetail } from "../components/recipes/RecipeDetail";
import { RecipeCreateModal } from "../components/recipes/RecipeCreateModal";
import { ShoppingListPickerDialog } from "../components/shopping-list/ShoppingListPickerDialog";
import { useAuth } from "../features/auth/useAuth";
import { useProfile } from "../features/profile/useProfile";
import {
  deleteRecipe,
  favoriteRecipe,
  likeRecipe,
  unfavoriteRecipe,
  unlikeRecipe,
} from "../features/recipes/recipeService";
import { useRecipe } from "../features/recipes/useRecipe";
import { useShoppingLists } from "../features/shopping-list/useShoppingLists";

export function RecipeDetailPage() {
  const queryClient = useQueryClient();
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "" } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isShoppingListDialogOpen, setIsShoppingListDialogOpen] = useState(false);
  const [shoppingListError, setShoppingListError] = useState<string | null>(null);
  const [shoppingListSuccess, setShoppingListSuccess] = useState<string | null>(null);

  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const metadataName =
    typeof session?.user.user_metadata.full_name === "string"
      ? session.user.user_metadata.full_name
      : "";
  const { profile } = useProfile(userId);
  const { recipe, isLoading, error } = useRecipe(userId, id);
  const shoppingLists = useShoppingLists(userId, profile?.plan ?? "free");
  const canManageRecipe = recipe?.userId === userId;

  const navItems: NavDrawerItem[] = useMemo(
    () => [
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
    ],
    [],
  );

  async function handleLogout() {
    await signOut();
  }

  function handleBack() {
    const state = location.state as
      | {
          fromPath?: string;
          fromSearch?: string;
        }
      | undefined;

    navigate(`${state?.fromPath ?? "/recipes"}${state?.fromSearch ?? ""}`);
  }

  async function handleDelete() {
    if (!userId || !recipe) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteRecipe(userId, recipe.id);
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
      <NavDrawer
        _onCreateRecipe={() => setIsCreateRecipeOpen(true)}
        isOpen={isDrawerOpen}
        items={navItems}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
        onToggle={() => setIsDrawerOpen((previous) => !previous)}
        userId={userId}
        userEmail={userEmail}
        userName={profile?.username || metadataName}
        plan={profile?.plan ?? "free"}
        profileTo="/profile"
      />

      <RecipeCreateModal
        open={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        recipe={recipe}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ["recipe", userId, id] });
          void queryClient.invalidateQueries({ queryKey: ["recipes", userId] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        }}
      />

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentPage={`${location.pathname}${location.search}`}
        userId={userId}
        userEmail={userEmail}
        username={profile?.username || metadataName}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {isLoading ? (
            <div className="rounded-[24px] border border-white/8 bg-white/[0.025] px-4 py-5 text-sm text-[#B7AA96]">
              Rezept wird geladen...
            </div>
          ) : error || !recipe ? (
            <div className="rounded-[24px] border border-[rgba(214,168,74,0.14)] bg-[rgba(255,255,255,0.025)] px-4 py-5 text-sm leading-6 text-[#D9C9B1]">
              Das Rezept konnte nicht geladen werden.
              <div className="mt-2 text-[#A99883]">
                {error ?? "Rezept nicht gefunden."}
              </div>
            </div>
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
                onAddToShoppingList={() => {
                  setShoppingListSuccess(null);
                  setShoppingListError(null);
                  setIsShoppingListDialogOpen(true);
                }}
                onBack={handleBack}
                onEdit={() => setIsCreateRecipeOpen(true)}
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
        plan={profile?.plan ?? "free"}
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
