import { supabase } from "../../lib/supabase";
import type { FeedbackPayload } from "./types";

export async function createFeedback(payload: FeedbackPayload) {
  const { error } = await supabase.from("feedback").insert({
    user_id: payload.userId,
    email: payload.email,
    username: payload.username,
    category: payload.category,
    message: payload.message.trim(),
    page: payload.page,
    user_agent: payload.userAgent,
    status: "new",
  });

  if (error) {
    throw new Error(error.message);
  }
}
