import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ShoppingListPlan } from "../../features/shopping-list/types";

type ShoppingListPickerOption = {
  id: string;
  name: string;
  recipeCount: number;
};

type ShoppingListPickerDialogProps = {
  canCreateList: boolean;
  externalError?: string | null;
  isOpen: boolean;
  listLimit: number;
  lists: ShoppingListPickerOption[];
  onClose: () => void;
  onConfirm: (listId: string, servings: number) => void;
  onCreateList: (name: string) => string | null;
  plan: ShoppingListPlan;
  recipeServings: number | null;
  recipeTitle: string;
};

export function ShoppingListPickerDialog({
  canCreateList,
  externalError = null,
  isOpen,
  listLimit,
  lists,
  onClose,
  onConfirm,
  onCreateList,
  plan,
  recipeServings,
  recipeTitle,
}: ShoppingListPickerDialogProps) {
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState<number>(recipeServings ?? 1);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Portionen aus Rezept beim Dialog-Öffnen setzen: intentional
    setServings(recipeServings ?? 1);
    setError(null);
  }, [isOpen, recipeServings]);

  if (!isOpen) {
    return null;
  }

  function handleCreateList() {
    setError(null);
    const nextId = onCreateList(newListName);

    if (!nextId) {
      setError("Die Liste konnte nicht erstellt werden.");
      return;
    }

    setSelectedListId(nextId);
    setNewListName("");
  }

  function handleConfirm() {
    if (!selectedListId) {
      setError("Bitte wähle zuerst eine Liste aus.");
      return;
    }

    if (!Number.isFinite(servings) || servings < 1) {
      setError("Bitte wähle mindestens 1 Portion.");
      return;
    }

    onConfirm(selectedListId, servings);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Dialog schließen"
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[3px]"
      />

      <div className="fixed inset-0 z-[95] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.98)_0%,rgba(18,15,12,0.98)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#B89A67]">
                Einkaufsliste
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                Rezept hinzufügen
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#D5C5AF]">
                „{recipeTitle}“ wird einer bestehenden Liste zugeordnet oder direkt in
                eine neue Liste übernommen.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#F6EFE4]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {lists.length > 0 ? (
              lists.map((list) => {
                const isSelected = selectedListId === list.id;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      setSelectedListId(list.id);
                      setError(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition-colors duration-300 ${
                      isSelected
                        ? "border-[#D6A84A]/28 bg-[rgba(214,168,74,0.12)]"
                        : "border-white/8 bg-black/10 hover:border-[#D6A84A]/18"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
                        <ShoppingCart size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#FFF8EE]">{list.name}</p>
                        <p className="text-xs text-[#A99883]">
                          {list.recipeCount} Rezept{list.recipeCount === 1 ? "" : "e"}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs uppercase tracking-[0.18em] text-[#B89A67]">
                      Wählen
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-[#D5C5AF]">
                Noch keine Liste vorhanden. Lege direkt deine erste Einkaufsliste an.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#FFF8EE]">Portionen</p>
                <p className="text-xs text-[#A99883]">
                  Standard aus dem Rezept, bei Bedarf anpassen
                </p>
              </div>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#B89A67]">
                Default {recipeServings ?? 1}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings((current) => Math.max(1, current - 1))}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                min={1}
                value={servings}
                onChange={(event) =>
                  setServings(Math.max(1, Number.parseInt(event.target.value || "1", 10) || 1))
                }
                className="h-11 w-24 rounded-full border border-white/10 bg-white/[0.03] px-4 text-center text-sm text-[#FFF8EE] outline-none transition-colors duration-300 focus:border-[#D6A84A] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={() => setServings((current) => current + 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
              >
                <Plus size={16} />
              </button>

              <span className="text-sm text-[#D5C5AF]">
                Portion{servings === 1 ? "" : "en"}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#FFF8EE]">Neue Liste anlegen</p>
                <p className="text-xs text-[#A99883]">
                  {plan === "pro" ? "Pro" : "Free"}: maximal {listLimit} Listen
                </p>
              </div>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#B89A67]">
                {lists.length}/{listLimit}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="z. B. Wocheneinkauf"
                disabled={!canCreateList}
                className="h-12 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-[#FFF8EE] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleCreateList}
                disabled={!canCreateList || !newListName.trim()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-5 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28 disabled:translate-y-0 disabled:opacity-50"
              >
                <Plus size={16} />
                Liste anlegen
              </button>
            </div>
          </div>

          {error || externalError ? (
            <div className="mt-4 rounded-[18px] border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-sm text-red-200">
              {externalError ?? error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-[#F6EFE4] transition-all duration-300 hover:border-[#D6A84A]/18"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6A84A]/20 bg-[#D6A84A] px-5 text-sm font-medium text-[#1A140E] transition-all duration-300 hover:bg-[#DEB457]"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
