import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgflagatmmdywskfwrbc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_uYoXgj4FAzef9mwhQbtT3g_1n7lZ5Fr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
