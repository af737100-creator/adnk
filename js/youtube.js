const YOUTUBE_API_KEY = 'AIzaSyCh9scasVWUK4AktfSUE5NlCcMyvCmGs2o';

const YouTubeAPI = {
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    },

    async getVideoInfo(videoId) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
            );
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                return {
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    duration: this.parseDuration(item.contentDetails.duration)
                };
            }
            return null;
        } catch (error) {
            console.error('YouTube API error:', error);
            return null;
        }
    },

    parseDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] ? parseInt(match[1]) : 0);
        const minutes = (match[2] ? parseInt(match[2]) : 0);
        const seconds = (match[3] ? parseInt(match[3]) : 0);
        return hours * 3600 + minutes * 60 + seconds;
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

window.YouTubeAPI = YouTubeAPI;