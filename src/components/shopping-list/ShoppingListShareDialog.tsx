import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Link, Loader2, Share2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createShare,
  deleteShare,
  fetchSharesForList,
} from "../../features/shopping-list/shoppingListShareService";
import type { ShoppingList, ShoppingListSharePermission } from "../../features/shopping-list/types";

type Props = {
  isOpen: boolean;
  list: ShoppingList | null;
  userId: string;
  onClose: () => void;
};

function sharesQueryKey(listId: string) {
  return ["shopping-list-shares", listId] as const;
}

function buildShareUrl(token: string) {
  return `${window.location.origin}/shopping-list?share=${token}`;
}

export function ShoppingListShareDialog({ isOpen, list, userId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<ShoppingListSharePermission>("read");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: shares = [], isLoading } = useQuery({
    queryKey: sharesQueryKey(list?.id ?? ""),
    queryFn: () => fetchSharesForList(list!.id),
    enabled: isOpen && Boolean(list?.id),
  });

  async function handleCreate() {
    if (!list) return;
    setIsCreating(true);
    setError(null);
    try {
      await createShare(list.id, userId, permission);
      await queryClient.invalidateQueries({ queryKey: sharesQueryKey(list.id) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Freigabe konnte nicht erstellt werden.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(shareId: string) {
    if (!list) return;
    try {
      await deleteShare(shareId);
      await queryClient.invalidateQueries({ queryKey: sharesQueryKey(list.id) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Freigabe konnte nicht gelöscht werden.");
    }
  }

  async function handleShare(token: string) {
    const url = buildShareUrl(token);
    const shareData = {
      title: `Einkaufsliste: ${list?.name ?? ""}`,
      text: "Schau dir diese Einkaufsliste an:",
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  async function handleCopy(token: string) {
    await navigator.clipboard.writeText(buildShareUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-t-[32px] border border-white/10 bg-[#141210] p-6 shadow-2xl sm:rounded-[32px]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#8D7E6E]">
                  Liste teilen
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-[#FFF8EE]">
                  {list?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#8D7E6E]">
                Erstelle einen Link, den du per WhatsApp oder anderen Kanälen teilen kannst. Nur angemeldete Nutzer können die Liste öffnen.
              </p>

              <div className="flex items-center gap-2">
                {(["read", "edit"] as ShoppingListSharePermission[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPermission(p)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      permission === p
                        ? "border-[#D6A84A]/30 bg-[#D6A84A]/12 text-[#F6D78E]"
                        : "border-white/10 bg-white/[0.02] text-[#8E806F] hover:text-[#D5C5AF]"
                    }`}
                  >
                    {p === "read" ? "Nur ansehen" : "Bearbeiten"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[linear-gradient(180deg,rgba(214,168,74,0.18),rgba(214,168,74,0.1))] px-5 py-3 text-sm font-semibold text-[#FFF1D4] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6A84A]/28 disabled:translate-y-0 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Link size={15} />
                )}
                Link erstellen
              </button>

              {error ? (
                <p className="text-sm text-red-300">{error}</p>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-5 flex justify-center py-4">
                <Loader2 size={18} className="animate-spin text-[#8D7E6E]" />
              </div>
            ) : shares.length > 0 ? (
              <div className="mt-5 space-y-2 border-t border-white/8 pt-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8D7E6E]">
                  Aktive Links
                </p>
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-[#A99883]">
                        {buildShareUrl(share.token)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B5E4E]">
                        {share.permission === "read" ? "Nur ansehen" : "Bearbeiten"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleShare(share.token)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6A84A]/20 bg-[#D6A84A]/8 text-[#F6D78E] transition-colors hover:bg-[#D6A84A]/14"
                        title="Teilen"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(share.token)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#A99883] transition-colors hover:text-[#F6EFE4]"
                        title="Link kopieren"
                      >
                        {copiedToken === share.token ? (
                          <Check size={14} className="text-[#D6A84A]" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(share.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.08)] text-red-200 transition-colors hover:bg-[rgba(255,120,120,0.14)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
