/**
 * ============================================
 * CHAT.JS - نظام الدردشة الفورية المتكامل
 * تعليمي - منصة التعلم التفاعلي
 * الإصدار: 1.0.0
 * ============================================
 */

class ChatManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            sessionId: null,
            userId: null,
            userName: null,
            maxMessages: 100,
            enableEmoji: true,
            enableAttachments: true,
            enableMentions: true,
            ...options
        };
        
        this.messages = [];
        this.participants = [];
        this.subscription = null;
        this.typingTimeout = null;
        this.isTyping = false;
        this.unreadCount = 0;
        
        this.init();
    }

    /**
     * تهيئة الدردشة
     */
    init() {
        if (!this.container) {
            console.error('Chat container not found');
            return;
        }
        
        this.createChatUI();
        this.setupEventListeners();
        this.loadMessages();
        this.subscribeToMessages();
        
        console.log('✅ ChatManager initialized');
    }

    /**
     * إنشاء واجهة الدردشة
     */
    createChatUI() {
        this.container.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <i class="fas fa-comments"></i>
                        <h3>الدردشة التفاعلية</h3>
                        <span class="participant-count">0</span>
                    </div>
                    <div class="chat-header-actions">
                        <button class="chat-btn" id="toggle-chat" title="تصغير">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="chat-btn" id="close-chat" title="إغلاق">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-welcome">
                        <i class="fas fa-comment-dots"></i>
                        <h4>مرحباً بك في الدردشة</h4>
                        <p>ابدأ المحادثة مع المشاركين الآخرين</p>
                    </div>
                </div>
                
                <div class="chat-typing" id="chat-typing" style="display: none;">
                    <span class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <span class="typing-text">يكتب...</span>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-toolbar">
                        <button class="chat-tool-btn" id="emoji-btn" title="إضافة رمز تعبيري">
                            <i class="fas fa-smile"></i>
                        </button>
                        <button class="chat-tool-btn" id="attach-btn" title="إرفاق ملف">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button class="chat-tool-btn" id="mention-btn" title="ذكر مشارك">
                            <i class="fas fa-at"></i>
                        </button>
                    </div>
                    
                    <div class="chat-input-wrapper">
                        <textarea 
                            id="chat-textarea" 
                            class="chat-textarea" 
                            placeholder="اكتب رسالتك هنا..."
                            rows="1"
                        ></textarea>
                        <button class="chat-send-btn" id="send-message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="emoji-picker" id="emoji-picker" style="display: none;">
                <!-- سيتم إضافة الإيموجي هنا بواسطة JavaScript -->
            </div>
        `;
        
        this.messagesContainer = document.getElementById('chat-messages');
        this.textarea = document.getElementById('chat-textarea');
        this.typingIndicator = document.getElementById('chat-typing');
        this.emojiPicker = document.getElementById('emoji-picker');
        
        this.addEmojiPicker();
    }

    /**
     * إضافة منتقي الإيموجي
     */
    addEmojiPicker() {
        const emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
            '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
            '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
            '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
            '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
            '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
            '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
            '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
        ];
        
        let emojiHtml = '<div class="emoji-grid">';
        emojis.forEach(emoji => {
            emojiHtml += `<button class="emoji-btn">${emoji}</button>`;
        });
        emojiHtml += '</div>';
        
        this.emojiPicker.innerHTML = emojiHtml;
        
        // إضافة أحداث الإيموجي
        this.emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.insertEmoji(btn.textContent);
                this.emojiPicker.style.display = 'none';
            });
        });
    }

    /**
     * إدراج إيموجي في حقل النص
     */
    insertEmoji(emoji) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const text = this.textarea.value;
        
        this.textarea.value = text.substring(0, start) + emoji + text.substring(end);
        this.textarea.focus();
        this.textarea.selectionStart = this.textarea.selectionEnd = start + emoji.length;
        
        this.adjustTextareaHeight();
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // إرسال الرسالة
        const sendBtn = document.getElementById('send-message');
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        // إرسال بالضغط على Enter
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // ضبط ارتفاع حقل النص
        this.textarea.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.handleTyping();
        });
        
        // فتح/إغلاق منتقي الإيموجي
        const emojiBtn = document.getElementById('emoji-btn');
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.emojiPicker.style.display = 
                this.emojiPicker.style.display === 'none' ? 'block' : 'none';
        });
        
        // إرفاق ملف
        const attachBtn = document.getElementById('attach-btn');
        attachBtn.addEventListener('click', () => this.handleAttachment());
        
        // ذكر مشارك
        const mentionBtn = document.getElementById('mention-btn');
        mentionBtn.addEventListener('click', () => this.showMentions());
        
        // تصغير الدردشة
        const toggleBtn = document.getElementById('toggle-chat');
        toggleBtn.addEventListener('click', () => this.toggleChat());
        
        // إغلاق الدردشة
        const closeBtn = document.getElementById('close-chat');
        closeBtn.addEventListener('click', () => this.closeChat());
        
        // إغلاق منتقي الإيموجي عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#emoji-picker') && !e.target.closest('#emoji-btn')) {
                this.emojiPicker.style.display = 'none';
            }
        });
    }

    /**
     * ضبط ارتفاع حقل النص
     */
    adjustTextareaHeight() {
        this.textarea.style.height = 'auto';
        this.textarea.style.height = Math.min(this.textarea.scrollHeight, 120) + 'px';
    }

    /**
     * معالجة حالة الكتابة
     */
    handleTyping() {
        if (!this.isTyping && this.textarea.value.trim()) {
            this.isTyping = true;
            this.emitTyping(true);
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            if (this.isTyping) {
                this.isTyping = false;
                this.emitTyping(false);
            }
        }, 1000);
    }

    /**
     * إرسال حالة الكتابة
     */
    emitTyping(isTyping) {
        if (this.options.sessionId && this.options.userId) {
            // إرسال حالة الكتابة عبر Supabase Realtime
            const channel = supabase.client.channel(`typing:${this.options.sessionId}`);
            channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: {
                    userId: this.options.userId,
                    userName: this.options.userName,
                    isTyping
                }
            });
        }
    }

    /**
     * إرسال رسالة
     */
    async sendMessage() {
        const content = this.textarea.value.trim();
        
        if (!content) return;
        
        try {
            const message = {
                session_id: this.options.sessionId,
                sender_id: this.options.userId,
                sender_name: this.options.userName || 'مستخدم',
                message: content,
                message_type: 'text',
                sent_at: new Date().toISOString()
            };
            
            const result = await supabase.classroom.sendChatMessage(message);
            
            if (result.success) {
                this.textarea.value = '';
                this.adjustTextareaHeight();
                this.isTyping = false;
            }
            
        } catch (error) {
            console.error('Send message error:', error);
            auth.showNotification('❌ فشل إرسال الرسالة', 'error');
        }
    }

    /**
     * إضافة رسالة إلى الواجهة
     */
    addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.sender_id === this.options.userId ? 'sent' : 'received'}`;
        messageDiv.dataset.id = message.id;
        
        const time = new Date(message.sent_at).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="message-sender">
                <span class="sender-name">${message.sender_name}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.formatMessage(message.message)}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        
        // التمرير إلى أسفل
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // تحديث عداد الرسائل غير المقروءة
        if (message.sender_id !== this.options.userId) {
            this.unreadCount++;
            this.updateUnreadBadge();
        }
    }

    /**
     * تنسيق الرسالة
     */
    formatMessage(text) {
        // تحويل الروابط
        text = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // تحويل الإشارات
        text = text.replace(
            /@(\w+)/g,
            '<span class="mention">@$1</span>'
        );
        
        // تحويل السطور الجديدة
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    /**
     * تحميل الرسائل السابقة
     */
    async loadMessages() {
        if (!this.options.sessionId) return;
        
        try {
            const result = await supabase.classroom.getChatMessages(this.options.sessionId);
            
            if (result.success && result.data) {
                // عرض الرسائل بترتيب زمني تصاعدي
                result.data.reverse().forEach(message => {
                    this.addMessage(message);
                });
            }
            
        } catch (error) {
            console.error('Load messages error:', error);
        }
    }

    /**
     * الاشتراك في الرسائل الجديدة
     */
    subscribeToMessages() {
        if (!this.options.sessionId) return;
        
        this.subscription = supabase.classroom.subscribeToChat(
            this.options.sessionId,
            (message) => {
                this.addMessage(message);
            }
        );
    }

    /**
     * معالجة إرفاق ملف
     */
    async handleAttachment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx,.txt';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // التحقق من حجم الملف (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                auth.showNotification('❌ حجم الملف يجب أن يكون أقل من 10 ميجابايت', 'error');
                return;
            }
            
            try {
                // رفع الملف إلى Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `chat-${Date.now()}.${fileExt}`;
                const filePath = `chat-attachments/${this.options.sessionId}/${fileName}`;
                
                const { error: uploadError } = await supabase.client
                    .storage
                    .from('attachments')
                    .upload(filePath, file);
                
                if (uploadError) throw uploadError;
                
                // الحصول على الرابط العام
                const { data: { publicUrl } } = supabase.client
                    .storage
                    .from('attachments')
                    .getPublicUrl(filePath);
                
                // إرسال رسالة مع المرفق
                const message = {
                    session_id: this.options.sessionId,
                    sender_id: this.options.userId,
                    sender_name: this.options.userName || 'مستخدم',
                    message: `[ملف] ${file.name}`,
                    message_type: 'file',
                    attachment_url: publicUrl,
                    attachment_name: file.name,
                    attachment_size: file.size
                };
                
                await supabase.classroom.sendChatMessage(message);
                
            } catch (error) {
                console.error('Upload attachment error:', error);
                auth.showNotification('❌ فشل رفع الملف', 'error');
            }
        };
        
        input.click();
    }

    /**
     * إظهار قائمة المشاركين للإشارة
     */
    showMentions() {
        if (this.participants.length === 0) return;
        
        const mentionsList = document.createElement('div');
        mentionsList.className = 'mentions-list';
        
        this.participants.forEach(participant => {
            const item = document.createElement('button');
            item.className = 'mention-item';
            item.innerHTML = `<span>@${participant.name}</span>`;
            item.onclick = () => {
                this.textarea.value += `@${participant.name} `;
                this.textarea.focus();
                mentionsList.remove();
            };
            mentionsList.appendChild(item);
        });
        
        // إزالة القائمة السابقة
        const oldList = document.querySelector('.mentions-list');
        if (oldList) oldList.remove();
        
        document.body.appendChild(mentionsList);
        
        // تحديد موقع القائمة
        const btn = document.getElementById('mention-btn');
        const rect = btn.getBoundingClientRect();
        mentionsList.style.top = `${rect.top - mentionsList.offsetHeight - 10}px`;
        mentionsList.style.left = `${rect.left}px`;
        
        // إغلاق القائمة عند النقر خارجها
        setTimeout(() => {
            document.addEventListener('click', function closeMentions(e) {
                if (!e.target.closest('.mentions-list') && !e.target.closest('#mention-btn')) {
                    mentionsList.remove();
                    document.removeEventListener('click', closeMentions);
                }
            });
        }, 100);
    }

    /**
     * تحديث قائمة المشاركين
     */
    updateParticipants(participants) {
        this.participants = participants;
        const countEl = this.container.querySelector('.participant-count');
        if (countEl) {
            countEl.textContent = participants.length;
            countEl.innerHTML = `<i class="fas fa-users"></i> ${participants.length}`;
        }
    }

    /**
     * تحديث عداد الرسائل غير المقروءة
     */
    updateUnreadBadge() {
        const badge = this.container.querySelector('.unread-badge');
        
        if (this.unreadCount > 0) {
            if (!badge) {
                const header = this.container.querySelector('.chat-header-info');
                const newBadge = document.createElement('span');
                newBadge.className = 'unread-badge';
                newBadge.textContent = this.unreadCount;
                header.appendChild(newBadge);
            } else {
                badge.textContent = this.unreadCount;
            }
        } else if (badge) {
            badge.remove();
        }
    }

    /**
     * تصغير/توسيع الدردشة
     */
    toggleChat() {
        this.container.classList.toggle('minimized');
        const icon = this.container.querySelector('#toggle-chat i');
        
        if (this.container.classList.contains('minimized')) {
            icon.className = 'fas fa-plus';
        } else {
            icon.className = 'fas fa-minus';
        }
    }

    /**
     * إغلاق الدردشة
     */
    closeChat() {
        this.container.style.display = 'none';
    }

    /**
     * إظهار الدردشة
     */
    showChat() {
        this.container.style.display = 'block';
        this.container.classList.remove('minimized');
    }

    /**
     * تنظيف الموارد
     */
    destroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        
        clearTimeout(this.typingTimeout);
        this.container.innerHTML = '';
    }
}

// تصدير للاستخدام العام
window.ChatManager = ChatManager;

export default ChatManager;