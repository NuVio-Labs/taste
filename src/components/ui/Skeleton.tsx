type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.11),rgba(255,255,255,0.05))] bg-[length:200%_100%] ${className}`}
    />
  );
}
