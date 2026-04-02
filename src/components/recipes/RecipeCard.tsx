import { motion } from "framer-motion";
import { Clock3, Globe2, Heart, Lock, Users2 } from "lucide-react";
import type { RecipeListItem } from "../../features/recipes/types";
import { getRecipeCategoryTheme } from "./categoryTheme";

type RecipeCardProps = {
  onClick: () => void;
  onToggleLike: () => void;
  isLikePending?: boolean;
  recipe: RecipeListItem;
};

function fallbackLabel(recipe: RecipeListItem) {
  return recipe.title.slice(0, 1).toUpperCase();
}

export function RecipeCard({
  onClick,
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
      className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] text-left shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-[#D6A84A]/18 hover:bg-white/[0.04]"
    >
      <div className={`relative aspect-[16/10] ${categoryTheme.mediaClassName}`}>
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
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleLike();
            }}
            disabled={isLikePending}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-300 ${
              recipe.isLiked
                ? "border-[#D85B7D]/30 bg-[rgba(216,91,125,0.14)] text-[#FFD2DD]"
                : "border-white/8 bg-black/10 text-[#E2D4BE]"
            }`}
          >
            <Heart
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
