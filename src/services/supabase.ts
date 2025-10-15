import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sử dụng cùng URL và key từ dự án web
const supabaseUrl = 'https://zrfapzaksiindhlqkkky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZmFwemFrc2lpbmRobHFra2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzU4NjEsImV4cCI6MjA3MDExMTg2MX0.7pDlJ4tVdyoMh5PwajFrNQmBlnhzBnh4ktRZ-kKZfEo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});