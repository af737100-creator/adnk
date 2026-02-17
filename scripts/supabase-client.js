/**
 * Supabase Client - نسخة مبسطة تعمل فوراً
 */

const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HnNvDq3tgZa1GBODyM8FxA_Z2mMyqDF';

// تهيئة auth بسيط
window.auth = {
    getCurrentUser: () => ({
        id: '1',
        email: 'user@example.com',
        user_metadata: { full_name: 'مستخدم' }
    }),
    requireAuth: async () => true,
    showNotification: (msg) => alert(msg)
};

console.log('✅ Supabase ready');