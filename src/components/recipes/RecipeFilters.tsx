import { ArrowDownWideNarrow, Search } from "lucide-react";
import type { RecipeSortOption } from "../../features/recipes/types";

type RecipeFiltersProps = {
  onSearchChange: (value: string) => void;
  onSortChange: (value: RecipeSortOption) => void;
  searchValue: string;
  sortValue: RecipeSortOption;
};

export function RecipeFilters({
  onSearchChange,
  onSortChange,
  searchValue,
  sortValue,
}: RecipeFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
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
        <ArrowDownWideNarrow
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E806F]"
        />
        <select
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value as RecipeSortOption)}
          className="h-13 w-full appearance-none rounded-[22px] border border-white/10 bg-black/10 pl-11 pr-4 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]"
        >
          <option value="latest" className="bg-[#171411]">
            Neueste
          </option>
          <option value="title" className="bg-[#171411]">
            A bis Z
          </option>
          <option value="prepTime" className="bg-[#171411]">
            Kürzeste Zeit
          </option>
        </select>
      </label>
    </div>
  );
}
