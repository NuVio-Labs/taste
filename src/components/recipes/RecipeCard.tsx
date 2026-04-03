import { motion } from "framer-motion";
import {
  Bookmark,
  Clock3,
  Globe2,
  Lock,
  Plus,
  ShoppingCart,
  ThumbsUp,
  Users2,
} from "lucide-react";
import type { RecipeListItem } from "../../features/recipes/types";
import { getRecipeCategoryTheme } from "./categoryTheme";

type RecipeCardProps = {
  isAddToShoppingListPending?: boolean;
  isFavoritePending?: boolean;
  onClick: () => void;
  onAddToShoppingList?: () => void;
  onPrefetch?: () => void;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
  isLikePending?: boolean;
  recipe: RecipeListItem;
};

function fallbackLabel(recipe: RecipeListItem) {
  return recipe.title.slice(0, 1).toUpperCase();
}

export function RecipeCard({
  isAddToShoppingListPending = false,
  isFavoritePending = false,
  onClick,
  onAddToShoppingList,
  onPrefetch,
  onToggleFavorite,
  onToggleLike,
  isLikePending = false,
  recipe,
}: RecipeCardProps) {
  const categoryTheme = getRecipeCategoryTheme(recipe.category);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      onTouchStart={onPrefetch}
      className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] text-left shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-[#D6A84A]/18 hover:bg-white/[0.04]"
    >
      <div className={`relative aspect-[16/10] ${categoryTheme.mediaClassName}`}>
        {onAddToShoppingList ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddToShoppingList();
            }}
            disabled={isAddToShoppingListPending}
            className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D6A84A]/24 bg-[rgba(15,14,12,0.62)] text-[#FFF1D4] backdrop-blur-md transition-colors duration-300 hover:border-[#D6A84A]/36 hover:bg-[rgba(214,168,74,0.18)] disabled:opacity-60"
          >
            <Plus size={16} />
          </button>
        ) : null}
        {recipe.imageUrl ? (
          <>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
            <div className={`absolute inset-0 ${categoryTheme.overlayClassName}`} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold tracking-[-0.05em] text-[#FFF4DF]">
            {fallbackLabel(recipe)}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs uppercase tracking-[0.24em] ${categoryTheme.categoryTextClassName}`}>
              {recipe.category}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
              {recipe.title}
            </h3>
          </div>

          <div className="rounded-full border border-white/8 bg-black/10 px-3 py-1 text-xs text-[#D7C6AE]">
            {recipe.isPublic ? "Öffentlich" : "Privat"}
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-[#CDBBA2]">
          {recipe.description}
        </p>

        <p className="text-sm text-[#B7AA96]">
          Von {recipe.authorName}
        </p>

        <div className="flex flex-wrap gap-2 text-sm text-[#E2D4BE]">
          {onAddToShoppingList ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddToShoppingList();
              }}
              disabled={isAddToShoppingListPending}
              className="inline-flex items-center gap-2 rounded-full border border-[#D6A84A]/24 bg-[rgba(214,168,74,0.1)] px-3 py-1.5 text-[#FFF1D4] transition-colors duration-300 hover:border-[#D6A84A]/36 hover:bg-[rgba(214,168,74,0.14)] disabled:opacity-60"
            >
              <ShoppingCart size={14} />
              Zur Liste
            </button>
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            disabled={isFavoritePending}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-300 ${
              recipe.isFavorite
                ? "border-[#E7C26E]/30 bg-[rgba(231,194,110,0.14)] text-[#FCE7B0]"
                : "border-white/8 bg-black/10 text-[#E2D4BE]"
            }`}
          >
            <Bookmark
              size={14}
              className={recipe.isFavorite ? "fill-current" : undefined}
            />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleLike();
            }}
            disabled={isLikePending}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-300 ${
              recipe.isLiked
                ? "border-[#6FA6FF]/30 bg-[rgba(111,166,255,0.14)] text-[#D9E8FF]"
                : "border-white/8 bg-black/10 text-[#E2D4BE]"
            }`}
          >
            <ThumbsUp
              size={14}
              className={recipe.isLiked ? "fill-current" : undefined}
            />
            {recipe.likeCount}
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/10 px-3 py-1.5">
            <Clock3 size={14} />
            {recipe.prepTime ? `${recipe.prepTime} Min` : "Zeit offen"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/10 px-3 py-1.5">
            <Users2 size={14} />
            {recipe.servings ? `${recipe.servings} Portionen` : "Portionen offen"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/10 px-3 py-1.5">
            {recipe.isPublic ? <Globe2 size={14} /> : <Lock size={14} />}
            {recipe.isPublic ? "Öffentlich" : "Privat"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
