import { motion } from "framer-motion";
import { Clock3, Globe2, Lock, Users2 } from "lucide-react";
import type { RecipeListItem } from "../../features/recipes/types";

type RecipeCardProps = {
  onClick: () => void;
  recipe: RecipeListItem;
};

function fallbackLabel(recipe: RecipeListItem) {
  return recipe.title.slice(0, 1).toUpperCase();
}

export function RecipeCard({ onClick, recipe }: RecipeCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] text-left shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-[#D6A84A]/18 hover:bg-white/[0.04]"
    >
      <div className="aspect-[16/10] bg-[linear-gradient(135deg,rgba(214,168,74,0.22),rgba(32,24,18,0.35))]">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold tracking-[-0.05em] text-[#FFF4DF]">
            {fallbackLabel(recipe)}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-[#B89A67]">
              {recipe.category}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
              {recipe.title}
            </h3>
          </div>

          <div className="rounded-full border border-white/8 bg-black/10 px-3 py-1 text-xs text-[#D7C6AE]">
            {recipe.isPublic ? "Public" : "Private"}
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-[#CDBBA2]">
          {recipe.description}
        </p>

        <div className="flex flex-wrap gap-2 text-sm text-[#E2D4BE]">
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
            {recipe.isPublic ? "Oeffentlich" : "Privat"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
