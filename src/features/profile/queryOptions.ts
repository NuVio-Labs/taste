import { queryOptions } from "@tanstack/react-query";
import { fetchProfile } from "./profileService";

export function profileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: Boolean(userId),
  });
}
