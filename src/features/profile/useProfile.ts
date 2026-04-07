import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileQueryOptions } from "./queryOptions";
import type { ProfileData } from "./types";

type UseProfileResult = {
  error: string | null;
  isLoading: boolean;
  profile: ProfileData | null;
  reload: () => void;
};

export function useProfile(userId: string): UseProfileResult {
  const { data, isLoading, error, refetch } = useQuery(profileQueryOptions(userId));
  const reload = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    profile: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    reload,
  };
}
