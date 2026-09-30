export interface StudentProfile {
  usn: string;
  name?: string;
  section?: string;
  photo: string | null;
  avatarUrl?: string;
  updatedAt: string;
}

const memoryProfiles: Record<string, StudentProfile> = {};

export async function getProfile(usn: string): Promise<StudentProfile> {
  const norm = usn.toUpperCase();
  if (memoryProfiles[norm]) {
    return memoryProfiles[norm];
  }
  return {
    usn: norm,
    photo: null,
    avatarUrl: undefined,
    updatedAt: new Date(0).toISOString(),
  };
}

export async function setProfilePhoto(usn: string, photo: string): Promise<StudentProfile> {
  const norm = usn.toUpperCase();
  const profile: StudentProfile = {
    usn: norm,
    photo,
    avatarUrl: photo,
    updatedAt: new Date().toISOString(),
  };
  memoryProfiles[norm] = profile;
  return profile;
}

export async function removeProfilePhoto(usn: string): Promise<StudentProfile> {
  const norm = usn.toUpperCase();
  const profile: StudentProfile = {
    usn: norm,
    photo: null,
    avatarUrl: undefined,
    updatedAt: new Date().toISOString(),
  };
  memoryProfiles[norm] = profile;
  return profile;
}

export async function saveProfile(profile: Partial<StudentProfile> & { usn: string }): Promise<StudentProfile> {
  const norm = profile.usn.toUpperCase();
  const existing = await getProfile(norm);
  const updated: StudentProfile = {
    ...existing,
    ...profile,
    usn: norm,
    updatedAt: new Date().toISOString(),
  };
  memoryProfiles[norm] = updated;
  return updated;
}
