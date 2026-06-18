import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or localStorage fallback
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('CF_SUPABASE_URL') || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CF_SUPABASE_ANON_KEY') || '';

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
  }
}

export { supabase, isConfigured };

/**
 * Saves Supabase credentials to localStorage and reloads the application.
 * @param {string} url 
 * @param {string} key 
 */
export function saveSupabaseConfig(url, key) {
  if (!url || !key) return false;
  localStorage.setItem('CF_SUPABASE_URL', url.trim());
  localStorage.setItem('CF_SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
  return true;
}

/**
 * Clears Supabase credentials and reloads the application.
 */
export function clearSupabaseConfig() {
  localStorage.removeItem('CF_SUPABASE_URL');
  localStorage.removeItem('CF_SUPABASE_ANON_KEY');
  window.location.reload();
}
