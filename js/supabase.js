// ============================================
// إعدادات Supabase (المفتاح العام فقط)
// ============================================
const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eq_PjuSiAbWvxNAD6QHThw_v_x-jVSI';

// تهيئة عميل Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});

window.supabase = supabaseClient;
console.log('✅ Supabase client initialized with anon key');
