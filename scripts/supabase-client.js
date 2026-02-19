/**
 * Supabase Client - نسخة بسيطة تعمل في كل مكان
 */

// ============================================
// التحقق من البيئة
// ============================================
console.log('🚀 بدء تحميل النظام...');

// تحديد المسار الأساسي للموقع
const BASE_PATH = window.location.hostname.includes('github.io') ? '/adnk' : '';

// ============================================
// نظام auth بسيط (يعمل بدون إنترنت)
// ============================================
window.auth = {
    // الحصول على المستخدم الحالي
    getCurrentUser: function() {
        try {
            const userStr = localStorage.getItem('ta3lemi_user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (e) {
            console.warn('⚠️ خطأ في قراءة المستخدم:', e);
        }
        
        // بيانات افتراضية للتجربة
        return {
            id: '1',
            email: 'demo@ta3lemi.com',
            user_metadata: {
                full_name: 'مستخدم تجريبي'
            }
        };
    },
    
    // التحقق من المصادقة
    isAuthenticated: function() {
        return true; // دائماً true للتجربة
    },
    
    // طلب المصادقة (دائماً يسمح)
    requireAuth: async function() {
        console.log('✅ تم التحقق من المصادقة');
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
    showNotification: function(message, type) {
        console.log(`[${type}] ${message}`);
        alert(message); // بسيط ومضمون
    },
    
    // تسجيل الخروج
    signOut: function() {
        localStorage.removeItem('ta3lemi_user');
        window.location.href = BASE_PATH + '/';
        return Promise.resolve({ success: true });
    }
};

// ============================================
// YouTube API بسيط
// ============================================
window.YouTubeAPI = {
    // استخراج معرف الفيديو من رابط يوتيوب
    extractVideoId: function(url) {
        if (!url) return null;
        
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/shorts\/)([^?]+)/
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
            return { 
                success: false, 
                message: '❌ رابط يوتيوب غير صالح' 
            };
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
        if (!seconds) return '0:00';
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
    formatDate: function(date, format = 'short') {
        try {
            const d = new Date(date);
            return d.toLocaleDateString('ar-SA');
        } catch {
            return date;
        }
    },
    
    // تقطيع النص
    truncate: function(text, length = 100) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    // نسخ النص إلى الحافظة
    copyToClipboard: async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // طريقة بديلة
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    },
    
    // توليد كود عشوائي
    generateCode: function(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
};

// ============================================
// نظام التنقل (مهم جداً)
// ============================================
window.Navigation = {
    // الذهاب إلى لوحة التحكم
    goToDashboard: function() {
        const basePath = window.location.hostname.includes('github.io') ? '/adnk' : '';
        window.location.href = basePath + '/pages/dashboard.html';
    },
    
    // الذهاب إلى صفحة إنشاء حساب
    goToSignup: function() {
        const basePath = window.location.hostname.includes('github.io') ? '/adnk' : '';
        window.location.href = basePath + '/pages/dashboard.html?signup=true';
    },
    
    // الذهاب إلى إنشاء درس
    goToCreateCourse: function() {
        const basePath = window.location.hostname.includes('github.io') ? '/adnk' : '';
        window.location.href = basePath + '/pages/create-course.html';
    },
    
    // الذهاب إلى الإعدادات
    goToSettings: function() {
        const basePath = window.location.hostname.includes('github.io') ? '/adnk' : '';
        window.location.href = basePath + '/pages/settings.html';
    },
    
    // العودة للصفحة الرئيسية
    goHome: function() {
        const basePath = window.location.hostname.includes('github.io') ? '/adnk' : '';
        window.location.href = basePath + '/';
    }
};

// ============================================
// دوال مختصرة للاستخدام السريع
// ============================================
window.goToDashboard = Navigation.goToDashboard;
window.goToSignup = Navigation.goToSignup;
window.goToCreateCourse = Navigation.goToCreateCourse;
window.goToSettings = Navigation.goToSettings;
window.goHome = Navigation.goHome;

// ============================================
// التحقق من التحميل
// ============================================
console.log('✅ جميع الأنظمة جاهزة للعمل');
console.log('🌐 البيئة:', window.location.hostname);
console.log('📁 المسار الأساسي:', window.location.hostname.includes('github.io') ? '/adnk' : '/');