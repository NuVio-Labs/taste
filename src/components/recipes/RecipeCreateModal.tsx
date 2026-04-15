import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  ChefHat,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  createRecipe,
  updateRecipe,
} from "../../features/recipes/recipeService";
import { uploadRecipeImage, deleteRecipeImage } from "../../features/recipes/imageUpload";
import { normalizeIngredientUnit } from "../../features/recipes/ingredientNormalization";
import type { RecipeDetailData } from "../../features/recipes/types";
import { supabase } from "../../lib/supabase";

const ingredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Bitte Namen eingeben"),
  amount: z
    .string()
    .refine((value) => value.trim().length === 0 || /^\d+([.,]\d+)?$/.test(value.trim()), {
      message: "Bitte nur Zahlen eingeben",
    }),
  amountNote: z.string(),
  unit: z.string(),
}).refine(
  (value) =>
    value.amount.trim().length > 0 ||
    value.amountNote.trim().length > 0 ||
    value.unit.trim().length > 0,
  {
    message: "Bitte Menge, Einheit oder Zusatz eingeben",
    path: ["amount"],
  },
);

const stepSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "Bitte Schritt eingeben"),
});

const recipeSchema = z.object({
  title: z.string().min(2, "Titel zu kurz"),
  description: z.string().min(10, "Beschreibung zu kurz"),
  image_url: z.string().optional(),
  category: z.string().min(2, "Kategorie angeben"),
  prep_time: z.number().int().min(1, "Mindestens 1 Minute"),
  prep_time_unit: z.enum(["minutes", "hours", "days"]),
  servings: z.number().int().min(1, "Mindestens 1 Portion"),
  visibility: z.enum(["private", "public"]),
  is_vegetarian: z.boolean(),
  is_vegan: z.boolean(),
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

const ingredientUnitOptions = [
  "g",
  "kg",
  "mg",
  "ml",
  "l",
  "TL",
  "EL",
  "Tasse",
  "Stk.",
  "Dose",
  "Packung",
  "Scheibe",
  "Zehe",
  "Bund",
  "Prise",
  "Handvoll",
  "Becher",
  "Glas",
  "Flasche",
  "nach Bedarf",
];

function createDefaultValues(): RecipeFormValues {
  return {
    title: "",
    description: "",
    image_url: "",
    category: "",
    prep_time: 20,
    prep_time_unit: "minutes",
    servings: 2,
    visibility: "private",
    is_vegetarian: false,
    is_vegan: false,
    ingredients: [
      {
        id: crypto.randomUUID(),
        name: "",
        amount: "",
        amountNote: "",
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

function getPrepTimeFormValues(prepTime: number | null): {
  prep_time: number;
  prep_time_unit: RecipeFormValues["prep_time_unit"];
} {
  if (!prepTime || prepTime <= 0) {
    return {
      prep_time: 20,
      prep_time_unit: "minutes",
    };
  }

  if (prepTime % 1440 === 0) {
    return {
      prep_time: prepTime / 1440,
      prep_time_unit: "days",
    };
  }

  if (prepTime % 60 === 0 && prepTime >= 60) {
    return {
      prep_time: prepTime / 60,
      prep_time_unit: "hours",
    };
  }

  return {
    prep_time: prepTime,
    prep_time_unit: "minutes",
  };
}

function convertPrepTimeToMinutes(
  value: number,
  unit: RecipeFormValues["prep_time_unit"],
): number {
  if (unit === "days") {
    return value * 1440;
  }

  if (unit === "hours") {
    return value * 60;
  }

  return value;
}

function createValuesFromRecipe(recipe: RecipeDetailData): RecipeFormValues {
  const prepTimeValues = getPrepTimeFormValues(recipe.prepTime);

  return {
    title: recipe.title,
    description: recipe.description,
    image_url: recipe.imageUrl ?? "",
    category: recipe.category,
    prep_time: prepTimeValues.prep_time,
    prep_time_unit: prepTimeValues.prep_time_unit,
    servings: recipe.servings ?? 2,
    visibility: recipe.isPublic ? "public" : "private",
    is_vegetarian: recipe.isVegetarian,
    is_vegan: recipe.isVegan,
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amountValue || ingredient.amount,
            amountNote: ingredient.amountNote,
            unit: ingredient.unit,
          }))
        : [
            {
              id: crypto.randomUUID(),
              name: "",
              amount: "",
              amountNote: "",
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

const numberInputClassName =
  "h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const selectClassName =
  "h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#171411] px-4 pr-11 text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A]";

export function RecipeCreateModal({
  onClose,
  onCreated,
  recipe,
  open,
}: RecipeCreateModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const isEditMode = Boolean(recipe);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmitError(null);
      setImageFile(null);
      setImagePreview(recipe?.imageUrl ?? null);
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
      let imageUrl = values.image_url?.trim() ?? null;

      if (imageFile) {
        setIsUploadingImage(true);
        try {
          imageUrl = await uploadRecipeImage(user.id, imageFile);
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload = {
        title: values.title,
        description: values.description,
        ingredients: values.ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name.trim(),
          amount: [ingredient.amount.trim(), ingredient.amountNote.trim()]
            .filter(Boolean)
            .join(" "),
          amountNote: ingredient.amountNote.trim(),
          amountValue: ingredient.amount.trim(),
          unit: normalizeIngredientUnit(ingredient.unit),
        })),
        steps: values.steps,
        imageUrl,
        category: values.category,
        prepTime: convertPrepTimeToMinutes(
          values.prep_time,
          values.prep_time_unit,
        ),
        servings: values.servings,
        isPublic: values.visibility === "public",
        isVegetarian: values.is_vegetarian,
        isVegan: values.is_vegan,
      };

      if (recipe) {
        await updateRecipe(user.id, recipe.id, payload);

        // Altes Bild aus Storage löschen wenn ersetzt oder entfernt
        const oldImageUrl = recipe.imageUrl;
        const imageWasReplaced = imageFile && oldImageUrl;
        const imageWasRemoved = !imagePreview && oldImageUrl;

        if ((imageWasReplaced || imageWasRemoved) && oldImageUrl) {
          await deleteRecipeImage(oldImageUrl).catch(() => {
            // Nicht kritisch — Storage-Leak ist besser als einen Speicherfehler anzuzeigen
          });
        }
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
              data-testid="recipe-create-modal"
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
                        <h2
                          data-testid="recipe-modal-title"
                          className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-3xl"
                        >
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
                              data-testid="recipe-title-input"
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
                              data-testid="recipe-description-input"
                              placeholder="Kurze Beschreibung des Rezepts"
                              rows={4}
                              className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                            />
                            <FieldError message={errors.description?.message} />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Rezeptbild
                            </label>
                            <div className="space-y-3">
                              <label className="group flex min-h-[164px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/12 bg-black/10 px-5 py-6 text-center transition-colors duration-200 hover:border-[#D6A84A]/30 hover:bg-black/20">
                                {imagePreview ? (
                                  <img
                                    src={imagePreview}
                                    alt="Vorschau"
                                    className="h-28 w-full rounded-[18px] object-cover"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#D6A84A] transition-colors duration-200 group-hover:border-[#D6A84A]/30">
                                    <ImageIcon size={22} />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-[#FFF8EE]">
                                    {imagePreview ? "Bild ändern" : "Bild auswählen"}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-[#9F917D]">
                                    JPG, PNG oder WebP · wird automatisch optimiert
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                  }}
                                />
                              </label>
                              {imagePreview ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImageFile(null);
                                    setImagePreview(null);
                                    setValue("image_url", "");
                                  }}
                                  className="text-xs text-[#9F917D] underline underline-offset-4 transition-colors duration-200 hover:text-[#F6EFE4]"
                                >
                                  Bild entfernen
                                </button>
                              ) : null}
                              <input {...register("image_url")} type="hidden" />
                            </div>
                            <FieldError message={errors.image_url?.message} />
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <SectionTitle
                            title="Zutaten"
                            subtitle="Mengen sind optional. Beispiele: 2 Stk., 1 Prise, nach Bedarf."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              appendIngredient({
                                id: crypto.randomUUID(),
                                name: "",
                                amount: "",
                                amountNote: "",
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
                          <datalist id="ingredient-unit-options">
                            {ingredientUnitOptions.map((unitOption) => (
                              <option key={unitOption} value={unitOption} />
                            ))}
                          </datalist>

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

                              <div className="grid gap-4 md:grid-cols-[1fr_0.5fr_0.7fr_0.8fr]">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                    Name
                                  </label>
                                  <input
                                    {...register(`ingredients.${index}.name`)}
                                    data-testid={index === 0 ? "ingredient-name-input-0" : undefined}
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
                                    data-testid={index === 0 ? "ingredient-amount-input-0" : undefined}
                                    placeholder="z. B. 250 oder leer"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                  />
                                  <FieldError
                                    message={errors.ingredients?.[index]?.amount?.message}
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                    Zusatz
                                  </label>
                                  <input
                                    {...register(`ingredients.${index}.amountNote`)}
                                    placeholder="optional"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                  />
                                  <p className="mt-2 text-xs text-[#9F917D]">
                                    z. B. gehäuft, fein gehackt, nach Geschmack
                                  </p>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                                    Einheit
                                  </label>
                                  <input
                                    {...register(`ingredients.${index}.unit`)}
                                    list="ingredient-unit-options"
                                    data-testid={index === 0 ? "ingredient-unit-select-0" : undefined}
                                    placeholder="z. B. Stk., Prise, nach Bedarf"
                                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-[#FFF8EE] outline-none placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                                  />
                                  <p className="mt-2 text-xs text-[#9F917D]">
                                    Freitext erlaubt. Vorschläge erscheinen beim Tippen.
                                  </p>
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
                                  data-testid={index === 0 ? "step-textarea-0" : undefined}
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
                              data-testid="recipe-category-input"
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
                              <div className="grid grid-cols-[1fr_110px] gap-3">
                                <input
                                  type="number"
                                  {...register("prep_time", {
                                    valueAsNumber: true,
                                  })}
                                  data-testid="recipe-prep-time-input"
                                  className={numberInputClassName}
                                />
                                <div className="relative">
                                  <select
                                    {...register("prep_time_unit")}
                                    data-testid="recipe-prep-time-unit-select"
                                    className={selectClassName}
                                  >
                                    <option value="minutes" className="bg-[#171411] text-[#FFF8EE]">
                                      Min
                                    </option>
                                    <option value="hours" className="bg-[#171411] text-[#FFF8EE]">
                                      Std
                                    </option>
                                    <option value="days" className="bg-[#171411] text-[#FFF8EE]">
                                      Tage
                                    </option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#B89A67]">
                                    <ChevronDown size={16} />
                                  </div>
                                </div>
                              </div>
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
                                data-testid="recipe-servings-input"
                                className={numberInputClassName}
                              />
                              <FieldError message={errors.servings?.message} />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#F6EFE4]">
                              Sichtbarkeit
                            </label>
                            <div className="relative">
                              <select
                                {...register("visibility")}
                                data-testid="recipe-visibility-select"
                                className={selectClassName}
                              >
                                <option value="private" className="bg-[#171411]">
                                  Privat
                                </option>
                                <option value="public" className="bg-[#171411]">
                                  Öffentlich
                                </option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#B89A67]">
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-medium text-[#F6EFE4]">Ernährungsweise</p>
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3 transition-colors duration-200 hover:border-white/14">
                              <input
                                type="checkbox"
                                {...register("is_vegetarian")}
                                className="h-4 w-4 accent-[#6FA86A]"
                              />
                              <span className="text-sm text-[#FFF8EE]">🌿 Vegetarisch</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3 transition-colors duration-200 hover:border-white/14">
                              <input
                                type="checkbox"
                                {...register("is_vegan")}
                                className="h-4 w-4 accent-[#5BAF7A]"
                              />
                              <span className="text-sm text-[#FFF8EE]">🌱 Vegan</span>
                            </label>
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
                      data-testid="recipe-submit-button"
                      disabled={isSubmitting || isUploadingImage}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DEB457] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUploadingImage ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {isUploadingImage
                        ? "Bild wird hochgeladen…"
                        : isSubmitting
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
