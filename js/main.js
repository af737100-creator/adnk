// ============================================
// دوال مساعدة عامة
// ============================================
function showNotification(message, type = 'info') {
    alert(message); // يمكن استبدالها بنظام إشعارات متطور
}

// استخراج معرف فيديو يوتيوب (تستخدم دالة YouTubeAPI)
window.extractYouTubeId = (url) => YouTubeAPI.extractVideoId(url);
window.formatTime = (seconds) => YouTubeAPI.formatTime(seconds);

window.showNotification = showNotification;