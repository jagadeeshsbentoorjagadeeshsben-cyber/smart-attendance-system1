"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { StudentProfile } from "@/lib/profile";

interface ProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  updateAvatar: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/gs/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setProfile(data.profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateAvatar = async (avatarUrl: string) => {
    try {
      const res = await fetch("/gs/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
