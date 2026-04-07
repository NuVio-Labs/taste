export type ProfileData = {
  avatarUrl: string | null;
  billingStatus?: string | null;
  createdAt: string | null;
  id: string;
  accessSource?: string | null;
  plan: "free" | "pro";
  username: string;
};
