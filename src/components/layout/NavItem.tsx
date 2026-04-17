import { NavLink } from "react-router-dom";
import type { NavDrawerItem } from "./NavDrawer";

type NavItemProps = {
  item: NavDrawerItem;
  onPrefetch: (path?: string) => void;
};

export function NavItem({ item, onPrefetch }: NavItemProps) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-between rounded-[22px] border border-white/6 bg-white/[0.02] px-4 py-3 text-left opacity-70"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025] text-[#A7906C]">
            <Icon size={17} />
          </div>
          <span className="text-[0.98rem] font-medium text-[#C8B79F]">
            {item.label}
          </span>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#8D7E6E]">
          Soon
        </span>
      </button>
    );
  }

  if (item.locked) {
    return (
      <button
        type="button"
        onClick={() => item.onSelect?.()}
        className="group flex w-full items-center justify-between rounded-[22px] border border-white/6 bg-white/[0.02] px-4 py-3 text-left transition-all duration-300 hover:border-[#D6A84A]/12 hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025] text-[#A7906C] transition-all duration-300 group-hover:border-[#D6A84A]/14 group-hover:text-[#E9D8B4]">
            <Icon size={17} />
          </div>
          <span className="text-[0.98rem] font-medium text-[#C8B79F] transition-colors duration-300 group-hover:text-[#D1C0A8]">
            {item.label}
          </span>
        </div>
        <span className="rounded-full border border-[#D6A84A]/18 bg-[#D6A84A]/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#F6D78E]">
          Pro
        </span>
      </button>
    );
  }

  if (!item.to) {
    return (
      <button
        type="button"
        onClick={() => item.onSelect?.()}
        className="group flex w-full items-center gap-3 rounded-[22px] border border-white/6 bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-[#D6A84A]/12 hover:bg-white/[0.03]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025] text-[#E9D8B4] transition-all duration-300 group-hover:border-[#D6A84A]/14">
          <Icon size={17} />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[0.98rem] font-medium text-[#D1C0A8] transition-colors duration-300">
            {item.label}
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-white/10 transition-all duration-300" />
      </button>
    );
  }

  return (
    <NavLink
      to={item.to}
      onClick={item.onSelect}
      onMouseEnter={() => onPrefetch(item.to)}
      onFocus={() => onPrefetch(item.to)}
      onTouchStart={() => onPrefetch(item.to)}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-[22px] border px-4 py-3 transition-all duration-300 ${
          isActive
            ? "border-[#D6A84A]/18 bg-[linear-gradient(180deg,rgba(214,168,74,0.12),rgba(255,255,255,0.03))] shadow-[0_10px_24px_rgba(214,168,74,0.08),inset_0_1px_0_rgba(255,255,255,0.03)]"
            : "border-white/6 bg-white/[0.02] hover:border-[#D6A84A]/12 hover:bg-white/[0.03]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-[#E9D8B4] transition-all duration-300 ${
              isActive
                ? "border-[#E9D8B4]/14 bg-[#D6A84A]/10"
                : "border-white/8 bg-white/[0.025] group-hover:border-[#D6A84A]/14"
            }`}
          >
            <Icon size={17} />
          </div>

          <div className="flex-1">
            <div
              className={`text-[0.98rem] font-medium transition-colors duration-300 ${
                isActive ? "text-[#FFF8EE]" : "text-[#D1C0A8]"
              }`}
            >
              {item.label}
            </div>
          </div>

          <div
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-[#D6A84A] shadow-[0_0_12px_rgba(214,168,74,0.8)]"
                : "bg-white/10"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}
