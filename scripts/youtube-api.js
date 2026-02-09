// إدارة YouTube API
const YOUTUBE_API_KEY = 'AIzaSyCh9scasVWUK4AktfSUE5NlCcMyvCmGs2o';

// استخراج معرف الفيديو من رابط يوتيوب
function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtube\.com\/embed\/)([^?]+)/,
        /(?:youtube\.com\/v\/)([^?]+)/,
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

// جلب معلومات الفيديو من YouTube API
async function getVideoInfo(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            return {
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.standard || 
                          video.snippet.thumbnails.high ||
                          video.snippet.thumbnails.medium,
                channelTitle: video.snippet.channelTitle,
                publishedAt: video.snippet.publishedAt,
                duration: parseDuration(video.contentDetails.duration)
            };
        }
        
        return null;
    } catch (error) {
        console.error('خطأ في جلب معلومات الفيديو:', error);
        return null;
    }
}

// تحويل مدة الفيديو من ISO 8601 إلى ثواني
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (match[1]) hours = parseInt(match[1]);
    if (match[2]) minutes = parseInt(match[2]);
    if (match[3]) seconds = parseInt(match[3]);
    
    return hours * 3600 + minutes * 60 + seconds;
}

// تنسيق المدة إلى ساعة:دقيقة:ثانية
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// إنشاء iframe لمشغل يوتيوب
function createYouTubePlayer(videoId, options = {}) {
    const defaultOptions = {
        width: '100%',
        height: '100%',
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1,
        iv_load_policy: 3
    };
    
    const playerOptions = { ...defaultOptions, ...options };
    
    const params = new URLSearchParams(playerOptions).toString();
    const iframe = document.createElement('iframe');
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?${params}`;
    iframe.width = playerOptions.width;
    iframe.height = playerOptions.height;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = 'YouTube video player';
    
    return iframe;
}

// التحقق من توفر الفيديو
async function checkVideoAvailability(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const status = data.items[0].status;
            return {
                available: status.embeddable && status.privacyStatus === 'public',
                privacyStatus: status.privacyStatus,
                embeddable: status.embeddable
            };
        }
        
        return { available: false };
    } catch (error) {
        console.error('خطأ في التحقق من توفر الفيديو:', error);
        return { available: false };
    }
}

// جلب الفيديوهات المشابهة
async function getRelatedVideos(videoId, maxResults = 5) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&relatedToVideoId=${videoId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.items) {
            return data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt
            }));
        }
        
        return [];
    } catch (error) {
        console.error('خطأ في جلب الفيديوهات المشابهة:', error);
        return [];
    }
}

// البحث عن فيديوهات تعليمية
async function searchEducationalVideos(query, maxResults = 10) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query + ' تعليمي')}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.items) {
            return data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                description: item.snippet.description
            }));
        }
        
        return [];
    } catch (error) {
        console.error('خطأ في البحث عن الفيديوهات:', error);
        return [];
    }
}

// معالج استخراج الرابط
function handleYouTubeUrlInput(url) {
    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
        return {
            success: false,
            message: 'رابط يوتيوب غير صالح. الرجاء التأكد من الرابط.'
        };
    }
    
    return {
        success: true,
        videoId: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
}

// تحديث معلومات الفيديو في الواجهة
async function updateVideoInfoInUI(videoId) {
    const videoInfo = await getVideoInfo(videoId);
    
    if (videoInfo) {
        // تحديث العنوان
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = videoInfo.title;
        }
        
        // تحديث الوصف
        const descriptionElement = document.getElementById('video-description');
        if (descriptionElement) {
            descriptionElement.textContent = videoInfo.description || 'لا يوجد وصف';
        }
        
        // تحديث المدة
        const durationElement = document.getElementById('video-duration');
        if (durationElement) {
            durationElement.textContent = formatDuration(videoInfo.duration);
        }
        
        // تحديث القناة
        const channelElement = document.getElementById('video-channel');
        if (channelElement) {
            channelElement.textContent = videoInfo.channelTitle;
        }
        
        return videoInfo;
    }
    
    return null;
}

// إنشاء مشغل يوتيوب تفاعلي
function createInteractiveYouTubePlayer(videoId, interactions = []) {
    const container = document.createElement('div');
    container.className = 'video-interactive-container';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    
    const iframe = createYouTubePlayer(videoId, {
        enablejsapi: 1,
        origin: window.location.origin
    });
    
    wrapper.appendChild(iframe);
    container.appendChild(wrapper);
    
    // إضافة طبقة التفاعل
    if (interactions.length > 0) {
        const overlay = createInteractionOverlay(interactions, iframe);
        wrapper.appendChild(overlay);
    }
    
    return {
        container: container,
        iframe: iframe,
        wrapper: wrapper
    };
}

// إنشاء طبقة التفاعل
function createInteractionOverlay(interactions, iframe) {
    const overlay = document.createElement('div');
    overlay.className = 'interactive-overlay';
    
    interactions.forEach(interaction => {
        const point = document.createElement('div');
        point.className = 'interaction-point';
        point.dataset.time = interaction.time;
        point.dataset.type = interaction.type;
        point.dataset.id = interaction.id;
        
        // حساب الموضع
        const positionPercent = (interaction.time / interaction.videoDuration) * 100;
        point.style.top = '50%';
        point.style.right = `${positionPercent}%`;
        
        // إضافة الأيقونة المناسبة
        let icon = 'fa-question-circle';
        if (interaction.type === 'quiz') icon = 'fa-clipboard-check';
        if (interaction.type === 'explanation') icon = 'fa-lightbulb';
        if (interaction.type === 'note') icon = 'fa-sticky-note';
        
        point.innerHTML = `<i class="fas ${icon}"></i>`;
        
        // إضافة نافذة معلومات عند التمرير
        const tooltip = document.createElement('div');
        tooltip.className = 'interaction-tooltip';
        tooltip.textContent = interaction.title || interaction.type;
        point.appendChild(tooltip);
        
        // حدث النقر
        point.addEventListener('click', function(e) {
            e.stopPropagation();
            handleInteractionClick(interaction, iframe);
        });
        
        overlay.appendChild(point);
    });
    
    return overlay;
}

// معالجة النقر على التفاعل
function handleInteractionClick(interaction, iframe) {
    // إيقاف الفيديو مؤقتًا
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    
    // عرض التفاعل المناسب
    switch (interaction.type) {
        case 'question':
            showQuestionInteraction(interaction);
            break;
        case 'quiz':
            showQuizInteraction(interaction);
            break;
        case 'explanation':
            showExplanationInteraction(interaction);
            break;
        case 'note':
            showNoteInteraction(interaction);
            break;
    }
}

// تصدير الوظائف
window.YouTubeAPI = {
    extractYouTubeVideoId,
    getVideoInfo,
    formatDuration,
    createYouTubePlayer,
    checkVideoAvailability,
    getRelatedVideos,
    searchEducationalVideos,
    handleYouTubeUrlInput,
    updateVideoInfoInUI,
    createInteractiveYouTubePlayer
};