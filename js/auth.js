// نظام المصادقة
const auth = {
    // تسجيل الدخول
    async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email, password
            });
            if (error) throw error;
            
            localStorage.setItem('ta3lemi_user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // إنشاء حساب جديد
    async signUp(email, password, fullName) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email, password,
                options: {
                    data: { full_name: fullName }
                }
            });
            if (error) throw error;
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    },

    // تسجيل الخروج
    async signOut() {
        try {
            await supabaseClient.auth.signOut();
            localStorage.removeItem('ta3lemi_user');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        const userStr = localStorage.getItem('ta3lemi_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch { return null; }
        }
        return null;
    },

    // التحقق من حالة المصادقة
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // طلب المصادقة للصفحات المحمية
    async requireAuth(redirectUrl = '/') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    // إظهار إشعار
    showNotification(message, type = 'info') {
        alert(message);
    }
};

window.auth = auth;
console.log('✅ Auth system ready');