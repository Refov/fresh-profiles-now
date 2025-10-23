import { supabase, Profile } from './supabase'

export interface ProfileFilters {
  workModes?: string[]
  city?: string
  country?: string
  skills?: string[]
  search?: string
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface ProfileResult {
  profiles: Profile[]
  total: number
  hasMore: boolean
}

// Normalize LinkedIn URL for uniqueness check
function normalizeLinkedInUrl(url: string): string {
  if (!url) return ''
  
  // Remove protocol and www for comparison
  let normalized = url.replace(/^https?:\/\/(www\.)?/, '')
  
  // Ensure it starts with linkedin.com
  if (!normalized.startsWith('linkedin.com/')) {
    normalized = 'linkedin.com/' + normalized
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '')
  
  return normalized.toLowerCase()
}

// Ensure LinkedIn URL has proper protocol for opening
function ensureLinkedInProtocol(url: string): string {
  if (!url) return ''
  
  // If it already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Add https:// if missing
  return 'https://' + url
}

// Normalize skills array: split commas, trim, lowercase, dedupe
function normalizeSkills(skills: string[]): string[] {
  const normalized: string[] = []
  
  skills.forEach(skill => {
    // Split by comma in case multiple skills were entered as one
    const parts = skill.split(',')
    parts.forEach(part => {
      const trimmed = part.trim().toLowerCase()
      if (trimmed && !normalized.includes(trimmed)) {
        normalized.push(trimmed)
      }
    })
  })
  
  return normalized
}

// Save a profile to Supabase
export async function saveProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'expires_at'>): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' }
    }

    // Additional spam protection: check for suspicious patterns (whole words only)
    const suspiciousPatterns = [
      /\btest\b/i, /\bspam\b/i, /\bfake\b/i, /\bdummy\b/i, /\bexample\b/i,
      /\basdf\b/i, /\bqwerty\b/i, /\b123456\b/i, /\badmin\b/i
    ];
    
    const fullText = `${profileData.name} ${profileData.surname} ${profileData.job_title} ${profileData.about_me}`.toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullText)) {
        return { success: false, error: 'Profile contains suspicious content' };
      }
    }

    // Check for minimum content quality
    if (profileData.about_me.length < 20) {
      return { success: false, error: 'About me section must be at least 20 characters' };
    }
    // Normalize LinkedIn URL
    const normalizedLinkedIn = normalizeLinkedInUrl(profileData.linkedin_url)
    
    // Check if profile with same LinkedIn URL exists (using normalized version for comparison)
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('id, linkedin_url')
      .limit(100) // Get more profiles to check normalization
    
    if (checkError) {
      return { success: false, error: `Database error: ${checkError.message}` }
    }
    
    // Check if any existing profile has the same normalized LinkedIn URL
    const duplicateProfile = existingProfiles?.find(profile => 
      normalizeLinkedInUrl(profile.linkedin_url) === normalizedLinkedIn
    )
    
    const profileToSave = {
      ...profileData,
      core_skills: normalizeSkills(profileData.core_skills), // Normalize: split commas, trim, lowercase, dedupe
      linkedin_url: ensureLinkedInProtocol(profileData.linkedin_url), // Store with proper protocol
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }
    
    let result
    
    if (duplicateProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(profileToSave)
        .eq('id', duplicateProfile.id)
        .select()
        .single()
      
      result = { data, error }
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileToSave)
        .select()
        .single()
      
      result = { data, error }
    }
    
    if (result.error) {
      return { success: false, error: `Failed to save profile: ${result.error.message}` }
    }
    
    return { success: true, profile: result.data }
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Get profiles with filtering and pagination
export async function getProfiles(filters: ProfileFilters = {}, pagination: PaginationOptions = { page: 1, limit: 10 }): Promise<ProfileResult> {
  try {
    if (!supabase) {
      return { profiles: [], total: 0, hasMore: false }
    }
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gt('expires_at', new Date().toISOString()) // Only get non-expired profiles
    
    // Apply filters (trim all text inputs to ignore leading/trailing spaces)
    if (filters.workModes && filters.workModes.length > 0) {
      query = query.overlaps('work_modes', filters.workModes)
    }
    
    if (filters.city) {
      const trimmedCity = filters.city.trim()
      if (trimmedCity) {
        query = query.ilike('city', `%${trimmedCity}%`)
      }
    }
    
    if (filters.country) {
      const trimmedCountry = filters.country.trim()
      if (trimmedCountry) {
        query = query.ilike('country', `%${trimmedCountry}%`)
      }
    }
    
    if (filters.skills && filters.skills.length > 0) {
      // Skills are normalized (lowercase, trimmed) in DB, so search with normalized terms
      const normalizedSkills = filters.skills.map(s => s.trim().toLowerCase()).filter(Boolean)
      for (const skill of normalizedSkills) {
        query = query.contains('core_skills', [skill])
      }
    }
    
    if (filters.search) {
      const trimmedSearch = filters.search.trim()
      if (trimmedSearch) {
        const searchTerm = `%${trimmedSearch}%`
        query = query.or(`name.ilike.${searchTerm},surname.ilike.${searchTerm},job_title.ilike.${searchTerm},about_me.ilike.${searchTerm}`)
      }
    }
    
    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return {
      profiles: data || [],
      total: count || 0,
      hasMore: (count || 0) > pagination.page * pagination.limit
    }
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return {
      profiles: [],
      total: 0,
      hasMore: false
    }
  }
}

// Remove a profile by ID
export async function removeProfile(profileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)
    
    if (error) {
      return { success: false, error: `Failed to remove profile: ${error.message}` }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Clean up expired profiles (this would typically be run by a cron job)
export async function cleanupExpiredProfiles(): Promise<{ success: boolean; error?: string; removedCount?: number }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')
    
    if (error) {
      return { success: false, error: `Failed to cleanup expired profiles: ${error.message}` }
    }
    
    return { success: true, removedCount: data?.length || 0 }
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}
