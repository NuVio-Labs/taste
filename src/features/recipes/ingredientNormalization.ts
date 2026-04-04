export function slugifyIngredient(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeGermanIngredientText(value: string) {
  return slugifyIngredient(value)
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function singularizeIngredientWord(value: string) {
  const irregulars = new Map<string, string>([
    ["bohnen", "bohne"],
    ["erbsen", "erbse"],
    ["linsen", "linse"],
    ["oliven", "olive"],
    ["eier", "ei"],
    ["kartoffeln", "kartoffel"],
    ["zwiebeln", "zwiebel"],
    ["fruehlingszwiebeln", "fruehlingszwiebel"],
    ["knoblauchzehen", "knoblauchzehe"],
    ["karotten", "karotte"],
    ["tomaten", "tomate"],
  ]);

  const irregular = irregulars.get(value);

  if (irregular) {
    return irregular;
  }

  const suffixRules: Array<[string, string]> = [
    ["innen", "in"],
    ["eier", "ei"],
    ["etten", "ette"],
    ["anen", "ane"],
    ["onen", "one"],
    ["inen", "ine"],
    ["oten", "ote"],
    ["aten", "ate"],
    ["nen", "ne"],
    ["ten", "te"],
    ["eln", "el"],
    ["en", "e"],
    ["s", ""],
  ];

  for (const [suffix, replacement] of suffixRules) {
    if (value.length > suffix.length + 2 && value.endsWith(suffix)) {
      return `${value.slice(0, -suffix.length)}${replacement}`;
    }
  }

  return value;
}

export function normalizeIngredientName(value: string) {
  const base = normalizeGermanIngredientText(value)
    .replace(/[.,]/g, "")
    .replace(/\((.*?)\)/g, "")
    .trim();

  const aliases = new Map<string, string>([
    ["zwiebeln", "zwiebel"],
    ["rote zwiebeln", "rote zwiebel"],
    ["frühlingszwiebeln", "frühlingszwiebel"],
    ["tomaten", "tomate"],
    ["stückige tomaten", "tomate stueckig"],
    ["gehackte tomaten", "tomate stueckig"],
    ["passierte tomaten", "tomate passiert"],
    ["paprikas", "paprika"],
    ["rote paprikas", "rote paprika"],
    ["gelbe paprikas", "gelbe paprika"],
    ["grüne paprikas", "gruene paprika"],
    ["nudel", "nudeln"],
    ["spaghetti", "nudeln spaghetti"],
    ["penne", "nudeln penne"],
    ["paradeiser", "tomate"],
    ["kartoffeln", "kartoffel"],
    ["karotten", "karotte"],
    ["möhren", "karotte"],
    ["moehren", "karotte"],
    ["knoblauchzehen", "knoblauchzehe"],
  ]);

  const aliased = aliases.get(base);

  if (aliased) {
    return aliased;
  }

  const colorAliases = new Map<string, string>([
    ["rote", "rot"],
    ["roter", "rot"],
    ["roten", "rot"],
    ["rotes", "rot"],
    ["gelbe", "gelb"],
    ["gelber", "gelb"],
    ["gelben", "gelb"],
    ["gelbes", "gelb"],
    ["gruene", "gruen"],
    ["gruener", "gruen"],
    ["gruenen", "gruen"],
    ["gruenes", "gruen"],
    ["weisse", "weiss"],
    ["weisser", "weiss"],
    ["weissen", "weiss"],
    ["weisses", "weiss"],
  ]);

  const descriptorAliases = new Map<string, string>([
    ["gehackte", "gehackt"],
    ["gehackter", "gehackt"],
    ["gehackten", "gehackt"],
    ["gehacktes", "gehackt"],
    ["stueckige", "stueckig"],
    ["stueckiger", "stueckig"],
    ["stueckigen", "stueckig"],
    ["stueckiges", "stueckig"],
    ["passierte", "passiert"],
    ["passierter", "passiert"],
    ["passierten", "passiert"],
    ["passiertes", "passiert"],
  ]);

  const normalizedTokens = base
    .split(" ")
    .filter(Boolean)
    .map((token, index, tokens) => {
      if (index === tokens.length - 1) {
        return singularizeIngredientWord(token);
      }

      return (
        descriptorAliases.get(colorAliases.get(token) ?? token) ??
        colorAliases.get(token) ??
        token
      );
    });

  if (
    normalizedTokens.length === 2 &&
    ["gehackt", "stueckig", "passiert"].includes(normalizedTokens[0])
  ) {
    return `${normalizedTokens[1]} ${normalizedTokens[0]}`;
  }

  return normalizedTokens.join(" ");
}

export function normalizeIngredientUnit(value: string) {
  const base = normalizeGermanIngredientText(value).replace(/[.,]/g, "").trim();

  const aliases = new Map<string, string>([
    ["stk", "Stk."],
    ["stueck", "Stk."],
    ["stuecke", "Stk."],
    ["stuck", "Stk."],
    ["stucke", "Stk."],
    ["prise", "Prise"],
    ["prisen", "Prise"],
    ["zehe", "Zehe"],
    ["zehen", "Zehe"],
    ["dose", "Dose"],
    ["dosen", "Dose"],
    ["packung", "Packung"],
    ["packungen", "Packung"],
    ["scheibe", "Scheibe"],
    ["scheiben", "Scheibe"],
    ["tasse", "Tasse"],
    ["tassen", "Tasse"],
    ["bund", "Bund"],
    ["handvoll", "Handvoll"],
    ["becher", "Becher"],
    ["glas", "Glas"],
    ["flasche", "Flasche"],
    ["nach bedarf", "nach Bedarf"],
    ["bedarf", "nach Bedarf"],
    ["tl", "TL"],
    ["el", "EL"],
    ["g", "g"],
    ["kg", "kg"],
    ["mg", "mg"],
    ["ml", "ml"],
    ["l", "l"],
  ]);

  return aliases.get(base) ?? value.trim();
}

export function createNormalizedIngredientKey(name: string, unit: string) {
  return `${normalizeIngredientName(name)}__${normalizeGermanIngredientText(
    normalizeIngredientUnit(unit),
  )}`;
}
