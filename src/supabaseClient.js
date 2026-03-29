import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gchuigbsmfufhszuelzx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaHVpZ2JzbWZ1ZmhzenVlbHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDc2ODAsImV4cCI6MjA5MDI4MzY4MH0.3yE8gpHKbdB9Qaxta8Je_3ue-lVV4BKa3P9pe9Py2ic'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
