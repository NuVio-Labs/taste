export type RecipeCategoryTheme = {
  categoryTextClassName: string;
  mediaClassName: string;
  overlayClassName: string;
};

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

export function getRecipeCategoryTheme(category: string): RecipeCategoryTheme {
  const normalizedCategory = normalizeCategory(category);

  if (normalizedCategory.includes("früh") || normalizedCategory.includes("frueh")) {
    return {
      categoryTextClassName: "text-[#F2BE72]",
      mediaClassName: "bg-[linear-gradient(135deg,#E78A00_0%,#F5A623_100%)]",
      overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.08))]",
    };
  }

  if (
    normalizedCategory.includes("dessert") ||
    normalizedCategory.includes("sü") ||
    normalizedCategory.includes("suess")
  ) {
    return {
      categoryTextClassName: "text-[#F29AC0]",
      mediaClassName: "bg-[linear-gradient(135deg,#C2185B_0%,#E91E63_100%)]",
      overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.10))]",
    };
  }

  if (
    normalizedCategory.includes("mittag") ||
    normalizedCategory.includes("lunch") ||
    normalizedCategory.includes("eintopf") ||
    normalizedCategory.includes("salat")
  ) {
    return {
      categoryTextClassName: "text-[#89D0A2]",
      mediaClassName: "bg-[linear-gradient(135deg,#1F7A3F_0%,#2E9F58_100%)]",
      overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.12))]",
    };
  }

  if (
    normalizedCategory.includes("abend") ||
    normalizedCategory.includes("dinner") ||
    normalizedCategory.includes("pasta") ||
    normalizedCategory.includes("haupt")
  ) {
    return {
      categoryTextClassName: "text-[#8CB8FF]",
      mediaClassName: "bg-[linear-gradient(135deg,#3057B8_0%,#4F7DFF_100%)]",
      overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))]",
    };
  }

  if (normalizedCategory.includes("snack") || normalizedCategory.includes("finger")) {
    return {
      categoryTextClassName: "text-[#E9C87A]",
      mediaClassName: "bg-[linear-gradient(135deg,#9A6B1F_0%,#C7922E_100%)]",
      overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.10))]",
    };
  }

  if (
    normalizedCategory.includes("getr") ||
    normalizedCategory.includes("drink") ||
    normalizedCategory.includes("smoothie")
  ) {
    return {
      categoryTextClassName: "text-[#82D7E8]",
      mediaClassName: "bg-[linear-gradient(135deg,#0E7490_0%,#22B8CF_100%)]",
      overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.10))]",
    };
  }

  return {
    categoryTextClassName: "text-[#B89A67]",
    mediaClassName: "bg-[linear-gradient(135deg,rgba(214,168,74,0.85),rgba(98,64,24,0.82))]",
    overlayClassName: "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.12))]",
  };
}
