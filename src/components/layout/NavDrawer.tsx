import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  favoriteRecipesQueryOptions,
  recipesQueryOptions,
} from "../../features/recipes/queryOptions";

export type NavDrawerItem = {
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
  onSelect?: () => void;
  to?: string;
};

type NavDrawerProps = {
  _onCreateRecipe?: () => void;
  isOpen: boolean;
  items: NavDrawerItem[];
  onClose: () => void;
  onLogout?: () => void;
  plan?: "free" | "pro";
  profileTo?: string;
  onToggle: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
};

const DRAWER_WIDTH = 292;

export function NavDrawer({
  _onCreateRecipe,
  isOpen,
  items,
  onClose,
  onLogout,
  plan = "free",
  profileTo = "/profile",
  onToggle,
  userId,
  userEmail,
  userName,
}: NavDrawerProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const firstName = useMemo(() => {
    const sourceName = userName?.trim();

    if (sourceName) {
      return sourceName.split(" ")[0];
    }

    if (!userEmail) {
      return "Chef";
    }

    return userEmail.split("@")[0];
  }, [userEmail, userName]);

  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose bei Route-Wechsel aufrufen; onClose-Referenz ist stabil
  }, [location.pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function prefetchRouteData(path?: string) {
    if (!userId || !path) {
      return;
    }

    if (path === "/recipes") {
      void queryClient.prefetchQuery(recipesQueryOptions(userId));
      return;
    }

    if (path === "/favorites") {
      void queryClient.prefetchQuery(favoriteRecipesQueryOptions(userId));
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            type="button"
            aria-label="Navigation schließen"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
          />
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Navigation schließen" : "Navigation öffnen"}
        initial={false}
        animate={{ x: isOpen ? DRAWER_WIDTH - 20 : 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-1/2 z-[60] flex h-14 w-[25px] -translate-y-1/2 items-center justify-center rounded-r-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(29,23,19,0.98),rgba(18,15,12,0.98))] text-[#D6A84A] shadow-[0_12px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-300 hover:text-[#E9D8B4]"
      >
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </motion.button>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -DRAWER_WIDTH,
        }}
        transition={{
          duration: 0.42,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ width: DRAWER_WIDTH }}
        className="fixed left-0 top-0 z-50 h-dvh border-r border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,74,0.12),transparent_34%)]" />

        <div className="relative flex h-full flex-col px-4 pb-5 pt-5">
          <div className="mb-6 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(26,20,16,0.96),rgba(20,16,13,0.94))] px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <ChefHat size={20} />
                </div>

                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                    Nuvio Taste
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3">
                <NavLink
                  to={profileTo}
                  onMouseEnter={() => prefetchRouteData(profileTo)}
                  onFocus={() => prefetchRouteData(profileTo)}
                  onTouchStart={() => prefetchRouteData(profileTo)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-[#C7B79F] transition-colors duration-300 hover:border-[#D6A84A]/18 hover:text-[#F6EFE4]"
                >
                  <UserCircle2 size={16} className="text-[#D6A84A]" />
                  <span className="max-w-[220px] truncate">
                    {firstName}
                  </span>
                  {plan === "pro" ? (
                    <span className="rounded-full border border-[#D6A84A]/20 bg-[#D6A84A]/12 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#F6D78E]">
                      Pro
                    </span>
                  ) : null}
                </NavLink>


              </div>
            </div>
          </div>

          <div className="mb-3 px-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#8D7E6E]">
            Übersicht
          </div>

          <nav className="space-y-3">
            {items.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <button
                    key={item.label}
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

              if (!item.to) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.onSelect?.();
                    }}
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
                  key={item.label}
                  to={item.to ?? "/dashboard"}
                  onClick={item.onSelect}
                  onMouseEnter={() => prefetchRouteData(item.to)}
                  onFocus={() => prefetchRouteData(item.to)}
                  onTouchStart={() => prefetchRouteData(item.to)}
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
            })}
          </nav>

          <div className="mt-auto rounded-[28px] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-3">
              {onLogout ? (
                <button
                  type="button"
                  onClick={() => {
                    void onLogout();
                  }}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/20 hover:bg-white/[0.045]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
