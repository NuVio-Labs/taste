import type { RecipeCategorySummary } from "../../features/recipes/types";

type CategoryOverviewProps = {
  activeCategory: string;
  categories: RecipeCategorySummary[];
  onSelectCategory: (categoryKey: string) => void;
};

export function CategoryOverview({
  activeCategory,
  categories,
  onSelectCategory,
}: CategoryOverviewProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          onClick={() => onSelectCategory(category.key)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
            activeCategory === category.key
              ? "border-[#D6A84A]/30 bg-[#D6A84A]/12 text-[#FFF8EE]"
              : "border-white/8 bg-white/[0.03] text-[#CDBBA2] hover:border-[#D6A84A]/16"
          }`}
        >
          {category.label}
          <span className="ml-2 rounded-full bg-black/15 px-2 py-0.5 text-xs text-[#D8C8B1]">
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
}
