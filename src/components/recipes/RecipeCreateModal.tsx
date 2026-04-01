import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChefHat,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  createRecipe,
  updateRecipe,
} from "../../features/recipes/recipeService";
import type { RecipeDetailData } from "../../features/recipes/types";
import { supabase } from "../../lib/supabase";

const ingredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Bitte Namen eingeben"),
  amount: z.string().min(1, "Bitte Menge eingeben"),
  unit: z.string().min(1, "Bitte Einheit eingeben"),
});

const stepSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "Bitte Schritt eingeben"),
});

const recipeSchema = z.object({
  title: z.string().min(2, "Titel zu kurz"),
  description: z.string().min(10, "Beschreibung zu kurz"),
  image_url: z
    .union([z.string().url("Bitte gültige URL eingeben"), z.literal("")])
    .optional(),
  category: z.string().min(2, "Kategorie angeben"),
  prep_time: z.number().int().min(1, "Mindestens 1 Minute"),
  servings: z.number().int().min(1, "Mindestens 1 Portion"),
  visibility: z.enum(["private", "public"]),
  ingredients: z.array(ingredientSchema).min(1, "Mindestens 1 Zutat"),
  steps: z.array(stepSchema).min(1, "Mindestens 1 Schritt"),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

type RecipeCreateModalProps = {
  onClose: () => void;
  onCreated?: () => void;
  recipe?: RecipeDetailData | null;
  open: boolean;
};

function createDefaultValues(): RecipeFormValues {
  return {
    title: "",
    description: "",
    image_url: "",
    category: "",
    prep_time: 20,
    servings: 2,
    visibility: "private",
    ingredients: [
      {
        id: crypto.randomUUID(),
        name: "",
        amount: "",
        unit: "",
      },
    ],
    steps: [
      {
        id: crypto.randomUUID(),
        text: "",
      },
    ],
  };
}

function createValuesFromRecipe(recipe: RecipeDetailData): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description,
    image_url: recipe.imageUrl ?? "",
    category: recipe.category,
    prep_time: recipe.prepTime ?? 20,
    servings: recipe.servings ?? 2,
    visibility: recipe.isPublic ? "public" : "private",
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
          }))
        : [
            {
              id: crypto.randomUUID(),
              name: "",
              amount: "",
              unit: "",
            },
          ],
    steps:
      recipe.steps.length > 0
        ? recipe.steps.map((step) => ({
            id: step.id,
            text: step.text,
          }))
        : [
            {
              id: crypto.randomUUID(),
              text: "",
            },
          ],
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-300">{message}</p>;
}

function SectionTitle({
  subtitle,
  title,
}: {
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#FFF8EE]">
        {title}
      </h3>
      {subtitle ? <p className="mt-1 text-sm text-[#B7AA96]">{subtitle}</p> : null}
    </div>
  );
}

export function RecipeCreateModal({
  onClose,
  onCreated,
  recipe,
  open,
}: RecipeCreateModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditMode = Boolean(recipe);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: createDefaultValues(),
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(recipe ? createValuesFromRecipe(recipe) : createDefaultValues());
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, recipe, reset]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const onSubmit = handleSubmit(async (values: RecipeFormValues) => {
    setSubmitError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSubmitError("Kein eingeloggter Nutzer gefunden.");
      return;
    }

    try {
      const payload = {
        title: values.title,
        description: values.description,
        ingredients: values.ingredients,
        steps: values.steps,
        imageUrl: values.image_url?.trim() ? values.image_url : null,
        category: values.category,
        prepTime: values.prep_time,
        servings: values.servings,
        isPublic: values.visibility === "public",
      };

      if (recipe) {
        await updateRecipe(user.id, recipe.id, payload);
      } else {
        await createRecipe(user.id, payload);
      }

      onCreated?.();
      onClose();
      reset(createDefaultValues());
    } catch (saveError) {
      setSubmitError(
        saveError instanceof Error
          ? saveError.message
          : "Das Rezept konnte nicht gespeichert werden.",
      );
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Modal schließen"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
          />

          <div className="fixed inset-0 z-[95] overflow-y-auto px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-4xl overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,74,0.12),transparent_34%)]" />

                <div className="relative z-10 border-b border-white/8 px-5 py-5 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                        <ChefHat size={20} />
                      </div>

                      <div>
                        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                          Nuvio Taste
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-3xl">
                          {isEditMode ? "Rezept bearbeiten" : "Neues Rezept erstellen"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#B7AA96]">
                          {isEditMode
                            ? "Passe die Felder an und speichere die Änderungen direkt in Supabase."
                            : "Fülle alle relevanten Felder aus und speichere das Rezept direkt in Supabase."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#CDB99B] transition-all duration-300 hover:border-[#D6A84A]/18 hover:text-[#FFF8EE]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="relative z-10">
                  <div className="grid gap-6 px-5 py-5 sm:px-7 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                      <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <SectionTitle
                          title="Basisdaten"
                          subtitle="Titel, Beschreibung und Grundinformationen"
                        />

                        <div className="grid gap-5">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Titel
                            </label>
                            <input
                              {...register("title")}
                              placeholder="z. B. Spaghetti Bolognese"
                              className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                            />
                            <FieldError message={errors.title?.message} />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Beschreibung
                            </label>
                            <textarea
                              {...register("description")}
                              placeholder="Kurze Beschreibung des Rezepts"
                              rows={4}
                              className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                            />
                            <FieldError message={errors.description?.message} />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Bild URL
                            </label>
                            <div className="relative">
                              <ImageIcon
                                size={16}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E806F]"
                              />
                              <input
                                {...register("image_url")}
                                placeholder="https://..."
                                className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 pl-11 pr-4 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                              />
                            </div>
                            <FieldError message={errors.image_url?.message} />
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <SectionTitle
                            title="Zutaten"
                            subtitle="Wird als jsonb Array gespeichert"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              appendIngredient({
                                id: crypto.randomUUID(),
                                name: "",
                                amount: "",
                                unit: "",
                              })
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-4 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/20"
                          >
                            <Plus size={16} />
                            Zutat
                          </button>
                        </div>

                        <div className="space-y-4">
                          {ingredientFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="rounded-[24px] border border-white/8 bg-black/10 p-4"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-[#D8B989]">
                                  Zutat {index + 1}
                                </p>

                                {ingredientFields.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/5 text-red-200 transition-colors duration-300 hover:bg-red-400/10"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ) : null}
                              </div>

                              <div className="grid gap-4 md:grid-cols-[1fr_0.6fr_0.5fr]">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                    Name
                                  </label>
                                  <input
                                    {...register(`ingredients.${index}.name`)}
                                    placeholder="z. B. Spaghetti"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                  />
                                  <FieldError
                                    message={errors.ingredients?.[index]?.name?.message}
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                    Menge
                                  </label>
                                  <input
                                    {...register(`ingredients.${index}.amount`)}
                                    placeholder="z. B. 250"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                  />
                                  <FieldError
                                    message={errors.ingredients?.[index]?.amount?.message}
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                    Einheit
                                  </label>
                                  <input
                                    {...register(`ingredients.${index}.unit`)}
                                    placeholder="g / ml / Stück"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                  />
                                  <FieldError
                                    message={errors.ingredients?.[index]?.unit?.message}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <SectionTitle
                            title="Zubereitung"
                            subtitle="Wird als jsonb Array gespeichert"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              appendStep({
                                id: crypto.randomUUID(),
                                text: "",
                              })
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-white/[0.03] px-4 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/20"
                          >
                            <Plus size={16} />
                            Schritt
                          </button>
                        </div>

                        <div className="space-y-4">
                          {stepFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="rounded-[24px] border border-white/8 bg-black/10 p-4"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-medium text-[#D8B989]">
                                  Schritt {index + 1}
                                </p>

                                {stepFields.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/5 text-red-200 transition-colors duration-300 hover:bg-red-400/10"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ) : null}
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                  Beschreibung
                                </label>
                                <textarea
                                  {...register(`steps.${index}.text`)}
                                  rows={3}
                                  placeholder="z. B. Nudeln nach Packungsanweisung kochen"
                                  className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                />
                                <FieldError message={errors.steps?.[index]?.text?.message} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <SectionTitle
                          title="Angaben zum Rezept"
                          subtitle="Ergänze die wichtigsten Informationen zu deinem Rezept"
                        />

                        <div className="grid gap-5">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Kategorie
                            </label>
                            <input
                              {...register("category")}
                              placeholder="z. B. Abendessen"
                              className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                            />
                            <FieldError message={errors.category?.message} />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                Vorbereitungszeit
                              </label>
                              <input
                                type="number"
                                {...register("prep_time", {
                                  valueAsNumber: true,
                                })}
                                className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none focus:border-[#D6A84A]"
                              />
                              <FieldError message={errors.prep_time?.message} />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                Portionen
                              </label>
                              <input
                                type="number"
                                {...register("servings", {
                                  valueAsNumber: true,
                                })}
                                className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none focus:border-[#D6A84A]"
                              />
                              <FieldError message={errors.servings?.message} />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Sichtbarkeit
                            </label>
                            <select
                              {...register("visibility")}
                              className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]"
                            >
                              <option value="private" className="bg-[#171411]">
                                Privat
                              </option>
                              <option value="public" className="bg-[#171411]">
                                Öffentlich
                              </option>
                            </select>
                          </div>
                        </div>
                      </section>



                      {submitError ? (
                        <section className="rounded-[28px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] p-5">
                          <p className="text-sm leading-6 text-red-200">{submitError}</p>
                        </section>
                      ) : null}


                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/8 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
                    >
                      Abbrechen
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DEB457] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Save size={16} />
                      {isSubmitting
                        ? "Speichert..."
                        : isEditMode
                          ? "Änderungen speichern"
                          : "Rezept speichern"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
