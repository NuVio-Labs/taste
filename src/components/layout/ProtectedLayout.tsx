import { useState, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "../feedback/FeedbackModal";
import { NavDrawer } from "./NavDrawer";
import { buildAppNavItems } from "./navItems";
import { UpgradePrompt } from "../ui/UpgradePrompt";
import { LayoutContext } from "../../contexts/LayoutContext";
import { useAuth } from "../../features/auth/useAuth";
import { useProfile } from "../../features/profile/useProfile";

export function ProtectedLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const metadataName =
    typeof session?.user.user_metadata?.full_name === "string"
      ? session.user.user_metadata.full_name
      : "";

  const { profile } = useProfile(userId);
  const plan = profile?.plan ?? "free";
  const userName = profile?.username || metadataName;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const openFeedback = useCallback(() => setIsFeedbackOpen(true), []);
  const openUpgrade = useCallback(() => setIsUpgradeOpen(true), []);

  const navItems = useMemo(
    () =>
      buildAppNavItems({
        onOpenFeedback: openFeedback,
        onOpenUpgrade: openUpgrade,
        plan,
      }),
    [openFeedback, openUpgrade, plan],
  );

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <LayoutContext.Provider value={{ openFeedback, openUpgrade }}>
      <NavDrawer
        isOpen={isDrawerOpen}
        items={navItems}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
        onToggle={() => setIsDrawerOpen((prev) => !prev)}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        plan={plan}
        profileTo="/profile"
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ minHeight: "100dvh" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentPage={`${location.pathname}${location.search}`}
        userId={userId}
        userEmail={userEmail}
        username={userName}
      />

      <UpgradePrompt
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </LayoutContext.Provider>
  );
}
