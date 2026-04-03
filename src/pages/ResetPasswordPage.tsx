import { useState, type FormEvent } from "react";
import { ArrowRight, ChefHat, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { updateUserPassword } from "../features/auth/auth-service";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwort-Bestätigung stimmt nicht überein.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUserPassword(password);
      setSuccess("Passwort aktualisiert. Du kannst dich jetzt mit dem neuen Passwort anmelden.");
      setPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Das Passwort konnte nicht aktualisiert werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(214,168,74,0.12),transparent_22%),radial-gradient(circle_at_50%_45%,rgba(94,71,32,0.1),transparent_30%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <section className="w-full max-w-[430px] rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,23,19,0.96)_0%,rgba(20,16,13,0.97)_100%)] px-6 pb-7 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:px-7 sm:pb-8 sm:pt-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
              <ChefHat size={18} />
            </div>
            <div>
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-[#D8B989]">
                NuvioLabs Taste
              </p>
              <p className="mt-1 text-[0.96rem] text-[#B7AA96]">
                Neues Passwort setzen
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
              Recovery
            </p>
            <h1 className="mt-2 text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.05em] text-[#FFF8EE]">
              Passwort aktualisieren
            </h1>
            <p className="mt-4 text-[1rem] leading-7 text-[#C0B09A]">
              Diese Seite ist für Supabase-Recovery-Links vorbereitet und muss nicht
              im normalen Login-Flow sichtbar sein.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#F6EFE4]">Neues Passwort</span>
              <div className="relative">
                <LockKeyhole size={18} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#B7AA96]" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className="w-full border-b border-white/10 bg-transparent pb-3 pl-8 pr-4 text-[1.05rem] text-[#F6EFE4] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#F6EFE4]">Passwort bestätigen</span>
              <div className="relative">
                <LockKeyhole size={18} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#B7AA96]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full border-b border-white/10 bg-transparent pb-3 pl-8 pr-4 text-[1.05rem] text-[#F6EFE4] outline-none transition-colors duration-300 placeholder:text-[#8E806F] focus:border-[#D6A84A]"
                />
              </div>
            </label>

            {error ? <p className="text-sm leading-6 text-[#f1b6a8]">{error}</p> : null}
            {success ? <p className="text-sm leading-6 text-[#E9D8B4]">{success}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#E9D8B4]/12 bg-[#D6A84A] text-[1.08rem] font-medium text-[#1A140E] shadow-[0_12px_30px_rgba(214,168,74,0.24)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#DEB457] disabled:translate-y-0 disabled:bg-[#6d5940] disabled:text-[#d7c8ae]"
            >
              {isSubmitting ? "Bitte warten" : "Passwort speichern"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-7 text-center text-[0.88rem] leading-6 text-[#ffffff]">
            <Link
              to="/login"
              className="text-[#E9D8B4] underline underline-offset-4 transition-colors duration-300 hover:text-white"
            >
              Zurück zum Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
