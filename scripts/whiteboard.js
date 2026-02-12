/**
 * ============================================
 * WHITEBOARD.JS - السبورة التفاعلية المتكاملة
 * تعليمي - منصة التعلم التفاعلي
 * الإصدار: 1.0.0
 * ============================================
 */

class Whiteboard {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            width: 1200,
            height: 800,
            backgroundColor: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 2,
            fontSize: 20,
            fontFamily: 'Arial',
            ...options
        };
        
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.currentWidth = 2;
        this.undoStack = [];
        this.redoStack = [];
        this.pages = [];
        this.currentPage = 0;
        this.shapes = [];
        this.textElements = [];
        this.images = [];
        this.isCollaborative = false;
        this.sessionId = null;
        this.subscription = null;
        
        this.init();
    }

    /**
     * تهيئة السبورة
     */
    init() {
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        
        this.createCanvas();
        this.createToolbar();
        this.setupEventListeners();
        this.loadFromStorage();
        console.log('✅ Whiteboard initialized');
    }

    /**
     * إنشاء لوحة الرسم
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.className = 'whiteboard-canvas';
        this.canvas.style.backgroundColor = this.options.backgroundColor;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.container.appendChild(this.canvas);
        this.saveState();
    }

    /**
     * إنشاء شريط الأدوات
     */
    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'whiteboard-toolbar';
        
        toolbar.innerHTML = `
            <div class="tool-group">
                <button class="tool-btn ${this.currentTool === 'pen' ? 'active' : ''}" data-tool="pen" title="قلم">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="tool-btn ${this.currentTool === 'eraser' ? 'active' : ''}" data-tool="eraser" title="ممحاة">
                    <i class="fas fa-eraser"></i>
                </button>
                <button class="tool-btn ${this.currentTool === 'line' ? 'active' : ''}" data-tool="line" title="خط">
                    <i class="fas fa-slash"></i>
                </button>
                <button class="tool-btn ${this.currentTool === 'rectangle' ? 'active' : ''}" data-tool="rectangle" title="مستطيل">
                    <i class="fas fa-square"></i>
                </button>
                <button class="tool-btn ${this.currentTool === 'circle' ? 'active' : ''}" data-tool="circle" title="دائرة">
                    <i class="fas fa-circle"></i>
                </button>
                <button class="tool-btn ${this.currentTool === 'text' ? 'active' : ''}" data-tool="text" title="نص">
                    <i class="fas fa-font"></i>
                </button>
            </div>
            
            <div class="tool-group">
                <div class="color-picker">
                    <input type="color" id="stroke-color" value="${this.currentColor}" title="لون الرسم">
                </div>
                <div class="stroke-width">
                    <input type="range" id="stroke-width" min="1" max="20" value="${this.currentWidth}" title="سمك الخط">
                    <span id="width-value">${this.currentWidth}</span>
                </div>
            </div>
            
            <div class="tool-group">
                <button class="tool-btn" id="undo-btn" title="تراجع">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="tool-btn" id="redo-btn" title="إعادة">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="tool-btn" id="clear-btn" title="مسح الكل">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="tool-group">
                <button class="tool-btn" id="save-btn" title="حفظ">
                    <i class="fas fa-save"></i>
                </button>
                <button class="tool-btn" id="download-btn" title="تحميل">
                    <i class="fas fa-download"></i>
                </button>
                <button class="tool-btn" id="share-btn" title="مشاركة">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
            
            <div class="tool-group">
                <button class="tool-btn" id="zoom-in-btn" title="تكبير">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="tool-btn" id="zoom-out-btn" title="تصغير">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="tool-btn" id="reset-zoom-btn" title="حجم أصلي">
                    <i class="fas fa-compress-alt"></i>
                </button>
            </div>
            
            <div class="tool-group">
                <button class="tool-btn" id="new-page-btn" title="صفحة جديدة">
                    <i class="fas fa-plus"></i>
                </button>
                <span id="page-indicator">صفحة ${this.currentPage + 1}/${this.pages.length + 1}</span>
                <button class="tool-btn" id="next-page-btn" title="الصفحة التالية">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="tool-btn" id="prev-page-btn" title="الصفحة السابقة">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        this.container.insertBefore(toolbar, this.canvas);
        this.toolbar = toolbar;
        this.bindToolbarEvents();
    }

    /**
     * ربط أحداث شريط الأدوات
     */
    bindToolbarEvents() {
        // أدوات الرسم
        this.toolbar.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toolbar.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
        
        // اختيار اللون
        const colorPicker = this.toolbar.querySelector('#stroke-color');
        colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
        });
        
        // سمك الخط
        const widthSlider = this.toolbar.querySelector('#stroke-width');
        const widthValue = this.toolbar.querySelector('#width-value');
        widthSlider.addEventListener('input', (e) => {
            this.currentWidth = parseInt(e.target.value);
            widthValue.textContent = this.currentWidth;
        });
        
        // تراجع
        this.toolbar.querySelector('#undo-btn').addEventListener('click', () => this.undo());
        
        // إعادة
        this.toolbar.querySelector('#redo-btn').addEventListener('click', () => this.redo());
        
        // مسح الكل
        this.toolbar.querySelector('#clear-btn').addEventListener('click', () => this.clear());
        
        // حفظ
        this.toolbar.querySelector('#save-btn').addEventListener('click', () => this.save());
        
        // تحميل
        this.toolbar.querySelector('#download-btn').addEventListener('click', () => this.download());
        
        // مشاركة
        this.toolbar.querySelector('#share-btn').addEventListener('click', () => this.share());
        
        // تكبير
        this.toolbar.querySelector('#zoom-in-btn').addEventListener('click', () => this.zoom(1.2));
        
        // تصغير
        this.toolbar.querySelector('#zoom-out-btn').addEventListener('click', () => this.zoom(0.8));
        
        // حجم أصلي
        this.toolbar.querySelector('#reset-zoom-btn').addEventListener('click', () => this.resetZoom());
        
        // صفحة جديدة
        this.toolbar.querySelector('#new-page-btn').addEventListener('click', () => this.addPage());
        
        // الصفحة التالية
        this.toolbar.querySelector('#next-page-btn').addEventListener('click', () => this.nextPage());
        
        // الصفحة السابقة
        this.toolbar.querySelector('#prev-page-btn').addEventListener('click', () => this.prevPage());
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // أحداث الماوس
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // أحداث اللمس للأجهزة المحمولة
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * بدء الرسم
     */
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getCoordinates(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }

    /**
     * الرسم
     */
    draw(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        
        const pos = this.getCoordinates(e);
        const x = pos.x;
        const y = pos.y;
        
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? this.options.backgroundColor : this.currentColor;
        this.ctx.lineWidth = this.currentTool === 'eraser' ? 20 : this.currentWidth;
        
        switch (this.currentTool) {
            case 'pen':
                this.drawFreehand(x, y);
                break;
            case 'eraser':
                this.drawFreehand(x, y);
                break;
            case 'line':
                this.drawLine(x, y);
                break;
            case 'rectangle':
                this.drawRectangle(x, y);
                break;
            case 'circle':
                this.drawCircle(x, y);
                break;
            case 'text':
                this.addText(x, y);
                break;
        }
        
        this.lastX = x;
        this.lastY = y;
    }

    /**
     * رسم يدوي حر
     */
    drawFreehand(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    /**
     * رسم خط
     */
    drawLine(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    /**
     * رسم مستطيل
     */
    drawRectangle(x, y) {
        const width = x - this.lastX;
        const height = y - this.lastY;
        this.ctx.strokeRect(this.lastX, this.lastY, width, height);
    }

    /**
     * رسم دائرة
     */
    drawCircle(x, y) {
        const radius = Math.sqrt(Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2));
        this.ctx.beginPath();
        this.ctx.arc(this.lastX, this.lastY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    /**
     * إضافة نص
     */
    addText(x, y) {
        const text = prompt('أدخل النص:');
        if (text) {
            this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
            this.ctx.fillStyle = this.currentColor;
            this.ctx.fillText(text, x, y);
            
            this.textElements.push({
                text,
                x,
                y,
                color: this.currentColor,
                fontSize: this.options.fontSize,
                fontFamily: this.options.fontFamily
            });
        }
    }

    /**
     * إيقاف الرسم
     */
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    /**
     * معالجة بدء اللمس
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    /**
     * معالجة حركة اللمس
     */
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    /**
     * الحصول على إحداثيات الماوس
     */
    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        return { x, y };
    }

    /**
     * معالجة أحداث لوحة المفاتيح
     */
    handleKeyDown(e) {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.save();
                    break;
                case 'd':
                    e.preventDefault();
                    this.download();
                    break;
                case '=':
                    e.preventDefault();
                    this.zoom(1.2);
                    break;
                case '-':
                    e.preventDefault();
                    this.zoom(0.8);
                    break;
                case '0':
                    e.preventDefault();
                    this.resetZoom();
                    break;
            }
        }
    }

    /**
     * حفظ الحالة للتراجع
     */
    saveState() {
        this.undoStack.push(this.canvas.toDataURL());
        this.redoStack = [];
    }

    /**
     * تراجع
     */
    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            this.loadState(this.undoStack[this.undoStack.length - 1]);
        }
    }

    /**
     * إعادة
     */
    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.loadState(state);
        }
    }

    /**
     * تحميل حالة
     */
    loadState(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }

    /**
     * مسح الكل
     */
    clear() {
        if (confirm('هل أنت متأكد من مسح كل المحتوى؟')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveState();
        }
    }

    /**
     * حفظ السبورة
     */
    async save() {
        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            
            if (this.sessionId) {
                await supabase.classroom.saveWhiteboardSnapshot({
                    session_id: this.sessionId,
                    user_id: auth.getCurrentUserId(),
                    data: dataUrl,
                    page_number: this.currentPage
                });
            }
            
            // حفظ في التخزين المحلي
            localStorage.setItem(`whiteboard_${Date.now()}`, dataUrl);
            
            auth.showNotification('✅ تم حفظ السبورة بنجاح', 'success');
            
        } catch (error) {
            console.error('Save whiteboard error:', error);
            auth.showNotification('❌ فشل حفظ السبورة', 'error');
        }
    }

    /**
     * تحميل السبورة
     */
    download() {
        const link = document.createElement('a');
        link.download = `whiteboard-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    /**
     * مشاركة السبورة
     */
    async share() {
        try {
            const blob = await (await fetch(this.canvas.toDataURL('image/png'))).blob();
            const file = new File([blob], 'whiteboard.png', { type: 'image/png' });
            
            if (navigator.share) {
                await navigator.share({
                    title: 'السبورة التفاعلية',
                    text: 'شاهد السبورة التفاعلية من تعليمي',
                    files: [file]
                });
            } else {
                auth.showNotification('⚠️ المشاركة غير مدعومة في هذا المتصفح', 'warning');
            }
            
        } catch (error) {
            console.error('Share error:', error);
        }
    }

    /**
     * تكبير/تصغير
     */
    zoom(factor) {
        const width = this.canvas.width * factor;
        const height = this.canvas.height * factor;
        
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    /**
     * إعادة حجم السبورة الأصلي
     */
    resetZoom() {
        this.canvas.style.width = `${this.options.width}px`;
        this.canvas.style.height = `${this.options.height}px`;
    }

    /**
     * إضافة صفحة جديدة
     */
    addPage() {
        this.savePage();
        this.pages.push(this.canvas.toDataURL());
        this.currentPage = this.pages.length;
        this.clear();
        this.updatePageIndicator();
    }

    /**
     * حفظ الصفحة الحالية
     */
    savePage() {
        if (this.currentPage >= 0 && this.currentPage < this.pages.length) {
            this.pages[this.currentPage] = this.canvas.toDataURL();
        }
    }

    /**
     * تحميل صفحة
     */
    loadPage(index) {
        if (index >= 0 && index < this.pages.length) {
            this.savePage();
            this.currentPage = index;
            this.loadState(this.pages[index]);
            this.updatePageIndicator();
        }
    }

    /**
     * الصفحة التالية
     */
    nextPage() {
        this.loadPage(this.currentPage + 1);
    }

    /**
     * الصفحة السابقة
     */
    prevPage() {
        this.loadPage(this.currentPage - 1);
    }

    /**
     * تحديث مؤشر الصفحة
     */
    updatePageIndicator() {
        const indicator = this.toolbar.querySelector('#page-indicator');
        if (indicator) {
            indicator.textContent = `صفحة ${this.currentPage + 1}/${this.pages.length + 1}`;
        }
    }

    /**
     * تحميل من التخزين
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('whiteboard_current');
            if (saved) {
                this.loadState(saved);
            }
        } catch (error) {
            console.error('Load from storage error:', error);
        }
    }

    /**
     * تفعيل الوضع التعاوني
     */
    async enableCollaborative(sessionId) {
        this.isCollaborative = true;
        this.sessionId = sessionId;
        
        // الاشتراك في تحديثات السبورة
        this.subscription = supabase.classroom.subscribeToWhiteboard(
            sessionId,
            (snapshot) => {
                this.loadState(snapshot.data);
            }
        );
        
        auth.showNotification('👥 الوضع التعاوني مفعل', 'success');
    }

    /**
     * تعطيل الوضع التعاوني
     */
    disableCollaborative() {
        this.isCollaborative = false;
        this.sessionId = null;
        
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    /**
     * تدمير السبورة
     */
    destroy() {
        this.disableCollaborative();
        this.canvas.remove();
        this.toolbar.remove();
    }
}

// تصدير للاستخدام العام
window.Whiteboard = Whiteboard;

export default Whiteboard;