import { useEffect, useMemo, useState } from "react";
import type { RecipeDetailData } from "../recipes/types";
import {
  addRecipeToShoppingList,
  aggregateShoppingListItems,
  clearShoppingList,
  createShoppingList,
  deleteShoppingList,
  getMaxShoppingListsForPlan,
  loadShoppingLists,
  renameShoppingList,
  resetShoppingListChecks,
  removeRecipeFromShoppingList,
  toggleShoppingListItemChecked,
  updateShoppingListRecipeServings,
} from "./storage";
import type { ShoppingList, ShoppingListPlan } from "./types";

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
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedListId, setSelectedListIdState] = useState<string | null>(null);

  useEffect(() => {
    const nextLists = loadShoppingLists(userId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(nextLists);
    setSelectedListIdState((current) => {
      if (current && nextLists.some((list) => list.id === current)) {
        return current;
      }

      return nextLists[0]?.id ?? null;
    });
  }, [userId]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (!userId || !event.key?.includes("taste.shopping-lists")) {
        return;
      }

      const nextLists = loadShoppingLists(userId);
      setLists(nextLists);
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userId]);

  const selectedList =
    lists.find((list) => list.id === selectedListId) ?? lists[0] ?? null;

  const aggregatedItems = useMemo(
    () => (selectedList ? aggregateShoppingListItems(selectedList) : []),
    [selectedList],
  );

  const maxLists = getMaxShoppingListsForPlan(plan);

  function setSelectedListId(listId: string) {
    setSelectedListIdState(listId);
  }

  function createList(name: string) {
    const nextList = createShoppingList(userId, name, plan);
    const nextLists = loadShoppingLists(userId);
    setLists(nextLists);
    setSelectedListIdState(nextList.id);
    return nextList;
  }

  function addRecipe(
    listId: string,
    recipe: Pick<RecipeDetailData, "id" | "ingredients" | "servings" | "title">,
    targetServings: number,
  ) {
    const nextLists = addRecipeToShoppingList(userId, listId, recipe, targetServings);
    setLists(nextLists);
    setSelectedListIdState(listId);
  }

  function deleteList(listId: string) {
    const nextLists = deleteShoppingList(userId, listId);
    setLists(nextLists);
    setSelectedListIdState((current) => {
      if (current !== listId) {
        return current;
      }

      return nextLists[0]?.id ?? null;
    });
  }

  function renameList(listId: string, name: string) {
    const nextLists = renameShoppingList(userId, listId, name);
    setLists(nextLists);
  }

  function updateRecipeServings(
    listId: string,
    shoppingListRecipeId: string,
    targetServings: number,
  ) {
    const nextLists = updateShoppingListRecipeServings(
      userId,
      listId,
      shoppingListRecipeId,
      targetServings,
    );
    setLists(nextLists);
  }

  function removeRecipe(listId: string, shoppingListRecipeId: string) {
    const nextLists = removeRecipeFromShoppingList(userId, listId, shoppingListRecipeId);
    setLists(nextLists);
  }

  function toggleItemChecked(itemKey: string) {
    if (!selectedList) {
      return;
    }

    const nextLists = toggleShoppingListItemChecked(userId, selectedList.id, itemKey);
    setLists(nextLists);
  }

  function resetSelectedListChecks() {
    if (!selectedList) {
      return;
    }

    const nextLists = resetShoppingListChecks(userId, selectedList.id);
    setLists(nextLists);
  }

  function clearSelectedList() {
    if (!selectedList) {
      return;
    }

    const nextLists = clearShoppingList(userId, selectedList.id);
    setLists(nextLists);
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
