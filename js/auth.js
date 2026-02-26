// ============================================
// نظام المصادقة باستخدام Supabase
// ============================================
const auth = {
    // تسجيل الدخول
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email, password
            });
            if (error) throw error;
            
            // جلب معلومات إضافية من جدول profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            return { success: true, user: { ...data.user, profile } };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // إنشاء حساب جديد
    async signUp(email, password, fullName, role = 'student') {
        try {
            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: {
                    data: { full_name: fullName, role }
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
        await supabase.auth.signOut();
        window.location.href = '/';
    },

    // الحصول على المستخدم الحالي
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        return { ...user, profile };
    },

    // التحقق من المصادقة وإعادة التوجيه
    async requireAuth(redirectTo = '/') {
        const user = await this.getCurrentUser();
        if (!user) {
            window.location.href = redirectTo;
            return null;
        }
        return user;
    },

    // التحقق من دور المستخدم
    async requireRole(role, redirectTo = '/') {
        const user = await this.getCurrentUser();
        if (!user || user.profile?.role !== role) {
            window.location.href = redirectTo;
            return null;
        }
        return user;
    }
};

window.auth = auth;