export interface LocalProfile {
  id: string;
  name: string;
  surname: string;
  job_title: string;
  work_modes: Array<"onsite" | "hybrid" | "remote">;
  city: string | null;
  country: string;
  about_me: string;
  linkedin_url: string;
  core_skills: string[];
  created_at: string; // ISO
  updated_at: string; // ISO
  expires_at: string; // ISO
}

const STORAGE_KEY = "profiles";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeLinkedIn(url: string): string {
  try {
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    const noTrail = lower.endsWith("/") ? lower.slice(0, -1) : lower;
    return noTrail;
  } catch {
    return url;
  }
}

function readAll(): LocalProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalProfile[];
  } catch {
    return [];
  }
}

function writeAll(profiles: LocalProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function cleanupExpired(): void {
  const now = Date.now();
  const profiles = readAll();
  const filtered = profiles.filter(p => {
    const expires = new Date(p.expires_at).getTime();
    return isFinite(expires) && expires > now;
  });
  if (filtered.length !== profiles.length) {
    writeAll(filtered);
  }
}

export function getAllProfiles(): LocalProfile[] {
  cleanupExpired();
  // Return newest first, matching previous UI behavior
  return readAll().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addProfile(profile: Omit<LocalProfile, "id" | "created_at" | "updated_at" | "expires_at"> & { expires_at?: string; }): LocalProfile {
  const nowIso = new Date().toISOString();
  const expiresIso = profile.expires_at ?? new Date(Date.now() + THIRTY_DAYS_MS).toISOString();
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const full: LocalProfile = {
    id,
    created_at: nowIso,
    updated_at: nowIso,
    expires_at: expiresIso,
    name: profile.name,
    surname: profile.surname,
    job_title: profile.job_title,
    work_modes: profile.work_modes,
    city: profile.city ?? null,
    country: profile.country,
    about_me: profile.about_me,
    linkedin_url: normalizeLinkedIn(profile.linkedin_url),
    core_skills: profile.core_skills ?? [],
  };
  const all = readAll();
  const existingIdx = all.findIndex(p => normalizeLinkedIn(p.linkedin_url) === full.linkedin_url);
  if (existingIdx >= 0) {
    // Replace existing profile (same LinkedIn) to prevent duplicates
    all[existingIdx] = { ...full, id: all[existingIdx].id, created_at: all[existingIdx].created_at };
  } else {
    all.push(full);
  }
  writeAll(all);
  cleanupExpired();
  return full;
}

export function filterProfiles(
  profiles: LocalProfile[],
  filters: { city?: string; country?: string; jobTitle?: string; skills?: string[] }
): LocalProfile[] {
  const byCity = filters.city?.trim().toLowerCase() ?? "";
  const byCountry = filters.country?.trim().toLowerCase() ?? "";
  const byJob = filters.jobTitle?.trim().toLowerCase() ?? "";
  const bySkills = (filters.skills ?? []).map(s => s.trim().toLowerCase()).filter(Boolean);

  return profiles.filter(p => {
    const cityVal = (p.city ?? "").toLowerCase();
    const countryVal = p.country.toLowerCase();
    const jobVal = p.job_title.toLowerCase();
    const skillVals = p.core_skills.map(s => s.toLowerCase());

    if (byCity && !cityVal.includes(byCity)) return false;
    if (byCountry && !countryVal.includes(byCountry)) return false;
    if (byJob && !jobVal.includes(byJob)) return false;

    if (bySkills.length > 0) {
      // Match ALL selected skills (case-insensitive)
      const matchesAll = bySkills.every(fs => skillVals.some(ps => ps.includes(fs)));
      if (!matchesAll) return false;
    }

    return true;
  });
}

export function removeProfileById(id: string): void {
  const all = readAll();
  const next = all.filter(p => p.id !== id);
  writeAll(next);
}


