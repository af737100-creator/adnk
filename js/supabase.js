// إعدادات Supabase (استبدل القيم بمفاتيح مشروعك)
const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HnNvDq3tgZa1GBODyM8FxA_Z2mMyqDF';

// تهيئة عميل Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});

// تخزين في المتغير العام
window.supabaseClient = supabaseClient;

console.log('✅ Supabase client initialized');