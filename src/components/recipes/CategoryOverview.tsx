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
    <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:gap-3 md:overflow-visible md:px-0">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onSelectCategory(category.key)}
            className={`group shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
              activeCategory === category.key
                ? "border-[#D6A84A]/30 bg-[#D6A84A]/10 text-[#FFF8EE]"
                : "border-white/8 bg-white/[0.03] text-[#CDBBA2] hover:border-white/12 hover:bg-white/[0.05] hover:text-[#F3E8D8]"
            }`}
          >
            <span className="align-middle">{category.label}</span>
            <span
              className={`ml-2 inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] transition-colors duration-300 ${
                activeCategory === category.key
                  ? "bg-black/20 text-[#FFF2DC]"
                  : "bg-black/15 text-[#D8C8B1]"
              }`}
            >
              {category.count}
            </span>
          </button>
        ))}
    </div>
  );
}
