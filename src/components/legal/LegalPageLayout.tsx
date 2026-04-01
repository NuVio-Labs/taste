import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function LegalPageLayout({
  children,
  description,
  title,
}: LegalPageLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0E0C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,74,0.10),transparent_18%),radial-gradient(circle_at_16%_18%,rgba(94,71,32,0.09),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(111,123,59,0.07),transparent_20%),linear-gradient(180deg,#0F0E0C_0%,#090806_100%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[#F6EFE4] transition-colors duration-300 hover:border-[#D6A84A]/18"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
              <ChefHat size={16} />
            </span>
            Zurück zum Login
          </Link>
        </div>

        <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-6 shadow-[0_20px_48px_rgba(0,0,0,0.24)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
            NuVio Taste
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#FFF8EE] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#D5C5AF] sm:text-base">
            {description}
          </p>

          <div className="mt-8 space-y-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function LegalSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-[#D5C5AF] sm:text-base">
        {children}
      </div>
    </section>
  );
}
