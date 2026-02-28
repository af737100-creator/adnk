function showNotification(message, type = 'info') {
    alert(message);
}

window.extractYouTubeId = (url) => YouTubeAPI.extractVideoId(url);
window.formatTime = (seconds) => YouTubeAPI.formatTime(seconds);
window.showNotification = showNotification;