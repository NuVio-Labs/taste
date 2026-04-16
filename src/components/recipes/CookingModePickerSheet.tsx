import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookOpen, ChefHat, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  favoriteRecipesQueryOptions,
  recipesQueryOptions,
} from "../../features/recipes/queryOptions";
import { fetchRecipeById } from "../../features/recipes/recipeService";
import type { RecipeDetailData, RecipeListItem } from "../../features/recipes/types";

type Tab = "own" | "favorites";

type Props = {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSelect: (recipe: RecipeDetailData) => void;
};

export function CookingModePickerSheet({ isOpen, userId, onClose, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>("own");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: ownRecipes = [] } = useQuery(recipesQueryOptions(userId));
  const { data: favoriteRecipes = [] } = useQuery(favoriteRecipesQueryOptions(userId));

  async function handleSelect(recipeId: string) {
    setLoadingId(recipeId);
    try {
      const full = await fetchRecipeById(userId, recipeId);
      if (full) {
        onSelect(full);
        onClose();
      }
    } finally {
      setLoadingId(null);
    }
  }

  const recipes = tab === "own" ? ownRecipes : favoriteRecipes;

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-black/55 backdrop-blur-[3px]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[120] h-[82dvh] rounded-t-[32px] border-t border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.99)_0%,rgba(14,12,10,0.99)_100%)] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D6A84A]/24 bg-[#D6A84A]/10 text-[#F6D78E]">
                  <ChefHat size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#8D7E6E]">Kochmodus</p>
                  <p className="text-sm font-semibold text-[#FFF8EE]">Rezept wählen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-5 pb-4 shrink-0">
              <button
                type="button"
                onClick={() => setTab("own")}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  tab === "own"
                    ? "border-[#D6A84A]/28 bg-[#D6A84A]/12 text-[#F6D78E]"
                    : "border-white/8 bg-white/[0.03] text-[#A99883] hover:text-[#F6EFE4]"
                }`}
              >
                <BookOpen size={14} />
                Meine Rezepte
              </button>
              <button
                type="button"
                onClick={() => setTab("favorites")}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  tab === "favorites"
                    ? "border-[#D6A84A]/28 bg-[#D6A84A]/12 text-[#F6D78E]"
                    : "border-white/8 bg-white/[0.03] text-[#A99883] hover:text-[#F6EFE4]"
                }`}
              >
                <Bookmark size={14} />
                Favoriten
              </button>
            </div>

            {/* Recipe list */}
            <div className="overflow-y-auto flex-1 px-5 pb-8">
              {recipes.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#6B5E4E]">
                  {tab === "own" ? "Noch keine eigenen Rezepte." : "Noch keine Favoriten."}
                </p>
              ) : (
                <div className="space-y-2">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      disabled={loadingId !== null}
                      onClick={() => void handleSelect(recipe.id)}
                      className="group flex w-full items-center gap-4 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-all duration-200 hover:border-[#D6A84A]/20 hover:bg-white/[0.05] disabled:opacity-60"
                    >
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-lg">
                          🍽️
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#FFF8EE]">{recipe.title}</p>
                        {recipe.prepTime ? (
                          <p className="mt-0.5 text-xs text-[#6B5E4E]">{recipe.prepTime} Min.</p>
                        ) : null}
                      </div>
                      {loadingId === recipe.id ? (
                        <Loader2 size={15} className="shrink-0 animate-spin text-[#D6A84A]" />
                      ) : (
                        <ChefHat size={15} className="shrink-0 text-[#4A3F32] transition-colors group-hover:text-[#D6A84A]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
