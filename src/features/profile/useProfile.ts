import { useEffect, useState } from "react";
import { fetchProfile } from "./profileService";
import type { ProfileData } from "./types";

type UseProfileResult = {
  error: string | null;
  isLoading: boolean;
  profile: ProfileData | null;
  reload: () => Promise<void>;
};

export function useProfile(userId: string): UseProfileResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    if (!userId) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextProfile = await fetchProfile(userId);
      setProfile(nextProfile);
    } catch (loadError) {
      setProfile(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Das Profil konnte nicht geladen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, [userId]);

  return {
    profile,
    isLoading,
    error,
    reload: loadProfile,
  };
}
