import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jumyzhwyhvtgabwmnyjp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bXl6aHd5aHZ0Z2Fid21ueWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjYxMTgsImV4cCI6MjA2NzE0MjExOH0.4EMmxFVFtvGjlFxSMoaBd9Y5esGzGezhRCxm8iv-om8'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper function to check if user is authenticated
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth check error:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users_fyngan2024')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
};

export default supabase;