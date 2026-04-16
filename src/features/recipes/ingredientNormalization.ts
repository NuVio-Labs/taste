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

// Irregular plurals that suffix rules can't handle reliably
const IRREGULAR_PLURALS = new Map<string, string>([
  // Vegetables
  ["tomaten", "tomate"],
  ["karotten", "karotte"],
  ["moehren", "karotte"],   // Möhren → karotte (canonical)
  ["kartoffeln", "kartoffel"],
  ["zwiebeln", "zwiebel"],
  ["fruehlingszwiebeln", "fruehlingszwiebel"],
  ["schalotten", "schalotte"],
  ["knoblauchzehen", "knoblauchzehe"],
  ["paprikaschoten", "paprikaschote"],
  ["zucchinis", "zucchini"],
  ["auberginen", "aubergine"],
  ["champignons", "champignon"],
  ["pilze", "pilz"],
  ["steinpilze", "steinpilz"],
  ["pfifferlinge", "pfifferling"],
  ["erbsen", "erbse"],
  ["bohnen", "bohne"],
  ["gruene bohnen", "gruene bohne"],
  ["linsen", "linse"],
  ["kichererbsen", "kichererbse"],
  ["oliven", "olive"],
  ["kapern", "kaper"],
  ["gurken", "gurke"],
  ["radieschen", "radieschen"], // already singular
  ["rueben", "ruebe"],
  ["rote rueben", "rote ruebe"],
  ["roten rueben", "rote ruebe"],
  ["selleriestangen", "selleriestange"],
  ["staudensellerie", "staudensellerie"],
  ["lauchstangen", "lauch"],
  ["fruehlingszwiebeln", "fruehlingszwiebel"],
  ["spargeln", "spargel"],
  ["artischocken", "artischocke"],
  ["rosenkohl", "rosenkohl"], // mass noun
  ["wirsing", "wirsing"],
  ["kohlrabi", "kohlrabi"],
  // Fruits
  ["aepfel", "apfel"],
  ["birnen", "birne"],
  ["zitronen", "zitrone"],
  ["limetten", "limette"],
  ["orangen", "orange"],
  ["mandarinen", "mandarine"],
  ["erdbeeren", "erdbeere"],
  ["himbeeren", "himbeere"],
  ["heidelbeeren", "heidelbeere"],
  ["brombeeren", "brombeere"],
  ["kirschen", "kirsche"],
  ["pflaumen", "pflaume"],
  ["aprikosen", "aprikose"],
  ["pfirsiche", "pfirsich"],
  ["mangos", "mango"],
  ["mangoes", "mango"],
  ["bananen", "banane"],
  ["trauben", "traube"],
  ["datteln", "dattel"],
  ["feigen", "feige"],
  ["avocados", "avocado"],
  ["avocadoes", "avocado"],
  // Proteins
  ["eier", "ei"],
  ["haehnchenbruestchen", "haehnchenbrust"],
  ["haehnchenschenkel", "haehnchenschenkel"],
  ["hackfleischbaelle", "hackfleischball"],
  ["garnelen", "garnele"],
  ["shrimps", "garnele"],
  ["meeresfruechtemixt", "meeresfruechte"],
  // Dairy
  ["eier", "ei"],
  // Herbs & spices
  ["kraeuter", "kraut"],
  ["gewuerze", "gewuerz"],
  ["chilischoten", "chilischote"],
  ["chilis", "chili"],
  ["jalapenos", "jalapeno"],
  // Nuts & seeds
  ["nuesse", "nuss"],
  ["mandeln", "mandel"],
  ["cashewkerne", "cashewkern"],
  ["walnuesse", "walnuss"],
  ["haselnuesse", "haselnuss"],
  ["erdnuesse", "erdnuss"],
  ["pinienkerne", "pinieenkern"],
  ["sonnenblumenkerne", "sonnenblumenkern"],
  ["kuerbiskerne", "kuerbiskern"],
  ["leinsamen", "leinsamen"],
  // Grains & pasta
  ["nudeln", "nudel"],
  ["spaghetti", "spaghetti"],
  ["linguine", "linguine"],
  ["tagliatelle", "tagliatelle"],
  ["penne", "penne"],
  ["rigatoni", "rigatoni"],
  ["fusilli", "fusilli"],
  ["farfalle", "farfalle"],
  ["gnocchi", "gnocchi"],
  // Legumes
  ["linsen", "linse"],
  ["erbsen", "erbse"],
  ["kichererbsen", "kichererbse"],
  ["bohnen", "bohne"],
  // Other
  ["scheiben", "scheibe"],
  ["stiele", "stiel"],
  ["zweige", "zweig"],
  ["blaetter", "blatt"],
  ["stuecke", "stueck"],
  ["wuerfeln", "wuerfel"],
  ["streifen", "streifen"],
]);

function singularizeIngredientWord(value: string): string {
  const irregular = IRREGULAR_PLURALS.get(value);
  if (irregular) return irregular;

  const suffixRules: Array<[string, string]> = [
    ["innen", "in"],
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

// Canonical synonyms — map any variant to one canonical form.
// Keys are already umlaut-normalized (ae/oe/ue/ss).
const SYNONYMS = new Map<string, string>([
  // Möhre / Karotte
  ["moehre", "karotte"],
  ["moehren", "karotte"],
  // Regional tomato names
  ["paradeiser", "tomate"],
  ["paradeiserapfel", "tomate"],
  // Frühlingszwiebel variants
  ["jungzwiebel", "fruehlingszwiebel"],
  ["jungzwiebeln", "fruehlingszwiebel"],
  ["lauchzwiebel", "fruehlingszwiebel"],
  ["lauchzwiebeln", "fruehlingszwiebel"],
  ["schnittlauch", "schnittlauch"],
  // Zucchini
  ["zucchino", "zucchini"],
  // Aubergine / Eggplant
  ["eggplant", "aubergine"],
  // Paprika variants
  ["peperoni", "paprika"],
  ["pepperoni", "paprika"],
  ["paprikaschote", "paprika"],
  // Knoblauch
  ["knoblauchzehe", "knoblauchzehe"],
  ["knoblauchzehen", "knoblauchzehe"],
  // Champignon / Pilz
  ["zuchtpilz", "champignon"],
  ["egerlinge", "champignon"],
  ["egerling", "champignon"],
  // Staudensellerie
  ["stauden-sellerie", "staudensellerie"],
  ["stangensellerie", "staudensellerie"],
  ["stangenselleries", "staudensellerie"],
  // Garnele
  ["shrimp", "garnele"],
  ["prawn", "garnele"],
  ["prawns", "garnele"],
  // Pasta synonyms (keep distinct pasta types, but normalize nudel → nudeln)
  ["nudel", "nudeln"],
  ["pasta", "nudeln"],
  // Öl
  ["olivenoel", "olivenoel"],
  ["sonnenblumenoel", "sonnenblumenoel"],
  ["rapsoel", "rapsoel"],
  // Essig
  ["balsamicoessig", "balsamico"],
  ["balsamessig", "balsamico"],
  // Brühe
  ["gemuesebruehe", "gemuesebruehe"],
  ["huehnerbrue", "huehnerbrue"],
  ["rinderbruehe", "rinderbruehe"],
  ["fleischbruehe", "rinderbruehe"],
  // Mehl
  ["weizenmehl", "mehl"],
  // Butter / Margarine
  ["pflanzenmargarine", "margarine"],
]);

// Adjective inflection endings to strip → canonical form
// Applied per-token before the last (noun) token
const ADJECTIVE_NORMALIZATIONS = new Map<string, string>([
  // Colors
  ["rote", "rot"], ["roter", "rot"], ["roten", "rot"], ["rotes", "rot"],
  ["gelbe", "gelb"], ["gelber", "gelb"], ["gelben", "gelb"], ["gelbes", "gelb"],
  ["gruene", "gruen"], ["gruener", "gruen"], ["gruenen", "gruen"], ["gruenes", "gruen"],
  ["weisse", "weiss"], ["weisser", "weiss"], ["weissen", "weiss"], ["weisses", "weiss"],
  ["schwarze", "schwarz"], ["schwarzer", "schwarz"], ["schwarzen", "schwarz"],
  ["lila", "lila"],
  ["violette", "violett"], ["violetter", "violett"],
  // Descriptors
  ["gehackte", "gehackt"], ["gehackter", "gehackt"], ["gehackten", "gehackt"], ["gehacktes", "gehackt"],
  ["stueckige", "stueckig"], ["stueckiger", "stueckig"], ["stueckigen", "stueckig"], ["stueckiges", "stueckig"],
  ["passierte", "passiert"], ["passierter", "passiert"], ["passierten", "passiert"], ["passiertes", "passiert"],
  ["getrocknete", "getrocknet"], ["getrockneter", "getrocknet"], ["getrockneten", "getrocknet"],
  ["frische", "frisch"], ["frischer", "frisch"], ["frischen", "frisch"], ["frisches", "frisch"],
  ["tiefgekuehlte", "tiefgekuehlt"], ["tiefgekuehlter", "tiefgekuehlt"], ["tiefgekuehlten", "tiefgekuehlt"],
  ["geriebene", "gerieben"], ["geriebenem", "gerieben"], ["geriebenen", "gerieben"], ["geriebener", "gerieben"],
  ["gemischte", "gemischt"], ["gemischter", "gemischt"], ["gemischten", "gemischt"],
  ["kleine", "klein"], ["kleiner", "klein"], ["kleinen", "klein"], ["kleines", "klein"],
  ["grosse", "gross"], ["grosser", "gross"], ["grossen", "gross"], ["grosses", "gross"],
  ["mittlere", "mittel"], ["mittlerer", "mittel"], ["mittleren", "mittel"],
  ["reife", "reif"], ["reifer", "reif"], ["reifen", "reif"],
  ["gekochte", "gekocht"], ["gekochter", "gekocht"], ["gekochten", "gekocht"],
  ["rohe", "roh"], ["roher", "roh"], ["rohen", "roh"],
  ["ganze", "ganz"], ["ganzer", "ganz"], ["ganzen", "ganz"], ["ganzes", "ganz"],
  ["halbe", "halb"], ["halber", "halb"], ["halben", "halb"],
]);

export function normalizeIngredientName(value: string): string {
  const base = normalizeGermanIngredientText(value)
    .replace(/[.,;]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();

  if (!base) return value.trim();

  // 1. Check raw form before any processing (catches full phrases like "passierte tomaten")
  const rawSynonym = SYNONYMS.get(base);
  if (rawSynonym) return rawSynonym;
  const rawIrregular = IRREGULAR_PLURALS.get(base);
  if (rawIrregular) return rawIrregular;

  // 2. Tokenize, normalize adjectives, singularize last token (the noun)
  const tokens = base.split(" ").filter(Boolean);
  const normalizedTokens = tokens.map((token, i) => {
    if (i === tokens.length - 1) {
      // Noun: singularize, then check synonym table
      const singular = IRREGULAR_PLURALS.get(token) ?? singularizeIngredientWord(token);
      return SYNONYMS.get(singular) ?? singular;
    }
    // Adjective/descriptor token
    return ADJECTIVE_NORMALIZATIONS.get(token) ?? token;
  });

  // 3. Reorder "descriptor noun" → "noun descriptor" for canonical form
  const REORDERABLE = new Set(["gehackt", "stueckig", "passiert", "getrocknet", "tiefgekuehlt", "gerieben"]);
  if (normalizedTokens.length === 2 && REORDERABLE.has(normalizedTokens[0])) {
    return `${normalizedTokens[1]} ${normalizedTokens[0]}`;
  }

  const joined = normalizedTokens.join(" ");

  // 4. Final synonym check on joined result
  return SYNONYMS.get(joined) ?? joined;
}

export function normalizeIngredientUnit(value: string): string {
  const base = normalizeGermanIngredientText(value).replace(/[.,]/g, "").trim();

  const aliases = new Map<string, string>([
    ["stk", "Stk."],
    ["stueck", "Stk."],
    ["stuecke", "Stk."],
    ["stuck", "Stk."],
    ["stucke", "Stk."],
    ["x", "Stk."],
    ["prise", "Prise"],
    ["prisen", "Prise"],
    ["msp", "Msp."],
    ["messerspitze", "Msp."],
    ["zehe", "Zehe"],
    ["zehen", "Zehe"],
    ["dose", "Dose"],
    ["dosen", "Dose"],
    ["konserve", "Dose"],
    ["konserven", "Dose"],
    ["packung", "Packung"],
    ["packungen", "Packung"],
    ["pck", "Packung"],
    ["pk", "Packung"],
    ["beutel", "Beutel"],
    ["beutel", "Beutel"],
    ["scheibe", "Scheibe"],
    ["scheiben", "Scheibe"],
    ["tasse", "Tasse"],
    ["tassen", "Tasse"],
    ["bund", "Bund"],
    ["buendel", "Bund"],
    ["handvoll", "Handvoll"],
    ["becher", "Becher"],
    ["glas", "Glas"],
    ["glaeser", "Glas"],
    ["flasche", "Flasche"],
    ["flaschen", "Flasche"],
    ["zweig", "Zweig"],
    ["zweige", "Zweig"],
    ["stiel", "Stiel"],
    ["stiele", "Stiel"],
    ["blatt", "Blatt"],
    ["blaetter", "Blatt"],
    ["wuerfel", "Würfel"],
    ["wuerfeln", "Würfel"],
    ["nach bedarf", "nach Bedarf"],
    ["bedarf", "nach Bedarf"],
    ["nach geschmack", "nach Geschmack"],
    ["geschmack", "nach Geschmack"],
    ["etwas", "etwas"],
    ["tl", "TL"],
    ["teeloefel", "TL"],
    ["el", "EL"],
    ["essloefel", "EL"],
    ["g", "g"],
    ["gr", "g"],
    ["gramm", "g"],
    ["kg", "kg"],
    ["kilogramm", "kg"],
    ["mg", "mg"],
    ["ml", "ml"],
    ["l", "l"],
    ["liter", "l"],
    ["dl", "dl"],
    ["deziliter", "dl"],
    ["cl", "cl"],
  ]);

  return aliases.get(base) ?? value.trim();
}

export function createNormalizedIngredientKey(name: string, unit: string) {
  return `${normalizeIngredientName(name)}__${normalizeGermanIngredientText(
    normalizeIngredientUnit(unit),
  )}`;
}
