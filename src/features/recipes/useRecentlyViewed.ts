const MAX_ITEMS = 10;

function storageKey(userId: string) {
  return `taste.recently-viewed.${userId}`;
}

export function trackRecentlyViewed(userId: string, recipeId: string) {
  if (!userId || typeof window === "undefined") return;
  const raw = window.localStorage.getItem(storageKey(userId));
  const existing: string[] = raw ? (JSON.parse(raw) as string[]) : [];
  const next = [recipeId, ...existing.filter((id) => id !== recipeId)].slice(0, MAX_ITEMS);
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
}

export function getRecentlyViewed(userId: string): string[] {
  if (!userId || typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey(userId));
  return raw ? (JSON.parse(raw) as string[]) : [];
}
