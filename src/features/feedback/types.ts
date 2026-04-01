export type FeedbackCategory = "bug" | "feedback" | "idea";

export type FeedbackPayload = {
  category: FeedbackCategory;
  email: string | null;
  message: string;
  page: string;
  userAgent: string;
  userId: string;
  username: string | null;
};
