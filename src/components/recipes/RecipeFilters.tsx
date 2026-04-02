import { ArrowDownWideNarrow, Search } from "lucide-react";
import type {
  RecipeCategorySummary,
  RecipeSortOption,
} from "../../features/recipes/types";

type RecipeFiltersProps = {
  activeCategory: string;
  categories: RecipeCategorySummary[];
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: RecipeSortOption) => void;
  searchValue: string;
  sortValue: RecipeSortOption;
};

export function RecipeFilters({
  activeCategory,
  categories,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  searchValue,
  sortValue,
}: RecipeFiltersProps) {
  const selectClassName =
    "h-13 w-full appearance-none rounded-[22px] border border-white/10 bg-[#14110E] pl-14 pr-10 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]";
  const optionClassName = "bg-[#171411] text-[#FFF8EE]";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_240px]">
      <label className="relative block">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E806F]"
        />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Titel, Beschreibung oder Kategorie suchen"
          className="h-13 w-full rounded-[22px] border border-white/10 bg-black/10 pl-11 pr-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
        />
      </label>

      <label className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E806F]">
          Kat
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
    </div>
  );
}
