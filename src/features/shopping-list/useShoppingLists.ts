import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { RecipeDetailData } from "../recipes/types";
import {
  fetchShoppingLists,
  insertShoppingList,
  removeShoppingList,
  updateShoppingList,
} from "./shoppingListService";
import {
  aggregateShoppingListItems,
  applyAddRecipe,
  applyClearList,
  applyRemoveRecipe,
  applyRenameList,
  applyResetChecks,
  applyToggleItemChecked,
  applyUpdateRecipeServings,
  getMaxShoppingListsForPlan,
  loadShoppingLists,
} from "./storage";
import type { ShoppingList, ShoppingListPlan } from "./types";

function shoppingListsQueryKey(userId: string) {
  return ["shopping-lists", userId] as const;
}

async function migrateLocalStorageIfNeeded(
  userId: string,
  remoteLists: ShoppingList[],
): Promise<ShoppingList[]> {
  if (remoteLists.length > 0) return remoteLists;

  const localLists = loadShoppingLists(userId);
  if (localLists.length === 0) return remoteLists;

  const migrated: ShoppingList[] = [];

  for (const list of localLists) {
    try {
      const created = await insertShoppingList(userId, list.name);
      await updateShoppingList(created.id, {
        recipes: list.recipes,
        checkedItemKeys: list.checkedItemKeys,
      });
      migrated.push({ ...created, recipes: list.recipes, checkedItemKeys: list.checkedItemKeys });
    } catch {
      // skip failed migrations silently
    }
  }

  return migrated.length > 0 ? migrated : remoteLists;
}

type UseShoppingListsResult = {
  addRecipe: (
    listId: string,
    recipe: Pick<RecipeDetailData, "id" | "ingredients" | "servings" | "title">,
    targetServings: number,
  ) => void;
  aggregatedItems: ReturnType<typeof aggregateShoppingListItems>;
  clearSelectedList: () => void;
  createList: (name: string) => ShoppingList;
  deleteList: (listId: string) => void;
  hasReachedLimit: boolean;
  lists: ShoppingList[];
  maxLists: number;
  renameList: (listId: string, name: string) => void;
  removeRecipe: (listId: string, shoppingListRecipeId: string) => void;
  resetSelectedListChecks: () => void;
  selectedList: ShoppingList | null;
  selectedListId: string | null;
  setSelectedListId: (listId: string) => void;
  toggleItemChecked: (itemKey: string) => void;
  updateRecipeServings: (
    listId: string,
    shoppingListRecipeId: string,
    targetServings: number,
  ) => void;
};

export function useShoppingLists(
  userId: string,
  plan: ShoppingListPlan,
): UseShoppingListsResult {
  const queryClient = useQueryClient();
  const [selectedListId, setSelectedListIdState] = useState<string | null>(null);

  const { data: lists = [] } = useQuery({
    queryKey: shoppingListsQueryKey(userId),
    queryFn: async () => {
      const remote = await fetchShoppingLists(userId);
      return migrateLocalStorageIfNeeded(userId, remote);
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const selectedList = useMemo(() => {
    if (selectedListId) {
      const found = lists.find((l) => l.id === selectedListId);
      if (found) return found;
    }
    return lists[0] ?? null;
  }, [lists, selectedListId]);

  const aggregatedItems = useMemo(
    () => (selectedList ? aggregateShoppingListItems(selectedList) : []),
    [selectedList],
  );

  const maxLists = getMaxShoppingListsForPlan(plan);

  const optimisticUpdate = useCallback(
    (updater: (current: ShoppingList[]) => ShoppingList[]) => {
      queryClient.setQueryData<ShoppingList[]>(
        shoppingListsQueryKey(userId),
        (current) => updater(current ?? []),
      );
    },
    [queryClient, userId],
  );

  function setSelectedListId(listId: string) {
    setSelectedListIdState(listId);
  }

  function createList(name: string): ShoppingList {
    const now = new Date().toISOString();
    const tempId = `temp-${crypto.randomUUID()}`;
    const newList: ShoppingList = {
      checkedItemKeys: [],
      createdAt: now,
      id: tempId,
      name: name.trim(),
      ownerId: userId,
      ownerName: null,
      recipes: [],
      updatedAt: now,
    };

    optimisticUpdate((current) => [newList, ...current]);
    setSelectedListIdState(tempId);

    void insertShoppingList(userId, name).then((created) => {
      optimisticUpdate((current) =>
        current.map((l) => (l.id === tempId ? { ...newList, id: created.id } : l)),
      );
      setSelectedListIdState((prev) => (prev === tempId ? created.id : prev));
    });

    return newList;
  }

  function deleteList(listId: string) {
    optimisticUpdate((current) => current.filter((l) => l.id !== listId));
    setSelectedListIdState((current) => {
      if (current !== listId) return current;
      return lists.find((l) => l.id !== listId)?.id ?? null;
    });
    void removeShoppingList(listId);
  }

  function renameList(listId: string, name: string) {
    const nextLists = applyRenameList(lists, listId, name);
    optimisticUpdate(() => nextLists);
    const list = nextLists.find((l) => l.id === listId);
    if (list) void updateShoppingList(listId, { name: list.name });
  }

  function addRecipe(
    listId: string,
    recipe: Pick<RecipeDetailData, "id" | "ingredients" | "servings" | "title">,
    targetServings: number,
  ) {
    const nextLists = applyAddRecipe(lists, listId, recipe, targetServings);
    optimisticUpdate(() => nextLists);
    setSelectedListIdState(listId);
    const list = nextLists.find((l) => l.id === listId);
    if (list) void updateShoppingList(listId, { recipes: list.recipes });
  }

  function removeRecipe(listId: string, shoppingListRecipeId: string) {
    const nextLists = applyRemoveRecipe(lists, listId, shoppingListRecipeId);
    optimisticUpdate(() => nextLists);
    const list = nextLists.find((l) => l.id === listId);
    if (list) void updateShoppingList(listId, { recipes: list.recipes });
  }

  function updateRecipeServings(
    listId: string,
    shoppingListRecipeId: string,
    targetServings: number,
  ) {
    const nextLists = applyUpdateRecipeServings(lists, listId, shoppingListRecipeId, targetServings);
    optimisticUpdate(() => nextLists);
    const list = nextLists.find((l) => l.id === listId);
    if (list) void updateShoppingList(listId, { recipes: list.recipes });
  }

  function toggleItemChecked(itemKey: string) {
    if (!selectedList) return;
    const nextLists = applyToggleItemChecked(lists, selectedList.id, itemKey);
    optimisticUpdate(() => nextLists);
    const list = nextLists.find((l) => l.id === selectedList.id);
    if (list) void updateShoppingList(selectedList.id, { checkedItemKeys: list.checkedItemKeys });
  }

  function resetSelectedListChecks() {
    if (!selectedList) return;
    const nextLists = applyResetChecks(lists, selectedList.id);
    optimisticUpdate(() => nextLists);
    void updateShoppingList(selectedList.id, { checkedItemKeys: [] });
  }

  function clearSelectedList() {
    if (!selectedList) return;
    const nextLists = applyClearList(lists, selectedList.id);
    optimisticUpdate(() => nextLists);
    void updateShoppingList(selectedList.id, { recipes: [], checkedItemKeys: [] });
  }

  return {
    addRecipe,
    aggregatedItems,
    clearSelectedList,
    createList,
    deleteList,
    hasReachedLimit: lists.length >= maxLists,
    lists,
    maxLists,
    renameList,
    removeRecipe,
    resetSelectedListChecks,
    selectedList,
    selectedListId: selectedList?.id ?? null,
    setSelectedListId,
    toggleItemChecked,
    updateRecipeServings,
  };
}
