/**
 * ============================================
 * UTILS.JS - الدوال المساعدة العامة
 * تعليمي - منصة التعلم التفاعلي
 * الإصدار: 1.0.0
 * ============================================
 */

class Utils {
    /**
     * تنسيق الوقت (ثواني إلى HH:MM:SS)
     */
    static formatTime(seconds) {
        if (!seconds || seconds < 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * تنسيق التاريخ
     */
    static formatDate(date, format = 'short') {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diff / (1000 * 60));
        
        if (format === 'relative') {
            if (diffMinutes < 1) return 'الآن';
            if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
            if (diffHours < 24) return `منذ ${diffHours} ساعة`;
            if (diffDays === 1) return 'أمس';
            if (diffDays < 7) return `منذ ${diffDays} أيام`;
            if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
            if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
            return `منذ ${Math.floor(diffDays / 365)} سنوات`;
        }
        
        const options = {
            year: 'numeric',
            month: format === 'short' ? 'numeric' : 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return d.toLocaleDateString('ar-SA', options);
    }

    /**
     * تقطيع النص
     */
    static truncate(text, length = 100) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    /**
     * إنشاء Slug من النص
     */
    static slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    /**
     * إنشاء كود عشوائي
     */
    static generateCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return code;
    }

    /**
     * إنشاء معرف فريد
     */
    static generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * التحقق من البريد الإلكتروني
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * التحقق من كلمة المرور
     */
    static validatePassword(password) {
        return password && password.length >= 6;
    }

    /**
     * التحقق من رابط يوتيوب
     */
    static validateYouTubeUrl(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/shorts\/)([^?]+)/
        ];
        
        return patterns.some(pattern => pattern.test(url));
    }

    /**
     * استخراج معرف يوتيوب
     */
    static extractYouTubeId(url) {
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
    }

    /**
     * حفظ في التخزين المحلي
     */
    static setStorage(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(`ta3lemi_${key}`, serialized);
            return true;
        } catch (error) {
            console.error('Set storage error:', error);
            return false;
        }
    }

    /**
     * جلب من التخزين المحلي
     */
    static getStorage(key) {
        try {
            const serialized = localStorage.getItem(`ta3lemi_${key}`);
            if (serialized === null) return null;
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Get storage error:', error);
            return null;
        }
    }

    /**
     * حذف من التخزين المحلي
     */
    static removeStorage(key) {
        try {
            localStorage.removeItem(`ta3lemi_${key}`);
            return true;
        } catch (error) {
            console.error('Remove storage error:', error);
            return false;
        }
    }

    /**
     * تحميل ملف
     */
    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * نسخ إلى الحافظة
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    }

    /**
     * تحويل حجم الملف
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * إنشاء عنصر HTML
     */
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on')) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    /**
     * التمرير السلس
     */
    static smoothScroll(element, offset = 0) {
        const target = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
        
        if (!target) return;
        
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset + offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * منع الأحداث الافتراضية
     */
    static preventDefault(e) {
        e.preventDefault();
        return false;
    }

    /**
     * إضافة مستمع حدث آمن
     */
    static addSafeEventListener(element, event, handler, options = {}) {
        if (!element) return null;
        
        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`Event handler error (${event}):`, error);
            }
        };
        
        element.addEventListener(event, wrappedHandler, options);
        
        return () => element.removeEventListener(event, wrappedHandler, options);
    }

    /**
     * تأخير تنفيذ دالة
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * تحديد معدل تنفيذ دالة
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * الحصول على معلمات URL
     */
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        
        for (const [key, value] of params) {
            result[key] = value;
        }
        
        return result;
    }

    /**
     * تحديث معلمات URL
     */
    static updateUrlParams(params, replace = true) {
        const url = new URL(window.location.href);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value.toString());
            }
        });
        
        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }

    /**
     * التحقق من دعم الميزات
     */
    static isFeatureSupported(feature) {
        switch (feature) {
            case 'webp':
                const canvas = document.createElement('canvas');
                return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            case 'webgl':
                try {
                    const canvas = document.createElement('canvas');
                    return !!window.WebGLRenderingContext && 
                        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch (e) {
                    return false;
                }
            case 'serviceWorker':
                return 'serviceWorker' in navigator;
            case 'share':
                return !!navigator.share;
            case 'clipboard':
                return !!navigator.clipboard;
            default:
                return true;
        }
    }

    /**
     * إضافة أيقونة للصفحة
     */
    static setFavicon(url) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
    }

    /**
     * تحديث عنوان الصفحة
     */
    static setPageTitle(title) {
        document.title = title ? `${title} - تعليمي` : 'تعليمي - منصة التعلم التفاعلي';
    }
}

// تصدير للاستخدام العام
window.Utils = Utils;

export default Utils;