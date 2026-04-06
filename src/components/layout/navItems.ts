import {
  Bookmark,
  BookOpen,
  LayoutGrid,
  MessageSquareText,
  Tag,
} from "lucide-react";
import { canAccess, type Plan } from "../../features/plan/entitlements";
import type { NavDrawerItem } from "./NavDrawer";

type BuildAppNavItemsOptions = {
  onOpenFeedback: () => void;
  onOpenUpgrade: () => void;
  plan: Plan;
};

export function buildAppNavItems({
  onOpenFeedback,
  onOpenUpgrade,
  plan,
}: BuildAppNavItemsOptions): NavDrawerItem[] {
  const hasFavoritesAccess = canAccess(plan, "favorites");
  const hasShoppingListAccess = canAccess(plan, "shopping_list");

  return [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      to: "/dashboard",
    },
    {
      label: "Rezepte",
      icon: BookOpen,
      to: "/recipes",
    },
    {
      label: "Favoriten",
      icon: Bookmark,
      ...(hasFavoritesAccess
        ? { to: "/favorites" }
        : { locked: true as const, onSelect: onOpenUpgrade }),
    },
    {
      label: "Einkaufsliste",
      icon: Tag,
      ...(hasShoppingListAccess
        ? { to: "/shopping-list" }
        : { locked: true as const, onSelect: onOpenUpgrade }),
    },
    {
      label: "Feedback",
      icon: MessageSquareText,
      onSelect: onOpenFeedback,
    },
  ];
}
