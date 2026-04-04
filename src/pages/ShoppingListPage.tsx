import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ClipboardList,
  FolderPlus,
  Heart,
  LayoutGrid,
  MessageSquareText,
  Pencil,
  RotateCcw,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { FeedbackModal } from "../components/feedback/FeedbackModal";
import { NavDrawer, type NavDrawerItem } from "../components/layout/NavDrawer";
import { RecipeOverview } from "../components/recipes/RecipeOverview";
import { ShoppingListEditDialog } from "../components/shopping-list/ShoppingListEditDialog";
import { ShoppingListPickerDialog } from "../components/shopping-list/ShoppingListPickerDialog";
import { useAuth } from "../features/auth/useAuth";
import { useProfile } from "../features/profile/useProfile";
import {
  favoriteRecipe,
  likeRecipe,
  unfavoriteRecipe,
  unlikeRecipe,
} from "../features/recipes/recipeService";
import { recipeDetailQueryOptions } from "../features/recipes/queryOptions";
import { useRecipes } from "../features/recipes/useRecipes";
import { useShoppingLists } from "../features/shopping-list/useShoppingLists";

export function ShoppingListPage() {
  const queryClient = useQueryClient();
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listSuccess, setListSuccess] = useState<string | null>(null);
  const [favoritePendingRecipeId, setFavoritePendingRecipeId] = useState<string | null>(null);
  const [likePendingRecipeId, setLikePendingRecipeId] = useState<string | null>(null);
  const [shoppingListPendingRecipeId, setShoppingListPendingRecipeId] = useState<string | null>(null);
  const [isShoppingListDialogOpen, setIsShoppingListDialogOpen] = useState(false);
  const [isListEditDialogOpen, setIsListEditDialogOpen] = useState(false);
  const [shoppingListError, setShoppingListError] = useState<string | null>(null);
  const [selectedRecipeForShoppingListId, setSelectedRecipeForShoppingListId] = useState<string | null>(null);
  const [selectedListForEditId, setSelectedListForEditId] = useState<string | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const hadIncompleteItemsRef = useRef(false);

  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const metadataName =
    typeof session?.user.user_metadata.full_name === "string"
      ? session.user.user_metadata.full_name
      : "";
  const { profile } = useProfile(userId);
  const { recipes, reload } = useRecipes(userId);
  const shoppingLists = useShoppingLists(userId, profile?.plan ?? "free");
  const previewRecipes = useMemo(() => recipes.slice(0, 4), [recipes]);
  const hasCompletedAllItems =
    shoppingLists.aggregatedItems.length > 0 &&
    shoppingLists.aggregatedItems.every((item) => item.isChecked);

  useEffect(() => {
    if (shoppingLists.aggregatedItems.length === 0) {
      hadIncompleteItemsRef.current = false;
      if (isCompletionDialogOpen) {
        setIsCompletionDialogOpen(false);
      }
      return;
    }

    const hasUncheckedItems = shoppingLists.aggregatedItems.some((item) => !item.isChecked);

    if (hasUncheckedItems) {
      hadIncompleteItemsRef.current = true;
      return;
    }

    if (hadIncompleteItemsRef.current && hasCompletedAllItems) {
      setIsCompletionDialogOpen(true);
      hadIncompleteItemsRef.current = false;
    }
  }, [hasCompletedAllItems, isCompletionDialogOpen, shoppingLists.aggregatedItems]);

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

  function handleCreateList() {
    try {
      const nextList = shoppingLists.createList(newListName);
      setNewListName("");
      setListError(null);
      setListSuccess(`„${nextList.name}“ wurde angelegt.`);
    } catch (createError) {
      setListSuccess(null);
      setListError(
        createError instanceof Error
          ? createError.message
          : "Die Liste konnte nicht erstellt werden.",
      );
    }
  }

  function openListEditDialog(listId: string) {
    setSelectedListForEditId(listId);
    setIsListEditDialogOpen(true);
    setListError(null);
    setListSuccess(null);
  }

  function handleRenameList(name: string) {
    if (!selectedListForEditId) {
      return;
    }

    try {
      shoppingLists.renameList(selectedListForEditId, name);
      setListSuccess("Liste wurde umbenannt.");
    } catch (renameError) {
      setListSuccess(null);
      setListError(
        renameError instanceof Error
          ? renameError.message
          : "Die Liste konnte nicht umbenannt werden.",
      );
    }
  }

  function handleUpdateRecipeServings(shoppingListRecipeId: string, servings: number) {
    if (!selectedListForEditId) {
      return;
    }

    try {
      shoppingLists.updateRecipeServings(selectedListForEditId, shoppingListRecipeId, servings);
      setListError(null);
      setListSuccess("Portionen wurden aktualisiert.");
    } catch (updateError) {
      setListSuccess(null);
      setListError(
        updateError instanceof Error
          ? updateError.message
          : "Die Portionen konnten nicht aktualisiert werden.",
      );
    }
  }

  function handleRemoveRecipe(shoppingListRecipeId: string) {
    if (!selectedListForEditId) {
      return;
    }

    shoppingLists.removeRecipe(selectedListForEditId, shoppingListRecipeId);
    setListError(null);
    setListSuccess("Rezept wurde aus der Liste entfernt.");
  }

  function handleResetCompletedList() {
    shoppingLists.resetSelectedListChecks();
    setIsCompletionDialogOpen(false);
    setListError(null);
    setListSuccess("Alle Haken wurden zurückgesetzt.");
  }

  function handleClearCompletedList() {
    shoppingLists.clearSelectedList();
    setOpenItemKey(null);
    setIsCompletionDialogOpen(false);
    setListError(null);
    setListSuccess("Die Liste wurde geleert.");
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

      await reload();
    } finally {
      setLikePendingRecipeId(null);
    }
  }

  async function handleToggleFavorite(recipeId: string) {
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

      await reload();
    } finally {
      setFavoritePendingRecipeId(null);
    }
  }

  function handleSelectRecipe(recipeId: string) {
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

  const selectedListForEdit =
    shoppingLists.lists.find((list) => list.id === selectedListForEditId) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <NavDrawer
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
          className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Planung
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl">
                <ClipboardList className="text-[#D6A84A]" size={28} />
                Einkaufsliste
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7AA96] sm:text-base">
                Zutaten sammeln und zusammenführen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#D5C5AF]">
              <div className="inline-flex w-fit rounded-full border border-white/8 bg-black/10 px-4 py-2.5">
                {shoppingLists.lists.length}/{shoppingLists.maxLists} Listen
              </div>
              <span className="text-[#9F917D]">
                {(profile?.plan ?? "free") === "pro" ? "Pro" : "Free"}-Plan
              </span>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                  Listen
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                  Deine Einkaufslisten
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigate("/recipes")}
                className="inline-flex h-10 w-full items-center justify-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18 sm:w-auto"
              >
                <BookOpen size={16} />
                Rezepte öffnen
              </button>
            </div>

            <div className="mt-5 border-t border-white/8 pt-5">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleCreateList();
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  data-testid="shopping-list-name-input"
                  value={newListName}
                  onChange={(event) => {
                    setNewListName(event.target.value);
                    if (listError) {
                      setListError(null);
                    }
                    if (listSuccess) {
                      setListSuccess(null);
                    }
                  }}
                  placeholder="Neue Liste, z. B. Wochenendeinkauf"
                  disabled={shoppingLists.hasReachedLimit}
                  className="h-12 w-full flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A] disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  data-testid="shopping-list-create-button"
                  disabled={shoppingLists.hasReachedLimit || !newListName.trim()}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-5 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28 disabled:translate-y-0 disabled:opacity-50 sm:w-auto"
                >
                  <FolderPlus size={16} />
                  Liste anlegen
                </button>
              </form>

              {listError ? (
                <p className="mt-3 text-sm text-red-200">{listError}</p>
              ) : null}

              {listSuccess ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#E9D8B4]">
                  <CheckCircle2 size={15} />
                  {listSuccess}
                </p>
              ) : null}

              {shoppingLists.hasReachedLimit ? (
                <p className="mt-3 text-sm text-[#D5C5AF]">
                  Dein aktueller Plan erlaubt maximal {shoppingLists.maxLists} Listen.
                </p>
              ) : null}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/8 pt-5">
              {shoppingLists.lists.length > 0 ? (
                shoppingLists.lists.map((list, index) => {
                  const isActive = shoppingLists.selectedListId === list.id;
                  return (
                    <div
                      key={list.id}
                      className={`rounded-[22px] border px-4 py-4 transition-colors duration-300 ${
                        isActive
                          ? "border-[#D6A84A]/24 bg-[rgba(214,168,74,0.1)]"
                          : "border-white/8 bg-black/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => shoppingLists.setSelectedListId(list.id)}
                          data-testid={`shopping-list-select-${list.id}`}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E9D8B4]/10 bg-white/[0.03] text-xs font-semibold text-[#E9D8B4]">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#FFF8EE]">
                              {list.name}
                            </p>
                            <p className="text-xs text-[#A99883]">
                              {list.recipes.length} Rezept
                              {list.recipes.length === 1 ? "" : "e"}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openListEditDialog(list.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => shoppingLists.deleteList(list.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.08)] text-red-100 transition-colors duration-300 hover:bg-[rgba(255,120,120,0.14)]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/8 px-4 py-5 text-sm leading-6 text-[#D5C5AF]">
                  Noch keine Liste.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
              Übersicht
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
              {shoppingLists.selectedList
                ? shoppingLists.selectedList.name
                : "Keine Liste gewählt"}
            </h2>

            {shoppingLists.selectedList ? (
              <>
                <p className="mt-3 text-sm leading-6 text-[#B7AA96]">
                  Zusammengeführte Zutaten der aktiven Liste.
                </p>

                <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                  {shoppingLists.aggregatedItems.length > 0 ? (
                    shoppingLists.aggregatedItems.map((item) => {
                      const isOpen = openItemKey === item.key;

                      return (
                        <div
                          key={item.key}
                          className="overflow-hidden rounded-[22px] border border-white/8 bg-black/10"
                        >
                          <div className="flex items-center gap-3 px-4 py-3">
                            <button
                              type="button"
                              onClick={() => shoppingLists.toggleItemChecked(item.key)}
                              data-testid={`shopping-list-item-toggle-${item.key}`}
                              className={`h-5 w-5 rounded border transition-colors duration-300 ${
                                item.isChecked
                                  ? "border-[#D6A84A] bg-[#D6A84A]"
                                  : "border-white/14 bg-transparent"
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setOpenItemKey((current) =>
                                  current === item.key ? null : item.key,
                                )
                              }
                              className="flex flex-1 items-center justify-between gap-4 text-left"
                            >
                              <div>
                                <p
                                  className={`text-sm font-medium ${
                                    item.isChecked
                                      ? "text-[#8E806F] line-through"
                                      : "text-[#FFF8EE]"
                                  }`}
                                >
                                  {item.displayName}
                                </p>
                                <p className="text-xs text-[#A99883]">
                                  {item.sourceCount} Quelle
                                  {item.sourceCount === 1 ? "" : "n"}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-sm ${
                                    item.isChecked
                                      ? "text-[#8E806F] line-through"
                                      : "text-[#D5C5AF]"
                                  }`}
                                >
                                  {[item.amountDisplay, item.unit].filter(Boolean).join(" ")}
                                </span>
                                <ChevronDown
                                  size={16}
                                  className={`text-[#B89A67] transition-transform duration-300 ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </button>
                          </div>

                          {isOpen ? (
                            <div className="border-t border-white/8 px-4 py-4">
                              <div className="space-y-2">
                                {item.sources.map((source) => (
                                  <div
                                    key={`${source.recipeId}-${source.ingredientId}`}
                                    className={`flex items-center justify-between gap-4 rounded-[18px] border border-white/8 px-3 py-3 text-sm ${
                                      item.isChecked ? "bg-white/[0.015]" : "bg-white/[0.02]"
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <span
                                        className={`block truncate ${
                                          item.isChecked
                                            ? "text-[#8E806F] line-through"
                                            : "text-[#FFF8EE]"
                                        }`}
                                      >
                                        {source.recipeTitle}
                                      </span>
                                      <span
                                        className={`block text-xs ${
                                          item.isChecked ? "text-[#7F7365]" : "text-[#A99883]"
                                        }`}
                                      >
                                        {source.ingredientName}
                                      </span>
                                    </div>
                                    <span
                                      className={`${
                                        item.isChecked
                                          ? "text-[#8E806F] line-through"
                                          : "text-[#C9B79F]"
                                      }`}
                                    >
                                      {[source.amountDisplay, source.unit]
                                        .filter(Boolean)
                                        .join(" ")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-[#D5C5AF]">
                        In dieser Liste liegen noch keine Rezeptzutaten.
                      </div>

                      <div className="border-t border-white/8 pt-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                          Rezepte hinzufügen
                        </p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                          Direkt aus deinen Rezepten
                        </h3>

                        <div className="mt-4">
                          <RecipeOverview
                            addToShoppingListPendingRecipeId={shoppingListPendingRecipeId}
                            recipes={previewRecipes}
                            onAddToShoppingList={handleOpenShoppingListDialog}
                            onPrefetchRecipe={handlePrefetchRecipe}
                            onSelectRecipe={handleSelectRecipe}
                            onToggleFavorite={handleToggleFavorite}
                            onToggleLike={handleToggleLike}
                            favoritePendingRecipeId={favoritePendingRecipeId}
                            likePendingRecipeId={likePendingRecipeId}
                            emptyMessage="Noch keine Rezepte vorhanden."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-white/8 px-4 py-5 text-sm leading-6 text-[#D5C5AF]">
                Keine Liste gewählt.
              </div>
            )}
          </section>
        </div>
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
        plan={profile?.plan ?? "free"}
        recipeServings={
          recipes.find((recipe) => recipe.id === selectedRecipeForShoppingListId)?.servings ?? 1
        }
        recipeTitle={
          recipes.find((recipe) => recipe.id === selectedRecipeForShoppingListId)?.title ??
          "Rezept"
        }
      />

      <ShoppingListEditDialog
        error={listError}
        isOpen={isListEditDialogOpen}
        list={selectedListForEdit}
        onClose={() => {
          setIsListEditDialogOpen(false);
          setSelectedListForEditId(null);
          setListError(null);
        }}
        onDeleteRecipe={handleRemoveRecipe}
        onRenameList={handleRenameList}
        onUpdateRecipeServings={handleUpdateRecipeServings}
      />

      {isCompletionDialogOpen && shoppingLists.selectedList ? (
        <>
          <motion.button
            type="button"
            aria-label="Dialog schließen"
            onClick={() => setIsCompletionDialogOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-[95] flex items-center justify-center px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                    Einkaufsliste
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE]">
                    Liste abgearbeitet
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#B7AA96]">
                    Alle Zutaten in „{shoppingLists.selectedList.name}“ sind abgehakt. Möchtest du
                    die Liste leeren oder nur die Haken zurücksetzen?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCompletionDialogOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#CDB99B] transition-all duration-300 hover:border-[#D6A84A]/18 hover:text-[#FFF8EE]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleResetCompletedList}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
                >
                  <RotateCcw size={16} />
                  Haken zurücksetzen
                </button>
                <button
                  type="button"
                  onClick={handleClearCompletedList}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-5 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28"
                >
                  <Trash2 size={16} />
                  Liste leeren
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </main>
  );
}
