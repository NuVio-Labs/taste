import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Compass, Shuffle, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { recipesQueryOptions } from "../features/recipes/queryOptions";
import type { RecipeListItem } from "../features/recipes/types";

type EffortFilter = "schnell" | "mittel" | "aufwendig" | null;
type TimeFilter = "morgen" | "mittag" | "abend" | null;
type DietFilter = "vegetarian" | "vegan" | null;

const MORNING_CATEGORIES = ["frühstück"];
const LUNCH_CATEGORIES = ["mittagessen", "eintopf", "mealprep"];
const EVENING_CATEGORIES = ["abendessen"];

function matchesTimeFilter(recipe: RecipeListItem, filter: TimeFilter): boolean {
  if (!filter) return true;
  const cat = recipe.category?.toLowerCase() ?? "";
  if (filter === "morgen") return MORNING_CATEGORIES.some((c) => cat.includes(c));
  if (filter === "mittag") return LUNCH_CATEGORIES.some((c) => cat.includes(c));
  if (filter === "abend") return EVENING_CATEGORIES.some((c) => cat.includes(c));
  return false;
}

function matchesDietFilter(recipe: RecipeListItem, filter: DietFilter): boolean {
  if (!filter) return true;
  if (filter === "vegan") return recipe.isVegan;
  if (filter === "vegetarian") return recipe.isVegetarian || recipe.isVegan;
  return true;
}

function matchesEffortFilter(recipe: RecipeListItem, filter: EffortFilter): boolean {
  if (!filter) return true;
  const t = recipe.prepTime;
  if (filter === "schnell") return t !== null && t <= 20;
  if (filter === "mittel") return t !== null && t > 20 && t <= 45;
  if (filter === "aufwendig") return t !== null && t > 45;
  return true;
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function RecipeSuggestionCard({ recipe }: { recipe: RecipeListItem }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/recipes/${recipe.id}`, { state: { fromPath: "/inspiration" } })}
      className="group flex w-full items-start gap-4 rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-4 text-left transition-all duration-300 hover:border-[#D6A84A]/18 hover:bg-white/[0.03]"
    >
      {recipe.imageUrl ? (
        <img
          src={`${recipe.imageUrl}?width=80&quality=70&format=origin`}
          alt={recipe.title}
          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[#8D7E6E]">
          <Compass size={18} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#F6EFE4] transition-colors group-hover:text-white">
          {recipe.title}
        </p>
        {recipe.prepTime ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-[#8D7E6E]">
            <Clock size={11} />
            {recipe.prepTime} Min
          </p>
        ) : null}
        {recipe.category ? (
          <p className="mt-0.5 text-xs text-[#6B5F52]">{recipe.category}</p>
        ) : null}
      </div>
    </button>
  );
}

export function InspirationPage() {
  const { session } = useAuth();
  const userId = session?.user.id ?? "";
  const navigate = useNavigate();

  const { data: recipes = [] } = useQuery(recipesQueryOptions(userId));

  const [timeFilter, setTimeFilter] = useState<TimeFilter>(null);
  const [effortFilter, setEffortFilter] = useState<EffortFilter>(null);
  const [dietFilter, setDietFilter] = useState<DietFilter>(null);
  const [randomRecipe, setRandomRecipe] = useState<RecipeListItem | null>(null);
  const [randomKey, setRandomKey] = useState(0);

  function handleSurprise() {
    const pick = pickRandom(recipes);
    setRandomRecipe(pick);
    setRandomKey((k) => k + 1);
  }

  const filtered = recipes.filter(
    (r) =>
      matchesTimeFilter(r, timeFilter) &&
      matchesEffortFilter(r, effortFilter) &&
      matchesDietFilter(r, dietFilter),
  );

  const showFiltered = timeFilter !== null || effortFilter !== null || dietFilter !== null;

  const timeButtons: { label: string; value: TimeFilter }[] = [
    { label: "Morgen", value: "morgen" },
    { label: "Mittag", value: "mittag" },
    { label: "Abend", value: "abend" },
  ];

  const effortButtons: { label: string; value: EffortFilter }[] = [
    { label: "Schnell", value: "schnell" },
    { label: "Mittel", value: "mittel" },
    { label: "Aufwendig", value: "aufwendig" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 pl-7 sm:px-6 sm:py-7 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
                Ideenraum
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl">
                <Compass className="text-[#D6A84A]" size={28} />
                Inspiration
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7AA96] sm:text-base">
                Was kochst du heute? Lass dich überraschen oder wähle nach Tageszeit und Aufwand.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Überrasch mich */}
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">Zufallsrezept</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                Überrasch mich
              </h2>
              <p className="mt-1 text-sm text-[#8D7E6E]">
                Ein zufälliges Rezept aus deiner Sammlung.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSurprise}
              disabled={recipes.length === 0}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[#D6A84A]/10 px-6 text-sm font-medium text-[#F6D78E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D6A84A]/16 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-shrink-0"
            >
              <Shuffle size={15} />
              Rezept würfeln
            </button>
          </div>

          {randomRecipe ? (
            <motion.div
              key={randomKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <RecipeSuggestionCard recipe={randomRecipe} />
            </motion.div>
          ) : null}
        </motion.section>

        {/* Filter: Tageszeit */}
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 sm:p-6"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">Vorschläge nach</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
            Tageszeit &amp; Aufwand
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "🌿 Vegetarisch", value: "vegetarian" as DietFilter },
              { label: "🌱 Vegan", value: "vegan" as DietFilter },
            ].map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setDietFilter(dietFilter === btn.value ? null : btn.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  dietFilter === btn.value
                    ? "border-[#6FA86A]/40 bg-[rgba(111,168,106,0.16)] text-[#A8D4A4]"
                    : "border-white/8 bg-white/[0.02] text-[#C8B79F] hover:border-white/14 hover:text-[#F6EFE4]"
                }`}
              >
                {btn.label}
              </button>
            ))}

            <div className="h-8 w-px self-center bg-white/8" />

            {timeButtons.map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setTimeFilter(timeFilter === btn.value ? null : btn.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  timeFilter === btn.value
                    ? "border-[#D6A84A]/30 bg-[#D6A84A]/14 text-[#F6D78E]"
                    : "border-white/8 bg-white/[0.02] text-[#C8B79F] hover:border-white/14 hover:text-[#F6EFE4]"
                }`}
              >
                {btn.label}
              </button>
            ))}

            <div className="h-8 w-px self-center bg-white/8" />

            {effortButtons.map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setEffortFilter(effortFilter === btn.value ? null : btn.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  effortFilter === btn.value
                    ? "border-[#D6A84A]/30 bg-[#D6A84A]/14 text-[#F6D78E]"
                    : "border-white/8 bg-white/[0.02] text-[#C8B79F] hover:border-white/14 hover:text-[#F6EFE4]"
                }`}
              >
                {btn.value === "schnell" ? <Zap size={12} /> : <Clock size={12} />}
                {btn.label}
                {btn.value === "schnell" ? (
                  <span className="text-[0.7rem] text-[#6B5F52]">≤20 Min</span>
                ) : btn.value === "mittel" ? (
                  <span className="text-[0.7rem] text-[#6B5F52]">≤45 Min</span>
                ) : null}
              </button>
            ))}
          </div>

          {showFiltered ? (
            <div className="mt-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-[22px] border border-white/6 bg-white/[0.015] px-6 py-8 text-center">
                  <p className="text-sm font-medium text-[#C8B79F]">Keine Rezepte gefunden.</p>
                  <p className="text-sm text-[#6B5F52]">Für diese Filterkombination gibt es noch keine passenden Rezepte in deiner Sammlung.</p>
                  <button
                    type="button"
                    onClick={() => { setTimeFilter(null); setEffortFilter(null); setDietFilter(null); }}
                    className="mt-1 inline-flex h-8 items-center rounded-full border border-white/10 px-4 text-xs text-[#C8B79F] transition-colors hover:border-[#D6A84A]/20 hover:text-[#F6EFE4]"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filtered.slice(0, 6).map((recipe) => (
                    <RecipeSuggestionCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
              {filtered.length > 6 ? (
                <button
                  type="button"
                  onClick={() => navigate("/recipes")}
                  className="mt-4 text-sm text-[#D6A84A] transition-colors hover:text-[#F6D78E]"
                >
                  Alle {filtered.length} Ergebnisse in Rezepten sehen →
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6B5F52]">
              Filter wählen um passende Rezepte aus deiner Sammlung zu sehen.
            </p>
          )}
        </motion.section>
      </div>
    </main>
  );
}
