import { AnimatePresence, motion } from "framer-motion";
import { Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRecipeIngredientAmount } from "../../features/recipes/types";
import type { ShoppingList } from "../../features/shopping-list/types";

type ShoppingListEditDialogProps = {
  error?: string | null;
  isOpen: boolean;
  list: ShoppingList | null;
  onClose: () => void;
  onDeleteRecipe: (shoppingListRecipeId: string) => void;
  onRenameList: (name: string) => void;
  onUpdateRecipeServings: (shoppingListRecipeId: string, servings: number) => void;
};

export function ShoppingListEditDialog({
  error = null,
  isOpen,
  list,
  onClose,
  onDeleteRecipe,
  onRenameList,
  onUpdateRecipeServings,
}: ShoppingListEditDialogProps) {
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !list) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Dialog-Reset beim Öffnen: intentional
    setName(list.name);
    setLocalError(null);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, list]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !list) {
    return null;
  }

  function handleRename() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setLocalError("Bitte vergib einen Namen für die Liste.");
      return;
    }

    setLocalError(null);
    onRenameList(trimmedName);
  }

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        aria-label="Dialog schließen"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
      />

      <div className="fixed inset-0 z-[95] overflow-y-auto px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,74,0.12),transparent_34%)]" />

            <div className="relative z-10 border-b border-white/8 px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                    Einkaufsliste
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-3xl">
                    Liste bearbeiten
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#B7AA96]">
                    Name anpassen, Rezepte entfernen oder Portionen korrigieren.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#CDB99B] transition-all duration-300 hover:border-[#D6A84A]/18 hover:text-[#FFF8EE]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative z-10 space-y-5 px-5 py-5 sm:px-7">
              <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                <div className="flex items-center gap-2">
                  <Pencil size={16} className="text-[#D6A84A]" />
                  <p className="text-sm font-medium text-[#FFF8EE]">Listenname</p>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (localError) {
                        setLocalError(null);
                      }
                    }}
                    className="h-12 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]"
                  />
                  <button
                    type="button"
                    onClick={handleRename}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-5 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28"
                  >
                    Speichern
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#FFF8EE]">Rezepte in der Liste</p>
                    <p className="mt-1 text-xs text-[#A99883]">
                      {list.recipes.length} Rezept{list.recipes.length === 1 ? "" : "e"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {list.recipes.length > 0 ? (
                    list.recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="rounded-[22px] border border-white/8 bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#FFF8EE]">
                              {recipe.recipeTitle}
                            </p>
                            <p className="mt-1 text-xs text-[#A99883]">
                              {recipe.ingredients.length} Zutat
                              {recipe.ingredients.length === 1 ? "" : "en"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => onDeleteRecipe(recipe.id)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.08)] text-red-100 transition-colors duration-300 hover:bg-[rgba(255,120,120,0.14)]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="text-xs uppercase tracking-[0.18em] text-[#B89A67]">
                            Portionen
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateRecipeServings(recipe.id, Math.max(1, (recipe.servings ?? 1) - 1))
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
                            >
                              <Minus size={16} />
                            </button>

                            <input
                              type="number"
                              min={1}
                              value={recipe.servings ?? 1}
                              onChange={(event) =>
                                onUpdateRecipeServings(
                                  recipe.id,
                                  Math.max(
                                    1,
                                    Number.parseInt(event.target.value || "1", 10) || 1,
                                  ),
                                )
                              }
                              className="h-10 w-20 rounded-full border border-white/10 bg-white/[0.03] px-3 text-center text-sm text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />

                            <button
                              type="button"
                              onClick={() => onUpdateRecipeServings(recipe.id, (recipe.servings ?? 1) + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[18px] border border-white/8 bg-black/10 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#8D7E6E]">
                            Zutatenvorschau
                          </p>
                          <div className="mt-3 space-y-2">
                            {recipe.ingredients.slice(0, 4).map((ingredient) => (
                              <div
                                key={ingredient.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="text-[#FFF8EE]">{ingredient.name}</span>
                                <span className="text-[#C9B79F]">
                                  {formatRecipeIngredientAmount(ingredient)}
                                  {ingredient.unit ? ` ${ingredient.unit}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                          {recipe.ingredients.length > 4 ? (
                            <p className="mt-3 text-xs text-[#A99883]">
                              +{recipe.ingredients.length - 4} weitere Zutaten
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-white/8 px-4 py-5 text-sm text-[#D5C5AF]">
                      Noch keine Rezepte in dieser Liste.
                    </div>
                  )}
                </div>
              </div>

              {localError || error ? (
                <div className="rounded-[22px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
                  {error ?? localError}
                </div>
              ) : null}

              <div className="flex justify-end border-t border-white/8 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
