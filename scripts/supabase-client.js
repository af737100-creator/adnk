// نظام مبسط يعمل في كل مكان
window.auth = {
    getCurrentUser: () => ({
        id: '1',
        email: 'user@example.com',
        user_metadata: { full_name: 'مستخدم' }
    }),
    requireAuth: async () => true,
    showNotification: (msg) => alert(msg)
};

console.log('✅ النظام جاهز');