import { FolderOpenDot } from "lucide-react";
import { Card } from "../ui/Card";

type EmptyStateProps = {
  description: string;
  title: string;
};

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
        <FolderOpenDot className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
          {title}
        </h3>
        <p className="max-w-xl text-sm leading-6 text-neutral-600">
          {description}
        </p>
      </div>
    </Card>
  );
}
