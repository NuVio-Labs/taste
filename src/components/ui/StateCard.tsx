import type { ReactNode } from "react";
import { AlertTriangle, FolderOpen } from "lucide-react";

type StateCardProps = {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
};

function BaseStateCard({
  action,
  description,
  eyebrow,
  icon,
  title,
}: StateCardProps) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
        {icon}
      </div>
      {eyebrow ? (
        <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[#8D7E6E]">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#FFF8EE]">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7AA96]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function EmptyStateCard(props: Omit<StateCardProps, "icon">) {
  return <BaseStateCard icon={<FolderOpen size={20} />} {...props} />;
}

export function ErrorStateCard(props: Omit<StateCardProps, "icon">) {
  return <BaseStateCard icon={<AlertTriangle size={20} />} {...props} />;
}
