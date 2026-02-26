// إدارة فيديوهات يوتيوب والتفاعلات
const YouTubeManager = {
    // استخراج معرف الفيديو من الرابط
    extractVideoId(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/,
            /(?:youtube\.com\/shorts\/)([^?]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    },

    // التحقق من صحة الرابط
    isValidYouTubeUrl(url) {
        return this.extractVideoId(url) !== null;
    },

    // إنشاء iframe للمشغل
    createPlayerUrl(videoId) {
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
    },

    // تخزين التفاعلات مؤقتاً (سيتم حفظها في Supabase لاحقاً)
    interactions: [],

    // إضافة تفاعل جديد
    addInteraction(interaction) {
        this.interactions.push({
            id: Date.now(),
            ...interaction
        });
        return this.interactions;
    },

    // حذف تفاعل
    deleteInteraction(id) {
        this.interactions = this.interactions.filter(i => i.id !== id);
        return this.interactions;
    },

    // تحديث تفاعل
    updateInteraction(id, newData) {
        const index = this.interactions.findIndex(i => i.id === id);
        if (index !== -1) {
            this.interactions[index] = { ...this.interactions[index], ...newData };
        }
        return this.interactions;
    }
};

window.YouTubeManager = YouTubeManager;