import {
  ArrowLeft,
  Bookmark,
  Clock3,
  Globe2,
  Lock,
  Pencil,
  ShoppingCart,
  ThumbsUp,
  Trash2,
  Users2,
} from "lucide-react";
import {
  formatRecipeIngredientAmount,
  type RecipeDetailData,
} from "../../features/recipes/types";
import { getRecipeCategoryTheme } from "./categoryTheme";

type RecipeDetailProps = {
  isAddToShoppingListPending?: boolean;
  canManageRecipe?: boolean;
  isDeleting?: boolean;
  isFavoritePending?: boolean;
  isLikePending?: boolean;
  onAddToShoppingList: () => void;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
  recipe: RecipeDetailData;
};

export function RecipeDetail({
  isAddToShoppingListPending = false,
  canManageRecipe = true,
  isDeleting = false,
  isFavoritePending = false,
  isLikePending = false,
  onAddToShoppingList,
  onBack,
  onDelete,
  onEdit,
  onToggleFavorite,
  onToggleLike,
  recipe,
}: RecipeDetailProps) {
  const categoryTheme = getRecipeCategoryTheme(recipe.category);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
      >
        <ArrowLeft size={16} />
        Zurück
      </button>

      <section className="overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.03] shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
        <div className={`relative aspect-[16/8] ${categoryTheme.mediaClassName}`}>
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
            <div className="flex h-full items-center justify-center px-6 text-center text-4xl font-semibold tracking-[-0.05em] text-[#FFF4DF]">
              {recipe.title}
            </div>
          )}
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p
                className={`text-xs uppercase tracking-[0.24em] ${categoryTheme.categoryTextClassName}`}
              >
                {recipe.category}
              </p>
              <h1
                data-testid="recipe-detail-title"
                className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl"
              >
                {recipe.title}
              </h1>
              <p className="mt-3 text-sm text-[#B7AA96]">
                Von {recipe.authorName}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#D5C5AF] sm:text-base">
                {recipe.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onToggleFavorite}
                data-testid="recipe-detail-favorite-button"
                aria-pressed={recipe.isFavorite}
                disabled={isFavoritePending}
                className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300 ${
                  recipe.isFavorite
                    ? "border-[#E7C26E]/30 bg-[rgba(231,194,110,0.14)] text-[#FCE7B0]"
                    : "border-white/10 bg-white/[0.03] text-[#F6EFE4] hover:border-[#E7C26E]/18"
                }`}
              >
                <Bookmark
                  size={16}
                  className={recipe.isFavorite ? "fill-current" : undefined}
                />
                {recipe.isFavorite ? "Favorit" : "Speichern"}
              </button>
              <button
                type="button"
                onClick={onToggleLike}
                data-testid="recipe-detail-like-button"
                aria-pressed={recipe.isLiked}
                disabled={isLikePending}
                className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300 ${
                  recipe.isLiked
                    ? "border-[#6FA6FF]/30 bg-[rgba(111,166,255,0.14)] text-[#D9E8FF]"
                    : "border-white/10 bg-white/[0.03] text-[#F6EFE4] hover:border-[#6FA6FF]/18"
                }`}
              >
                <ThumbsUp
                  size={16}
                  className={recipe.isLiked ? "fill-current" : undefined}
                />
                {recipe.likeCount}
              </button>
              <button
                type="button"
                onClick={onAddToShoppingList}
                data-testid="recipe-detail-add-to-shopping-list-button"
                disabled={isAddToShoppingListPending}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <ShoppingCart size={16} />
                {isAddToShoppingListPending
                  ? "Wird hinzugefügt..."
                  : "Zur Einkaufsliste hinzufügen"}
              </button>
              {canManageRecipe ? (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    data-testid="recipe-edit-button"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
                  >
                    <Pencil size={16} />
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(255,120,120,0.22)] bg-[rgba(255,120,120,0.08)] px-4 text-sm font-medium text-red-100 transition-colors duration-300 hover:bg-[rgba(255,120,120,0.12)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? "Löscht..." : "Löschen"}
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#E2D4BE]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/10 px-3 py-2">
              <Clock3 size={15} />
              {recipe.prepTime ? `${recipe.prepTime} Minuten` : "Zeit offen"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/10 px-3 py-2">
              <Users2 size={15} />
              {recipe.servings ? `${recipe.servings} Portionen` : "Portionen offen"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/10 px-3 py-2">
              {recipe.isPublic ? <Globe2 size={15} /> : <Lock size={15} />}
              {recipe.isPublic ? "Öffentlich" : "Privat"}
            </span>
            {recipe.isVegetarian ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#6FA86A]/28 bg-[rgba(111,168,106,0.1)] px-3 py-2 text-[#A8D4A4]">
                🌿 Vegetarisch
              </span>
            ) : null}
            {recipe.isVegan ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#5BAF7A]/28 bg-[rgba(91,175,122,0.1)] px-3 py-2 text-[#94D4AE]">
                🌱 Vegan
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
            Zutaten
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
            Alles auf einen Blick
          </h2>

          <div className="mt-5 space-y-3">
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-black/10 px-4 py-3"
                >
                  <span className="text-sm font-medium text-[#FFF8EE]">
                    {ingredient.name}
                  </span>
                  <span className="text-sm text-[#D5C5AF]">
                    {[formatRecipeIngredientAmount(ingredient), ingredient.unit]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#B7AA96]">Keine Zutaten hinterlegt.</p>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
            Zubereitung
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
            Schritte
          </h2>

          <div className="mt-5 space-y-4">
            {recipe.steps.length > 0 ? (
              recipe.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex gap-4 rounded-[24px] border border-white/8 bg-black/10 px-4 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E9D8B4]/10 bg-white/[0.03] text-sm font-semibold text-[#E9D8B4]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-[#D5C5AF]">{step.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#B7AA96]">Keine Schritte hinterlegt.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
