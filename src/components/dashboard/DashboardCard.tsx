import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

type DashboardCardProps = {
  description: string;
  icon: LucideIcon;
  title: string;
  value: string;
};

export function DashboardCard({
  description,
  icon: Icon,
  title,
  value,
}: DashboardCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
    </Card>
  );
}
