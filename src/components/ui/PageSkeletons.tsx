import { ChefHat } from "lucide-react";
import { Skeleton } from "./Skeleton";

export function DashboardStatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`dashboard-stat-skeleton-${index}`}
          className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.03)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="mt-3 h-3 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-5/6 rounded-full" />
        </div>
      ))}
    </>
  );
}

export function DashboardRecentRecipesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`recent-recipe-skeleton-${index}`}
          className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E9D8B4]/10 bg-white/[0.03] text-[#E9D8B4]">
              <ChefHat size={16} />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function RecipeOverviewSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`recipe-card-skeleton-${index}`}
          className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-6 w-40 rounded-full" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24 rounded-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-10 rounded-full" />
              <Skeleton className="h-9 w-16 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSummarySkeleton() {
  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-black/10 p-4">
        <Skeleton className="h-16 w-16 rounded-3xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-52 rounded-full" />
        </div>
      </div>
      <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-28 rounded-full" />

      <section className="overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.03] shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
        <Skeleton className="aspect-[16/8] w-full rounded-none" />

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full max-w-3xl space-y-4">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-10 w-2/3 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-11/12 rounded-full" />
                <Skeleton className="h-4 w-4/5 rounded-full" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-11 w-28 rounded-full" />
              <Skeleton className="h-11 w-20 rounded-full" />
              <Skeleton className="h-11 w-48 rounded-full" />
              <Skeleton className="h-11 w-28 rounded-full" />
              <Skeleton className="h-11 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-8 w-48 rounded-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`ingredient-skeleton-${index}`}
                className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-black/10 px-4 py-3"
              >
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-8 w-32 rounded-full" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`step-skeleton-${index}`}
                className="flex gap-4 rounded-[24px] border border-white/8 bg-black/10 px-4 py-4"
              >
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-5/6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
