import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const inspirationCards = [
  {
    title: "Schnelle Frühstücksideen",
    description: "Leichte, wiederkehrende Rezepte für stressfreie Morgenroutinen.",
  },
  {
    title: "Wärmende One-Pot-Gerichte",
    description: "Eintöpfe, Pasta und unkomplizierte Familiengerichte für jeden Tag.",
  },
  {
    title: "Süßes für später",
    description: "Desserts, Snacks und kleine Ideen für spontane Genussmomente.",
  },
];

export function InspirationPage() {
  const navigate = useNavigate();

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
                Dieser Bereich wird die Quelle für neue Kochideen, Themenwelten und
                passende Vorschläge aus deiner Sammlung.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/favorites")}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/18"
            >
              Zu den Favoriten
            </button>
          </div>
        </motion.section>

        <section className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inspirationCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                  <Sparkles size={18} />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#B7AA96]">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
            Nächster Ausbau
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
            Was wir hier später anbinden können
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-[#D5C5AF]">
              Rezeptideen aus Favoriten und zuletzt gekochten Gerichten ableiten
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-[#D5C5AF]">
              Themenwelten wie Meal Prep, Feierabendküche oder Dessert-Lust bündeln
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-[#D5C5AF]">
              saisonale Vorschläge und Wochenimpulse anzeigen
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-[#D5C5AF]">
              KI-gestützte Vorschläge auf Basis deines Geschmacks ergänzen
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
