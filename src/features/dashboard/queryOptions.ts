import { queryOptions } from "@tanstack/react-query";
import { fetchDashboardData } from "./dashboardService";

export function dashboardQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboardData(userId),
    enabled: Boolean(userId),
  });
}
