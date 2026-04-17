import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, LogOut, Menu, UserCircle2, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  favoriteRecipesQueryOptions,
  recipesQueryOptions,
} from "../../features/recipes/queryOptions";
import { useSwipeGesture } from "../../hooks/useSwipeGesture";
import { NavItem } from "./NavItem";

export type NavDrawerItem = {
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
  locked?: boolean;
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
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useSwipeGesture(onToggle, { onlyWhenClosed: true, isOpen });

  const firstName = useMemo(() => {
    const sourceName = userName?.trim();
    if (sourceName) return sourceName.split(" ")[0];
    if (!userEmail) return "Chef";
    return userEmail.split("@")[0];
  }, [userEmail, userName]);

  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose bei Route-Wechsel aufrufen; onClose-Referenz ist stabil
  }, [location.pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function prefetchRouteData(path?: string) {
    if (!userId || !path) return;
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
        animate={{ x: isOpen ? 0 : -DRAWER_WIDTH }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
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
                  <span className="max-w-[220px] truncate">{firstName}</span>
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
            {items.map((item) => (
              <NavItem key={item.label} item={item} onPrefetch={prefetchRouteData} />
            ))}
          </nav>

          <div className="mt-auto rounded-[28px] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-3">
              {onLogout ? (
                <button
                  type="button"
                  onClick={() => { void onLogout(); }}
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
