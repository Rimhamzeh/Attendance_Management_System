import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://sxcuyynhcyacfctjzpda.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Y3V5eW5oY3lhY2ZjdGp6cGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjI3NDIsImV4cCI6MjA2NjMzODc0Mn0.bHdHm6SfgdFgU7PF7TvOmGNB5P3xB9R7IQtv-1lv7FI'
export const supabase = createClient(supabaseUrl, supabaseKey);
 