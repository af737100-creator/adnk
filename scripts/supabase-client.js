/**
 * Supabase Client Configuration
 * تعليمي - منصة التعلم التفاعلي
 */

// Supabase Configuration
const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HnNvDq3tgZa1GBODyM8FxA_Z2mMyqDF';

// التحقق من وجود مكتبة Supabase
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
    // محاولة تحميل المكتبة إذا لم تكن موجودة
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);
    
    // انتظر تحميل المكتبة
    script.onload = function() {
        console.log('✅ Supabase library loaded dynamically');
        initSupabase();
    };
} else {
    initSupabase();
}

function initSupabase() {
    // تهيئة عميل Supabase
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    });
    
    console.log('✅ Supabase client initialized');
    
    // اختبار الاتصال
    testConnection();
}

async function testConnection() {
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.warn('⚠️ Supabase connection test warning:', error.message);
        } else {
            console.log('✅ Supabase connection successful');
        }
    } catch (e) {
        console.warn('⚠️ Supabase connection test failed:', e.message);
    }
}

/**
 * ============================================
 * AUTHENTICATION FUNCTIONS
 * ============================================
 */

window.auth = {
    // تسجيل الدخول
    async signIn(email, password) {
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            // حفظ المستخدم في localStorage
            if (data.user) {
                localStorage.setItem('ta3lemi_user', JSON.stringify({
                    id: data.user.id,
                    email: data.user.email,
                    user_metadata: data.user.user_metadata
                }));
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // إنشاء حساب جديد
    async signUp(email, password, fullName, role = 'teacher') {
        try {
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // تسجيل الخروج
    async signOut() {
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
            
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
            } catch {
                return null;
            }
        }
        return null;
    },
    
    // التحقق من المصادقة
    isAuthenticated() {
        return !!this.getCurrentUser();
    },
    
    // طلب المصادقة للصفحات المحمية
    async requireAuth(redirectUrl = '../index.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // الحصول على الأحرف الأولى من الاسم
    getInitials(name) {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },
    
    // إظهار إشعار
    showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }
};

/**
 * ============================================
 * YOUTUBE API FUNCTIONS
 * ============================================
 */

window.YouTubeAPI = {
    API_KEY: 'AIzaSyCh9scasVWUK4AktfSUE5NlCcMyvCmGs2o',
    
    // استخراج معرف الفيديو من الرابط
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/,
            /(?:youtu\.be\/)([^?]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    },
    
    // جلب معلومات الفيديو
    async getVideoInfo(videoId) {
        // محاكاة الاستجابة (بدون الحاجة لمفتاح API حقيقي للتجربة)
        return {
            title: 'فيديو تجريبي',
            thumbnail: { url: `https://img.youtube.com/vi/${videoId}/0.jpg` },
            channelTitle: 'قناة تجريبية',
            duration: 600
        };
    },
    
    // تنسيق الوقت
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // معالجة رابط يوتيوب
    handleYouTubeUrlInput(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            return { success: false, message: 'رابط يوتيوب غير صالح' };
        }
        return {
            success: true,
            videoId: videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`
        };
    }
};

console.log('✅ All modules loaded successfully');