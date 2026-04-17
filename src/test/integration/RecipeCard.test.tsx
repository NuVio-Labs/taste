import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { RecipeListItem } from "../../features/recipes/types";
import type { RecipeCard as RecipeCardType } from "../../components/recipes/RecipeCard";

// Framer Motion: Alle motion-Elemente rendern als einfache div/button-Elemente
vi.mock("framer-motion", async () => {
  const React = await import("react");

  const createMotionComponent = (tag: string) =>
    React.forwardRef(({ children, whileHover: _wh, transition: _tr, ...props }: any, ref: any) =>
      React.createElement(tag, { ...props, ref }, children),
    );

  const motion = new Proxy(
    {},
    {
      get: (_target, prop: string) => createMotionComponent(prop),
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
  };
});

// RecipeCard nach dem Mock importieren
let RecipeCard: typeof RecipeCardType;

beforeAll(async () => {
  const module = await import("../../components/recipes/RecipeCard");
  RecipeCard = module.RecipeCard;
});

const baseRecipe: RecipeListItem = {
  id: "recipe-1",
  title: "Pasta Arrabiata",
  description: "Scharfe Tomatensauce mit Pasta.",
  category: "Pasta",
  authorName: "Test Koch",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  imageUrl: null,
  isFavorite: false,
  isPublic: true,
  isLiked: false,
  isVegetarian: false,
  isVegan: false,
  ingredientNames: "",
  likeCount: 3,
  prepTime: 20,
  servings: 2,
  userId: "user-1",
};

function renderCard(overrides: Partial<RecipeListItem> = {}) {
  const recipe = { ...baseRecipe, ...overrides };
  const onClick = vi.fn();
  const onToggleFavorite = vi.fn();
  const onToggleLike = vi.fn();

  render(
    <RecipeCard
      recipe={recipe}
      onClick={onClick}
      onToggleFavorite={onToggleFavorite}
      onToggleLike={onToggleLike}
    />,
  );

  return { onClick, onToggleFavorite, onToggleLike };
}

describe("RecipeCard", () => {
  it("zeigt den Rezepttitel an", () => {
    renderCard();
    expect(screen.getByText("Pasta Arrabiata")).toBeDefined();
  });

  it("zeigt die Beschreibung an", () => {
    renderCard();
    expect(screen.getByText("Scharfe Tomatensauce mit Pasta.")).toBeDefined();
  });

  it("zeigt den Autorennamen an", () => {
    renderCard();
    expect(screen.getByText(/Test Koch/)).toBeDefined();
  });

  it("zeigt die Likeanzahl an", () => {
    renderCard({ likeCount: 7 });
    expect(screen.getByText("7")).toBeDefined();
  });

  it("zeigt Vorbereitungszeit an", () => {
    renderCard({ prepTime: 20 });
    expect(screen.getByText(/20 Min/)).toBeDefined();
  });

  it("zeigt 'Zeit offen' wenn keine prepTime", () => {
    renderCard({ prepTime: null });
    expect(screen.getByText(/Zeit offen/)).toBeDefined();
  });

  it("zeigt Portionen an", () => {
    renderCard({ servings: 4 });
    expect(screen.getByText(/4 Port\./)).toBeDefined();
  });

  it("zeigt Fallback-Buchstabe wenn kein Bild", () => {
    renderCard({ imageUrl: null, title: "Kartoffelsuppe" });
    expect(screen.getByText("K")).toBeDefined();
  });

  it("zeigt Kategorie an", () => {
    renderCard({ category: "Suppen" });
    expect(screen.getByText("Suppen")).toBeDefined();
  });

  it("zeigt 'Zur Liste'-Button wenn onAddToShoppingList übergeben wird", async () => {
    const React = await import("react");
    const { RecipeCard: RC } = await import("../../components/recipes/RecipeCard");
    const onAddToShoppingList = vi.fn();
    render(
      React.createElement(RC, {
        recipe: baseRecipe,
        onClick: vi.fn(),
        onToggleFavorite: vi.fn(),
        onToggleLike: vi.fn(),
        onAddToShoppingList,
      }),
    );
    expect(screen.getByText(/Zur Liste/)).toBeDefined();
  });

  it("zeigt 'Öffentlich' für öffentliche Rezepte", () => {
    renderCard({ isPublic: true });
    // Mindestens eines der Elemente mit "Öffentlich" vorhanden
    const elements = screen.getAllByText(/Öffentlich/);
    expect(elements.length).toBeGreaterThan(0);
  });
});
