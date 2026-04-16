import { ArrowDownWideNarrow, Search } from "lucide-react";
import type {
  RecipeCategorySummary,
  RecipeSortOption,
} from "../../features/recipes/types";

type RecipeDietFilter = "all" | "vegetarian" | "vegan";

type RecipeFiltersProps = {
  activeCategory: string;
  categories: RecipeCategorySummary[];
  dietFilter: RecipeDietFilter;
  onCategoryChange: (value: string) => void;
  onDietChange: (value: RecipeDietFilter) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: RecipeSortOption) => void;
  searchValue: string;
  sortValue: RecipeSortOption;
};

export function RecipeFilters({
  activeCategory,
  categories,
  dietFilter,
  onCategoryChange,
  onDietChange,
  onSearchChange,
  onSortChange,
  searchValue,
  sortValue,
}: RecipeFiltersProps) {
  const selectClassName =
    "h-13 w-full appearance-none rounded-[22px] border border-white/10 bg-[#14110E] pl-24 pr-10 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]";
  const optionClassName = "bg-[#171411] text-[#FFF8EE]";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_240px]">
      <label className="relative block">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E806F]"
        />
        <input
          data-testid="recipe-search-input"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Titel, Beschreibung oder Kategorie suchen"
          className="h-13 w-full rounded-[22px] border border-white/10 bg-black/10 pl-11 pr-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
        />
      </label>

      <label className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E806F]">
          Kategorie
        </span>
        <select
          value={activeCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={selectClassName}
        >
          {categories.map((category) => (
            <option key={category.key} value={category.key} className={optionClassName}>
              {category.label} ({category.count})
            </option>
          ))}
        </select>
      </label>

      <label className="relative block">
        <ArrowDownWideNarrow
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E806F]"
        />
        <select
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value as RecipeSortOption)}
          className={selectClassName.replace("pl-14", "pl-11")}
        >
          <option value="latest" className={optionClassName}>
            Neueste
          </option>
          <option value="title" className={optionClassName}>
            A bis Z
          </option>
          <option value="prepTime" className={optionClassName}>
            Kürzeste Zeit
          </option>
        </select>
      </label>

      <div className="flex items-center gap-2 xl:col-span-3">
        {(
          [
            { value: "all", emoji: null, label: "Alle" },
            { value: "vegetarian", emoji: "🌿", label: "Vegetarisch" },
            { value: "vegan", emoji: "🌱", label: "Vegan" },
          ] as { value: RecipeDietFilter; emoji: string | null; label: string }[]
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onDietChange(option.value)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-300 ${
              dietFilter === option.value
                ? "border-[#D6A84A]/30 bg-[#D6A84A]/12 text-[#F6D78E]"
                : "border-white/10 bg-white/[0.02] text-[#8E806F] hover:border-white/20 hover:text-[#C8B79F]"
            }`}
          >
            {option.emoji ? (
              <span className="text-[13px] leading-none">{option.emoji}</span>
            ) : null}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
