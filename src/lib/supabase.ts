import { createClient } from '@supabase/supabase-js'

// Hardcoded values to ensure they work in production
const supabaseUrl = 'https://icvvtqwiqudvvrlcsjyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdnZ0cXdpcXVkdnZybGNzanl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDA5MjYsImV4cCI6MjA3NjI3NjkyNn0.-yzuypLTvUT84xgJq4FaVbdxcXqR20u7cCgwLajhDtc'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing')

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
