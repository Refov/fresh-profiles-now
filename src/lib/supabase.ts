import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  name: string
  surname: string
  job_title: string
  work_modes: string[]
  city: string
  country: string
  about_me: string
  linkedin_url: string
  core_skills: string[]
  created_at: string
  expires_at: string
}
