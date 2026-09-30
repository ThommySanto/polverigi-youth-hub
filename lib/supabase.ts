import { createClient } from '@supabase/supabase-js'

// Incolla qui direttamente i dati presi dalla tua dashboard di Supabase
const supabaseUrl = 'https://omegwgwyfyvzutzngdlx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZWd3Z3d5Znl2enV0em5nZGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTM1MjksImV4cCI6MjEwNjMyOTUyOX0.yPdFxVx_yvZmj9aiLlUZ1_p6Zy0cFowxAOpBrPIwXOA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)