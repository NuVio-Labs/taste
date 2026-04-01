import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

type CategoryCardProps = {
  count: number;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

export function CategoryCard({
  count,
  isActive,
  label,
  onClick,
}: CategoryCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`flex min-w-[170px] flex-col gap-4 rounded-[24px] border p-4 text-left transition-all duration-300 ${
        isActive
          ? "border-[#D6A84A]/30 bg-[linear-gradient(180deg,rgba(214,168,74,0.16),rgba(255,255,255,0.04))] shadow-[0_16px_32px_rgba(214,168,74,0.12)]"
          : "border-white/8 bg-white/[0.03] hover:border-[#D6A84A]/16 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
          <ChefHat size={18} />
        </div>
        <span className="rounded-full border border-white/8 bg-black/10 px-2.5 py-1 text-xs font-medium text-[#D6C4AC]">
          {count}
        </span>
      </div>

      <div>
        <p className="text-base font-semibold text-[#FFF8EE]">{label}</p>
        <p className="mt-1 text-sm text-[#A99883]">Kategorie filtern</p>
      </div>
    </motion.button>
  );
}
