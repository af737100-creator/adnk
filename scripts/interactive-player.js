// مشغل الفيديو التفاعلي

class InteractiveVideoPlayer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            videoId: null,
            interactions: [],
            autoplay: false,
            controls: true,
            showProgress: true,
            ...options
        };
        
        this.player = null;
        this.interactions = [];
        this.currentTime = 0;
        this.isPlaying = false;
        this.completedInteractions = new Set();
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('الحاوية غير موجودة');
            return;
        }
        
        this.createPlayer();
        this.createControls();
        this.loadInteractions();
        this.setupEventListeners();
    }
    
    createPlayer() {
        // إنشاء عنصر الفيديو
        this.player = document.createElement('div');
        this.player.className = 'interactive-video-player';
        
        if (this.options.videoId) {
            const iframe = YouTubeAPI.createYouTubePlayer(this.options.videoId, {
                enablejsapi: 1,
                origin: window.location.origin
            });
            
            iframe.id = 'youtube-player';
            this.player.appendChild(iframe);
        }
        
        this.container.appendChild(this.player);
    }
    
    createControls() {
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        
        controls.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <div class="interaction-markers"></div>
                </div>
                <div class="time-display">
                    <span class="current-time">0:00</span>
                    <span class="duration">0:00</span>
                </div>
            </div>
            <div class="control-buttons">
                <button class="control-btn play-pause">
                    <i class="fas fa-play"></i>
                </button>
                <button class="control-btn restart">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="control-btn fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
                <div class="volume-control">
                    <button class="control-btn volume">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <input type="range" class="volume-slider" min="0" max="100" value="100">
                </div>
                <button class="control-btn settings">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        `;
        
        this.container.appendChild(controls);
        this.setupControlEvents();
    }
    
    setupControlEvents() {
        // تشغيل/إيقاف مؤقت
        const playPauseBtn = this.container.querySelector('.play-pause');
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // إعادة التشغيل
        const restartBtn = this.container.querySelector('.restart');
        restartBtn.addEventListener('click', () => this.restartVideo());
        
        // ملء الشاشة
        const fullscreenBtn = this.container.querySelector('.fullscreen');
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // التحكم في الصوت
        const volumeBtn = this.container.querySelector('.volume');
        const volumeSlider = this.container.querySelector('.volume-slider');
        
        volumeBtn.addEventListener('click', () => this.toggleMute());
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // شريط التقدم
        const progressBar = this.container.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => this.seekTo(e));
    }
    
    loadInteractions() {
        if (!this.options.interactions || this.options.interactions.length === 0) {
            return;
        }
        
        this.interactions = this.options.interactions.sort((a, b) => a.time - b.time);
        this.createInteractionMarkers();
    }
    
    createInteractionMarkers() {
        const markersContainer = this.container.querySelector('.interaction-markers');
        markersContainer.innerHTML = '';
        
        this.interactions.forEach(interaction => {
            const marker = document.createElement('div');
            marker.className = 'interaction-marker';
            marker.dataset.id = interaction.id;
            marker.dataset.time = interaction.time;
            
            const positionPercent = (interaction.time / this.options.duration) * 100;
            marker.style.right = `${positionPercent}%`;
            
            // إضافة أداة تلميح
            const tooltip = document.createElement('div');
            tooltip.className = 'marker-tooltip';
            tooltip.textContent = interaction.title || this.getInteractionTypeLabel(interaction.type);
            marker.appendChild(tooltip);
            
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleInteractionClick(interaction);
            });
            
            markersContainer.appendChild(marker);
        });
    }
    
    setupEventListeners() {
        // استماع لرسائل YouTube API
        window.addEventListener('message', (event) => this.handleYouTubeMessage(event));
        
        // تحديث الوقت الحالي
        this.timeUpdateInterval = setInterval(() => {
            this.updateCurrentTime();
            this.checkForInteractions();
        }, 1000);
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    handleYouTubeMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            switch (data.event) {
                case 'infoDelivery':
                    if (data.info && data.info.currentTime) {
                        this.currentTime = data.info.currentTime;
                        this.updateProgressBar();
                    }
                    break;
                    
                case 'onStateChange':
                    this.handlePlayerStateChange(data.info);
                    break;
            }
        } catch (error) {
            // ليس رسالة يوتيوب
        }
    }
    
    handlePlayerStateChange(state) {
        const playPauseBtn = this.container.querySelector('.play-pause i');
        
        switch (state) {
            case 1: // تشغيل
                this.isPlaying = true;
                playPauseBtn.className = 'fas fa-pause';
                break;
                
            case 2: // إيقاف مؤقت
                this.isPlaying = false;
                playPauseBtn.className = 'fas fa-play';
                break;
                
            case 0: // انتهى
                this.isPlaying = false;
                playPauseBtn.className = 'fas fa-play';
                this.showCompletionScreen();
                break;
        }
    }
    
    updateCurrentTime() {
        if (!this.isPlaying) return;
        
        this.currentTime += 1;
        this.updateProgressBar();
    }
    
    updateProgressBar() {
        const currentTimeElement = this.container.querySelector('.current-time');
        const progressFill = this.container.querySelector('.progress-fill');
        
        if (currentTimeElement) {
            currentTimeElement.textContent = this.formatTime(this.currentTime);
        }
        
        if (progressFill && this.options.duration) {
            const progressPercent = (this.currentTime / this.options.duration) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
    }
    
    checkForInteractions() {
        if (!this.isPlaying) return;
        
        // البحث عن تفاعلات في الوقت الحالي
        const upcomingInteractions = this.interactions.filter(interaction => {
            const timeDiff = Math.abs(interaction.time - this.currentTime);
            return !this.completedInteractions.has(interaction.id) && timeDiff <= 1;
        });
        
        upcomingInteractions.forEach(interaction => {
            this.showInteraction(interaction);
            this.completedInteractions.add(interaction.id);
        });
    }
    
    showInteraction(interaction) {
        // إيقاف الفيديو مؤقتًا
        this.pauseVideo();
        
        // إنشاء نافذة التفاعل
        const overlay = this.createInteractionOverlay(interaction);
        this.container.appendChild(overlay);
        
        // إضافة تفاعل إلى السجل
        this.logInteraction(interaction);
    }
    
    createInteractionOverlay(interaction) {
        const overlay = document.createElement('div');
        overlay.className = 'interaction-overlay active';
        overlay.dataset.id = interaction.id;
        
        let content = '';
        
        switch (interaction.type) {
            case 'question':
                content = this.createQuestionContent(interaction);
                break;
                
            case 'quiz':
                content = this.createQuizContent(interaction);
                break;
                
            case 'explanation':
                content = this.createExplanationContent(interaction);
                break;
                
            case 'poll':
                content = this.createPollContent(interaction);
                break;
        }
        
        overlay.innerHTML = `
            <div class="interaction-content">
                <div class="interaction-header">
                    <h3>${interaction.title || this.getInteractionTypeLabel(interaction.type)}</h3>
                    <button class="close-interaction">&times;</button>
                </div>
                <div class="interaction-body">
                    ${content}
                </div>
            </div>
        `;
        
        // إضافة حدث الإغلاق
        const closeBtn = overlay.querySelector('.close-interaction');
        closeBtn.addEventListener('click', () => {
            overlay.remove();
            this.playVideo();
        });
        
        return overlay;
    }
    
    createQuestionContent(interaction) {
        let optionsHtml = '';
        
        if (interaction.options && interaction.options.length > 0) {
            optionsHtml = interaction.options.map((option, index) => `
                <label class="question-option">
                    <input type="radio" name="question-${interaction.id}" value="${index}">
                    <span class="option-text">${option.text}</span>
                </label>
            `).join('');
        }
        
        return `
            <div class="question-content">
                <p>${interaction.content || 'أجب على السؤال التالي:'}</p>
                <div class="question-options">
                    ${optionsHtml}
                </div>
                <button class="submit-answer">إرسال الإجابة</button>
                <div class="answer-feedback" style="display:none;"></div>
            </div>
        `;
    }
    
    createQuizContent(interaction) {
        let questionsHtml = '';
        
        if (interaction.questions && interaction.questions.length > 0) {
            questionsHtml = interaction.questions.map((question, qIndex) => `
                <div class="quiz-question">
                    <h4>${qIndex + 1}. ${question.question}</h4>
                    <div class="question-options">
                        ${question.options.map((option, oIndex) => `
                            <label class="quiz-option">
                                <input type="radio" name="quiz-${interaction.id}-${qIndex}" value="${oIndex}">
                                <span class="option-text">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
        
        return `
            <div class="quiz-content">
                <p>${interaction.description || 'اختبار قصير'}</p>
                <div class="quiz-questions">
                    ${questionsHtml}
                </div>
                <button class="submit-quiz">إرسال الاختبار</button>
                <div class="quiz-results" style="display:none;"></div>
            </div>
        `;
    }
    
    createExplanationContent(interaction) {
        return `
            <div class="explanation-content">
                <div class="explanation-text">
                    ${interaction.content || 'شرح إضافي'}
                </div>
                ${interaction.resources ? `
                    <div class="explanation-resources">
                        <h4>موارد إضافية:</h4>
                        <ul>
                            ${interaction.resources.map(resource => `
                                <li><a href="${resource.url}" target="_blank">${resource.title}</a></li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                <button class="continue-btn">متابعة المشاهدة</button>
            </div>
        `;
    }
    
    createPollContent(interaction) {
        let optionsHtml = '';
        
        if (interaction.options && interaction.options.length > 0) {
            optionsHtml = interaction.options.map((option, index) => `
                <label class="poll-option">
                    <input type="radio" name="poll-${interaction.id}" value="${index}">
                    <span class="option-text">${option}</span>
                </label>
            `).join('');
        }
        
        return `
            <div class="poll-content">
                <h4>${interaction.question || 'استطلاع رأي'}</h4>
                <div class="poll-options">
                    ${optionsHtml}
                </div>
                <button class="submit-poll">إرسال</button>
                <div class="poll-results" style="display:none;"></div>
            </div>
        `;
    }
    
    handleInteractionClick(interaction) {
        // الانتقال إلى وقت التفاعل
        this.seekToTime(interaction.time);
        
        // إظهار التفاعل
        setTimeout(() => {
            this.showInteraction(interaction);
        }, 500);
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseVideo();
        } else {
            this.playVideo();
        }
    }
    
    playVideo() {
        this.isPlaying = true;
        const iframe = this.container.querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
    }
    
    pauseVideo() {
        this.isPlaying = false;
        const iframe = this.container.querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    }
    
    restartVideo() {
        this.seekToTime(0);
        this.playVideo();
        this.completedInteractions.clear();
    }
    
    seekToTime(time) {
        this.currentTime = time;
        const iframe = this.container.querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.postMessage(`{"event":"command","func":"seekTo","args":[${time}, true]}`, '*');
        }
    }
    
    seekTo(event) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        
        const seekTime = percentage * this.options.duration;
        this.seekToTime(seekTime);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.log(`خطأ في ملء الشاشة: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleMute() {
        const volumeBtn = this.container.querySelector('.volume i');
        const volumeSlider = this.container.querySelector('.volume-slider');
        
        if (volumeBtn.classList.contains('fa-volume-mute')) {
            volumeBtn.className = 'fas fa-volume-up';
            volumeSlider.value = 100;
        } else {
            volumeBtn.className = 'fas fa-volume-mute';
            volumeSlider.value = 0;
        }
    }
    
    setVolume(value) {
        const volumeBtn = this.container.querySelector('.volume i');
        const iframe = this.container.querySelector('iframe');
        
        if (iframe) {
            iframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":[${value}]}`, '*');
        }
        
        if (value == 0) {
            volumeBtn.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            volumeBtn.className = 'fas fa-volume-down';
        } else {
            volumeBtn.className = 'fas fa-volume-up';
        }
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case ' ':
            case 'k':
                event.preventDefault();
                this.togglePlayPause();
                break;
                
            case 'm':
                event.preventDefault();
                this.toggleMute();
                break;
                
            case 'f':
                event.preventDefault();
                this.toggleFullscreen();
                break;
                
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                event.preventDefault();
                const percentage = parseInt(event.key) / 10;
                this.seekToTime(percentage * this.options.duration);
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                this.seekToTime(Math.max(0, this.currentTime - 5));
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                this.seekToTime(Math.min(this.options.duration, this.currentTime + 5));
                break;
        }
    }
    
    showCompletionScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'completion-overlay';
        
        const completionRate = (this.completedInteractions.size / this.interactions.length) * 100;
        
        overlay.innerHTML = `
            <div class="completion-content">
                <h2>🎉 مبروك! أكملت الدرس</h2>
                <div class="completion-stats">
                    <div class="stat">
                        <div class="stat-value">${this.formatTime(this.currentTime)}</div>
                        <div class="stat-label">الوقت المستغرق</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.completedInteractions.size}/${this.interactions.length}</div>
                        <div class="stat-label">التفاعلات المكتملة</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${Math.round(completionRate)}%</div>
                        <div class="stat-label">معدل الإكمال</div>
                    </div>
                </div>
                <div class="completion-actions">
                    <button class="btn-restart">إعادة المشاهدة</button>
                    <button class="btn-continue">المتابعة للدرس التالي</button>
                    <button class="btn-dashboard">العودة للرئيسية</button>
                </div>
            </div>
        `;
        
        this.container.appendChild(overlay);
        
        // أحداث الأزرار
        overlay.querySelector('.btn-restart').addEventListener('click', () => {
            overlay.remove();
            this.restartVideo();
        });
        
        overlay.querySelector('.btn-continue').addEventListener('click', () => {
            // في التطبيق الحقيقي، التوجيه للدرس التالي
            window.location.href = 'dashboard.html';
        });
        
        overlay.querySelector('.btn-dashboard').addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    
    logInteraction(interaction) {
        // تسجيل تفاعل الطالب (في التطبيق الحقيقي، إرسال إلى قاعدة البيانات)
        const logData = {
            interactionId: interaction.id,
            courseId: this.options.courseId,
            userId: this.getCurrentUserId(),
            timestamp: new Date().toISOString(),
            type: interaction.type
        };
        
        console.log('تفاعل مسجل:', logData);
        
        // إرسال البيانات إلى Supabase
        if (window.interactionFunctions) {
            window.interactionFunctions.recordInteraction(logData);
        }
    }
    
    getInteractionTypeLabel(type) {
        const labels = {
            'question': 'سؤال تفاعلي',
            'quiz': 'اختبار قصير',
            'explanation': 'شرح إضافي',
            'poll': 'استطلاع رأي',
            'note': 'ملاحظة'
        };
        
        return labels[type] || 'تفاعل';
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    getCurrentUserId() {
        // الحصول على معرف المستخدم الحالي
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || 'anonymous';
    }
    
    destroy() {
        // تنظيف الموارد
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
        }
        
        // إزالة المستمعين للأحداث
        window.removeEventListener('message', this.handleYouTubeMessage);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // إزالة العناصر
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// تصدير الفئة
window.InteractiveVideoPlayer = InteractiveVideoPlayer;

// تهيئة المشغل تلقائيًا عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const videoPlayerElements = document.querySelectorAll('[data-interactive-video]');
    
    videoPlayerElements.forEach(element => {
        const videoId = element.dataset.videoId;
        const courseId = element.dataset.courseId;
        
        if (videoId) {
            // جلب التفاعلات من قاعدة البيانات
            fetchInteractions(courseId).then(interactions => {
                const player = new InteractiveVideoPlayer(element.id, {
                    videoId: videoId,
                    courseId: courseId,
                    interactions: interactions,
                    duration: parseInt(element.dataset.duration) || 600
                });
                
                element.playerInstance = player;
            });
        }
    });
});

// دالة مساعدة لجلب التفاعلات
async function fetchInteractions(courseId) {
    try {
        // في التطبيق الحقيقي، جلب من Supabase
        const response = await fetch(`/api/interactions?courseId=${courseId}`);
        const data = await response.json();
        return data.interactions || [];
    } catch (error) {
        console.error('خطأ في جلب التفاعلات:', error);
        return [];
    }
}