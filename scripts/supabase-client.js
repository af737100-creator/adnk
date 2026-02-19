/**
 * Supabase Client - الإصدار النهائي
 * يعمل في جميع البيئات مع معالجة الأخطاء
 */

// ============================================
// إعدادات Supabase (من dashboard)
// ============================================
const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HnNvDq3tgZa1GBODyM8FxA_Z2mMyqDF';

// تحديد المسار الأساسي حسب البيئة (مهم جداً)
const BASE_PATH = (function() {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io')) return '/adnk';
    return '';
})();

console.log('🌐 البيئة:', window.location.hostname);
console.log('📁 المسار الأساسي:', BASE_PATH);

// ============================================
// تهيئة Supabase مع معالجة الأخطاء
// ============================================
let supabaseClient = null;

try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: localStorage
            }
        });
        console.log('✅ Supabase connected');
    } else {
        console.warn('⚠️ Supabase library not loaded');
    }
} catch (error) {
    console.error('❌ Supabase error:', error);
}

// ============================================
// نظام المصادقة المتكامل
// ============================================
window.auth = {
    // تسجيل الدخول
    signIn: async function(email, password) {
        try {
            if (!supabaseClient) {
                alert('⚠️ وضع التجربة: تم تسجيل الدخول بنجاح');
                localStorage.setItem('ta3lemi_user', JSON.stringify({
                    id: 'demo',
                    email: email,
                    user_metadata: { full_name: 'مستخدم تجريبي' }
                }));
                window.location.href = BASE_PATH + '/pages/dashboard.html';
                return { success: true };
            }

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email, password
            });

            if (error) throw error;

            localStorage.setItem('ta3lemi_user', JSON.stringify(data.user));
            window.location.href = BASE_PATH + '/pages/dashboard.html';
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            alert('❌ فشل تسجيل الدخول: ' + error.message);
            return { success: false, error: error.message };
        }
    },

    // إنشاء حساب جديد
    signUp: async function(email, password, fullName) {
        try {
            if (!supabaseClient) {
                alert('✅ تم إنشاء الحساب بنجاح (وضع التجربة)');
                window.location.href = BASE_PATH + '/pages/dashboard.html?signup=true';
                return { success: true };
            }

            const { data, error } = await supabaseClient.auth.signUp({
                email, password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (error) throw error;

            alert('✅ تم إنشاء الحساب بنجاح! يرجى تفعيل بريدك الإلكتروني');
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            alert('❌ فشل إنشاء الحساب: ' + error.message);
            return { success: false, error: error.message };
        }
    },

    // تسجيل الخروج
    signOut: async function() {
        try {
            if (supabaseClient) {
                await supabaseClient.auth.signOut();
            }
            localStorage.removeItem('ta3lemi_user');
            window.location.href = BASE_PATH + '/';
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // الحصول على المستخدم الحالي
    getCurrentUser: function() {
        try {
            const userStr = localStorage.getItem('ta3lemi_user');
            if (userStr) return JSON.parse(userStr);
        } catch (e) {}
        return null;
    },

    // التحقق من المصادقة للصفحات المحمية
    requireAuth: async function() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = BASE_PATH + '/';
            return false;
        }
        return true;
    },

    // الحصول على الأحرف الأولى من الاسم
    getInitials: function(name) {
        if (!name) return 'م';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0);
        return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase();
    },

    // إظهار إشعار
    showNotification: function(message, type = 'info') {
        alert(message);
    }
};

// ============================================
// نظام التنقل المتكامل (يحل مشكلة اختفاء الصفحات)
// ============================================
window.navigateTo = function(page) {
    const paths = {
        'dashboard': '/pages/dashboard.html',
        'signup': '/pages/dashboard.html?signup=true',
        'create-course': '/pages/create-course.html',
        'settings': '/pages/settings.html',
        'home': '/'
    };

    const path = paths[page];
    if (path) {
        window.location.href = BASE_PATH + path;
    }
};

// دوال مختصرة للاستخدام
window.goToDashboard = () => navigateTo('dashboard');
window.goToSignup = () => navigateTo('signup');
window.goToCreateCourse = () => navigateTo('create-course');
window.goToSettings = () => navigateTo('settings');
window.goHome = () => navigateTo('home');

// ============================================
// YouTube API المبسط (بدون مفتاح)
// ============================================
window.YouTubeAPI = {
    extractVideoId: function(url) {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/);
        return match ? match[1] : null;
    },

    handleYouTubeUrlInput: function(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            return { success: false, message: '❌ رابط يوتيوب غير صالح' };
        }
        return {
            success: true,
            videoId: videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`
        };
    },

    formatDuration: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

// ============================================
// أدوات مساعدة
// ============================================
window.Utils = {
    formatDate: function(date) {
        try {
            return new Date(date).toLocaleDateString('ar-SA');
        } catch {
            return date;
        }
    },

    truncate: function(text, length = 100) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
};

console.log('✅ جميع الأنظمة جاهزة للعمل');