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
  
  // Remove protocol and www
  let normalized = url.replace(/^https?:\/\/(www\.)?/, '')
  
  // Ensure it starts with linkedin.com
  if (!normalized.startsWith('linkedin.com/')) {
    normalized = 'linkedin.com/' + normalized
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '')
  
  return normalized.toLowerCase()
}

// Save a profile to Supabase
export async function saveProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'expires_at'>): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  try {
    // Normalize LinkedIn URL
    const normalizedLinkedIn = normalizeLinkedInUrl(profileData.linkedin_url)
    
    // Check if profile with same LinkedIn URL exists
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('linkedin_url', normalizedLinkedIn)
      .limit(1)
    
    if (checkError) {
      return { success: false, error: `Database error: ${checkError.message}` }
    }
    
    const profileToSave = {
      ...profileData,
      linkedin_url: normalizedLinkedIn,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }
    
    let result
    
    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(profileToSave)
        .eq('id', existingProfiles[0].id)
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
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gt('expires_at', new Date().toISOString()) // Only get non-expired profiles
    
    // Apply filters
    if (filters.workModes && filters.workModes.length > 0) {
      query = query.overlaps('work_modes', filters.workModes)
    }
    
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    
    if (filters.country) {
      query = query.ilike('country', `%${filters.country}%`)
    }
    
    if (filters.skills && filters.skills.length > 0) {
      // For skills, we need to check if ALL skills are present (AND logic)
      for (const skill of filters.skills) {
        query = query.contains('core_skills', [skill])
      }
    }
    
    if (filters.search) {
      const searchTerm = `%${filters.search}%`
      query = query.or(`name.ilike.${searchTerm},surname.ilike.${searchTerm},job_title.ilike.${searchTerm},about_me.ilike.${searchTerm}`)
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
