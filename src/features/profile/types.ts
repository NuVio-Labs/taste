export type ProfileData = {
  avatarUrl: string | null;
  billingStatus?: string | null;
  cancelAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  createdAt: string | null;
  currentPeriodEnd?: string | null;
  id: string;
  accessSource?: string | null;
  plan: "free" | "pro";
  username: string;
};
