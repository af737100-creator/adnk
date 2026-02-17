/**
 * Supabase Client Configuration - نسخة مبسطة ومضمونة
 * تعليمي - منصة التعلم التفاعلي
 */

// ============================================
// التهيئة الأساسية
// ============================================
const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HnNvDq3tgZa1GBODyM8FxA_Z2mMyqDF';

// التحقق من وجود مكتبة Supabase
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
    // محاولة تحميل المكتبة ديناميكياً
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);
    
    script.onload = function() {
        console.log('✅ Supabase library loaded');
        initSupabase();
    };
} else {
    initSupabase();
}

function initSupabase() {
    try {
        // تهيئة عميل Supabase
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: localStorage
            }
        });
        console.log('✅ Supabase client initialized');
    } catch (e) {
        console.error('❌ Supabase init error:', e);
    }
}

// ============================================
// نظام المصادقة المبسط (يعمل بدون إنترنت)
// ============================================
window.auth = {
    // الحصول على المستخدم من localStorage
    getCurrentUser: function() {
        try {
            const userStr = localStorage.getItem('ta3lemi_user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (e) {
            console.warn('Error parsing user:', e);
        }
        
        // بيانات افتراضية للتجربة
        return {
            id: '1',
            email: 'teacher@example.com',
            user_metadata: {
                full_name: 'محمد أحمد'
            }
        };
    },
    
    // التحقق من المصادقة
    isAuthenticated: function() {
        return true; // دائمًا true للتجربة
    },
    
    // طلب المصادقة للصفحات المحمية
    requireAuth: async function(redirectUrl) {
        return true; // دائمًا يسمح بالدخول
    },
    
    // الحصول على الأحرف الأولى من الاسم
    getInitials: function(name) {
        if (!name) return 'م';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0);
        return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase();
    },
    
    // إظهار إشعار
    showNotification: function(message, type) {
        console.log(`[${type}] ${message}`);
        alert(message); // بسيط ومضمون
    },
    
    // تسجيل الخروج
    signOut: function() {
        localStorage.removeItem('ta3lemi_user');
        window.location.href = '/adnk/';
        return Promise.resolve({ success: true });
    }
};

// ============================================
// YouTube API المبسط
// ============================================
window.YouTubeAPI = {
    // استخراج معرف الفيديو
    extractVideoId: function(url) {
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
    
    // معالجة رابط يوتيوب
    handleYouTubeUrlInput: function(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            return { success: false, message: 'رابط غير صالح' };
        }
        return {
            success: true,
            videoId: videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`
        };
    },
    
    // تنسيق الوقت
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
    // تنسيق التاريخ
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('ar-SA');
    },
    
    // تقطيع النص
    truncate: function(text, length) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
};

console.log('✅ All modules loaded successfully!');