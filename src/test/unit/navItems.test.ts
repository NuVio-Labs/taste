import { describe, expect, it, vi } from "vitest";
import { buildAppNavItems } from "../../components/layout/navItems";

describe("buildAppNavItems", () => {
  it("markiert Favoriten und Einkaufsliste für Free als locked", () => {
    const onOpenFeedback = vi.fn();
    const onOpenUpgrade = vi.fn();

    const items = buildAppNavItems({
      plan: "free",
      onOpenFeedback,
      onOpenUpgrade,
      onOpenCookingMode: vi.fn(),
    });

    expect(items.find((item) => item.label === "Favoriten")).toMatchObject({
      locked: true,
      onSelect: onOpenUpgrade,
    });
    expect(items.find((item) => item.label === "Einkaufsliste")).toMatchObject({
      locked: true,
      onSelect: onOpenUpgrade,
    });
  });

  it("gibt Favoriten und Einkaufsliste für Pro als direkte Links aus", () => {
    const items = buildAppNavItems({
      plan: "pro",
      onOpenFeedback: vi.fn(),
      onOpenUpgrade: vi.fn(),
      onOpenCookingMode: vi.fn(),
    });

    expect(items.find((item) => item.label === "Favoriten")).toMatchObject({
      to: "/favorites",
    });
    expect(items.find((item) => item.label === "Einkaufsliste")).toMatchObject({
      to: "/shopping-list",
    });
  });
});
