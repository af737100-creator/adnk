
// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة القائمة المتنقلة للهواتف
    initMobileMenu();
    
    // تهيئة لوحة التحكم إذا كانت الصفحة الحالية هي لوحة التحكم
    if (document.body.classList.contains('dashboard-page')) {
        initDashboard();
    }
    
    // تهيئة مشغل الفيديو التفاعلي إذا كان موجودًا
    if (document.getElementById('video-wrapper')) {
        initInteractiveVideo();
    }
    
    // تهيئة السبورة التفاعلية إذا كانت موجودة
    if (document.getElementById('whiteboard-canvas')) {
        initWhiteboard();
    }
    
    // تهيئة غرفة الدردشة إذا كانت موجودة
    if (document.getElementById('chat-messages')) {
        initChat();
    }
});

// وظيفة القائمة المتنقلة للهواتف
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            
            if (navMenu) {
                navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            }
        });
        
        // تعديل عرض القائمة عند تغيير حجم النافذة
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.style.display = 'flex';
                hamburger.classList.remove('active');
            } else {
                navMenu.style.display = 'none';
                hamburger.classList.remove('active');
            }
        });
    }
}

// وظيفة تهيئة لوحة التحكم
function initDashboard() {
    // تفعيل العنصر النشط في القائمة الجانبية
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
        
        item.addEventListener('click', function(e) {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // تهيئة نموذج الإنشاء السريع
    const quickCreateBtn = document.querySelector('.create-btn');
    if (quickCreateBtn) {
        quickCreateBtn.addEventListener('click', function() {
            window.location.href = 'create-course.html';
        });
    }
    
    // تحديث الإحصائيات
    updateDashboardStats();
    
    // تحميم الدورات الحديثة
    loadRecentCourses();
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats() {
    // في التطبيق الحقيقي، سيتم جلب هذه البيانات من Supabase
    const stats = {
        courses: 12,
        students: 245,
        completion: 78,
        engagement: 92
    };
    
    // تحديث القيم في الصفحة
    document.getElementById('courses-count').textContent = stats.courses;
    document.getElementById('students-count').textContent = stats.students;
    document.getElementById('completion-rate').textContent = stats.completion + '%';
    document.getElementById('engagement-rate').textContent = stats.engagement + '%';
}

// تحميل الدورات الحديثة
function loadRecentCourses() {
    // في التطبيق الحقيقي، سيتم جلب هذه البيانات من Supabase
    const courses = [
        {
            id: 1,
            title: 'مقدمة في البرمجة',
            thumbnail: 'https://img.youtube.com/vi/abcdefg/0.jpg',
            students: 45,
            interactions: 12,
            status: 'published',
            lastUpdated: '2023-10-15'
        },
        {
            id: 2,
            title: 'تعلم JavaScript',
            thumbnail: 'https://img.youtube.com/vi/hijklmn/0.jpg',
            students: 78,
            interactions: 18,
            status: 'published',
            lastUpdated: '2023-10-10'
        },
        {
            id: 3,
            title: 'أساسيات CSS',
            thumbnail: 'https://img.youtube.com/vi/opqrstu/0.jpg',
            students: 32,
            interactions: 8,
            status: 'draft',
            lastUpdated: '2023-10-05'
        }
    ];
    
    const tbody = document.querySelector('.courses-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="course-title">
                    <div class="course-thumbnail">
                        <img src="${course.thumbnail}" alt="${course.title}">
                    </div>
                    <div>
                        <h4>${course.title}</h4>
                        <small>${course.interactions} تفاعل</small>
                    </div>
                </div>
            </td>
            <td>${course.students}</td>
            <td>${course.lastUpdated}</td>
            <td><span class="status-badge ${course.status}">${course.status === 'published' ? 'منشور' : 'مسودة'}</span></td>
            <td>
                <button class="action-btn edit" onclick="editCourse(${course.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteCourse(${course.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// تهيئة مشغل الفيديو التفاعلي
function initInteractiveVideo() {
    const videoWrapper = document.getElementById('video-wrapper');
    const interactiveOverlay = document.querySelector('.interactive-overlay');
    
    if (!videoWrapper || !interactiveOverlay) return;
    
    // نقاط التفاعل الافتراضية (في التطبيق الحقيقي، سيتم جلبها من قاعدة البيانات)
    const interactionPoints = [
        { time: 30, type: 'question', title: 'سؤال تفاعلي' },
        { time: 90, type: 'quiz', title: 'اختبار قصير' },
        { time: 150, type: 'explanation', title: 'شرح إضافي' }
    ];
    
    // إضافة نقاط التفاعل
    interactionPoints.forEach(point => {
        createInteractionPoint(point.time, point.type, point.title);
    });
    
    // نموذج إضافة تفاعل جديد
    const addInteractionBtn = document.getElementById('add-interaction');
    const interactionForm = document.getElementById('interaction-form');
    const closeFormBtn = document.querySelector('.close-form');
    const cancelFormBtn = document.querySelector('.btn-cancel');
    const saveFormBtn = document.querySelector('.btn-save');
    
    if (addInteractionBtn && interactionForm) {
        addInteractionBtn.addEventListener('click', function() {
            interactionForm.style.display = 'block';
        });
        
        [closeFormBtn, cancelFormBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function() {
                    interactionForm.style.display = 'none';
                });
            }
        });
        
        if (saveFormBtn) {
            saveFormBtn.addEventListener('click', function() {
                saveInteraction();
                interactionForm.style.display = 'none';
            });
        }
    }
    
    // إدارة خيارات الأسئلة
    const addOptionBtn = document.querySelector('.add-option');
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', addQuestionOption);
    }
    
    // تهيئة إزالة خيارات الأسئلة
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-option')) {
            e.target.parentElement.remove();
        }
    });
}

// إنشاء نقطة تفاعل على الفيديو
function createInteractionPoint(time, type, title) {
    const overlay = document.querySelector('.interactive-overlay');
    if (!overlay) return;
    
    const point = document.createElement('div');
    point.className = 'interaction-point';
    point.dataset.time = time;
    point.dataset.type = type;
    point.dataset.title = title;
    
    // حساب الموضع بناءً على وقت الفيديو (افتراضي 10 دقائق)
    const videoDuration = 600; // 10 دقائق بالثواني
    const positionPercent = (time / videoDuration) * 100;
    point.style.top = '50%';
    point.style.right = `${positionPercent}%`;
    
    // تحديد الأيقونة بناءً على نوع التفاعل
    let icon = 'fa-question-circle';
    if (type === 'quiz') icon = 'fa-clipboard-check';
    if (type === 'explanation') icon = 'fa-lightbulb';
    
    point.innerHTML = `<i class="fas ${icon}"></i>`;
    
    // إضافة حدث النقر
    point.addEventListener('click', function() {
        showInteraction(this);
    });
    
    overlay.appendChild(point);
}

// عرض التفاعل عند النقر على نقطة
function showInteraction(pointElement) {
    const type = pointElement.dataset.type;
    const title = pointElement.dataset.title;
    
    if (type === 'question') {
        showQuestionPopup(title);
    } else if (type === 'quiz') {
        showQuizPopup(title);
    } else if (type === 'explanation') {
        showExplanationPopup(title);
    }
}

// عرض نافذة سؤال تفاعلي
function showQuestionPopup(title) {
    const popup = document.createElement('div');
    popup.className = 'interaction-popup';
    popup.innerHTML = `
        <h3 class="question-title">${title}</h3>
        <div class="question-options">
            <label class="option-label">
                <input type="radio" name="question" class="option-input" value="1">
                <span class="option-text">الخيار الأول</span>
            </label>
            <label class="option-label">
                <input type="radio" name="question" class="option-input" value="2">
                <span class="option-text">الخيار الثاني</span>
            </label>
            <label class="option-label">
                <input type="radio" name="question" class="option-input" value="3">
                <span class="option-text">الخيار الثالث</span>
            </label>
        </div>
        <button class="submit-answer">إرسال الإجابة</button>
        <div class="feedback correct" style="display:none;">
            <h4><i class="fas fa-check-circle"></i> إجابة صحيحة!</h4>
            <p>شرح الإجابة الصحيحة...</p>
        </div>
        <div class="feedback incorrect" style="display:none;">
            <h4><i class="fas fa-times-circle"></i> إجابة خاطئة</h4>
            <p>الرجاء المحاولة مرة أخرى أو الاطلاع على الشرح الإضافي.</p>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // إضافة حدث لإرسال الإجابة
    const submitBtn = popup.querySelector('.submit-answer');
    submitBtn.addEventListener('click', function() {
        const selectedOption = popup.querySelector('input[name="question"]:checked');
        
        if (!selectedOption) {
            alert('الرجاء اختيار إجابة');
            return;
        }
        
        // محاكاة التحقق من الإجابة (في التطبيق الحقيقي، سيتم التحقق من قاعدة البيانات)
        const isCorrect = selectedOption.value === '2';
        const feedback = popup.querySelector(isCorrect ? '.feedback.correct' : '.feedback.incorrect');
        
        feedback.style.display = 'block';
        submitBtn.style.display = 'none';
        
        // إغلاق النافذة بعد 5 ثواني
        setTimeout(() => {
            popup.remove();
        }, 5000);
    });
    
    // إغلاق النافذة عند النقر خارجها
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// إضافة خيار سؤال جديد
function addQuestionOption() {
    const optionsContainer = document.querySelector('.question-options');
    if (!optionsContainer) return;
    
    const optionCount = optionsContainer.children.length;
    const newOption = document.createElement('div');
    newOption.className = 'question-option';
    newOption.innerHTML = `
        <input type="text" placeholder="نص الخيار ${optionCount + 1}" required>
        <button type="button" class="remove-option"><i class="fas fa-times"></i></button>
    `;
    
    optionsContainer.appendChild(newOption);
}

// حفظ التفاعل الجديد
function saveInteraction() {
    const type = document.getElementById('interaction-type').value;
    const time = document.getElementById('interaction-time').value;
    const title = document.getElementById('interaction-title').value;
    
    // في التطبيق الحقيقي، سيتم حفظ البيانات في Supabase
    console.log('حفظ التفاعل:', { type, time, title });
    
    // إضافة نقطة تفاعل جديدة
    createInteractionPoint(time, type, title);
    
    // إعادة تعيين النموذج
    document.getElementById('interaction-form').reset();
}

// تهيئة السبورة التفاعلية
function initWhiteboard() {
    const canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let lineWidth = 2;
    
    // ضبط أبعاد السبورة
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // تهيئة السبورة باللون الأبيض
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // أحداث الرسم
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // أحداث اللمس للأجهزة المحمولة
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    // تهيئة أدوات الرسم
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toolButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.dataset.tool;
            
            if (currentTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                lineWidth = 20;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                lineWidth = this.dataset.tool === 'pen' ? 2 : 5;
            }
        });
    });
    
    // تهيئة ألوان الرسم
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(color => {
        color.addEventListener('click', function() {
            colorOptions.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.style.backgroundColor;
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
        });
    });
    
    // تهيئة أزرار التنفيذ
    const clearBtn = document.getElementById('clear-board');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }
    
    const saveBtn = document.getElementById('save-board');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const dataURL = canvas.toDataURL('image/png');
            // في التطبيق الحقيقي، سيتم حفظ الصورة في Supabase
            console.log('حفظ السبورة:', dataURL);
            alert('تم حفظ السبورة بنجاح');
        });
    }
    
    // وظائف الرسم
    function startDrawing(e) {
        drawing = true;
        draw(e);
    }
    
    function draw(e) {
        if (!drawing) return;
        
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (currentTool === 'pen' || currentTool === 'marker' || currentTool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (currentTool === 'text') {
            const text = prompt('أدخل النص:');
            if (text) {
                ctx.font = '20px Arial';
                ctx.fillText(text, x, y);
            }
        }
    }
    
    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }
    
    // وظائف اللمس
    function startDrawingTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function drawTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
}

// تهيئة غرفة الدردشة
function initChat() {
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatSendBtn || !chatMessages) return;
    
    // تحميل الرسائل السابقة (في التطبيق الحقيقي، سيتم جلبها من Supabase)
    loadChatMessages();
    
    // إرسال رسالة جديدة
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // محاكاة إرسال الرسالة (في التطبيق الحقيقي، سيتم حفظها في Supabase)
        addMessageToChat('أنت', message, true);
        
        // محاكاة رد تلقائي (في التطبيق الحقيقي، سيكون من مستخدمين آخرين)
        setTimeout(() => {
            const responses = [
                'شكرًا على مشاركتك!',
                'هذه نقطة مهمة، شكرًا لك',
                'أتفق معك في هذه النقطة',
                'هل يمكنك شرح هذه الفكرة أكثر؟'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessageToChat('مدرس', randomResponse, false);
        }, 1000);
        
        // تفريغ حقل الإدخال
        chatInput.value = '';
    }
    
    function addMessageToChat(sender, text, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        // التمرير إلى أحدث رسالة
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function loadChatMessages() {
        // محاكاة تحميل الرسائل السابقة
        const sampleMessages = [
            { sender: 'مدرس', text: 'مرحبًا بكم في الدرس التفاعلي', time: '10:00', sent: false },
            { sender: 'طالب1', text: 'شكرًا أستاذ، الدرس رائع', time: '10:02', sent: false },
            { sender: 'أنت', text: 'هل يمكن تكرار الشرح من الدقيقة 5؟', time: '10:05', sent: true }
        ];
        
        sampleMessages.forEach(msg => {
            addMessageToChat(msg.sender, msg.text, msg.sent);
        });
    }
}

// وظائف إدارة الدورات
function editCourse(courseId) {
    // في التطبيق الحقيقي، سيتم توجيه المستخدم إلى صفحة التحرير
    window.location.href = `create-course.html?edit=${courseId}`;
}

function deleteCourse(courseId) {
    if (confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
        // في التطبيق الحقيقي، سيتم حذف الدورة من Supabase
        console.log('حذف الدورة:', courseId);
        alert('تم حذف الدورة بنجاح');
        
        // إعادة تحميل القائمة
        loadRecentCourses();
    }
}

// إدارة رفع الأيدي في الغرفة التفاعلية
function toggleHandRaise() {
    const handRaiseBtn = document.getElementById('hand-raise-btn');
    if (!handRaiseBtn) return;
    
    const isRaised = handRaiseBtn.classList.toggle('active');
    
    if (isRaised) {
        handRaiseBtn.innerHTML = '<i class="fas fa-hand-paper"></i> خفض اليد';
        handRaiseBtn.style.backgroundColor = 'var(--warning-color)';
        handRaiseBtn.style.color = 'white';
        
        // في التطبيق الحقيقي، سيتم إعلام المعلم عبر Supabase Realtime
    } else {
        handRaiseBtn.innerHTML = '<i class="fas fa-hand-paper"></i> رفع اليد';
        handRaiseBtn.style.backgroundColor = '';
        handRaiseBtn.style.color = '';
    }
}

// تسجيل الدخول/التسجيل
function handleAuth(action, email, password, name = null) {
    // في التطبيق الحقيقي، سيتم استخدام Supabase Auth
    console.log(`${action} بالبريد: ${email}`);
    
    // محاكاة المصادقة الناجحة
    localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: name || 'مستخدم',
        email: email,
        role: 'teacher'
    }));
    
    window.location.href = 'dashboard.html';
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

// تحقق من حالة المصادقة
function checkAuth() {
    const user = localStorage.getItem('user');
    const protectedPages = ['dashboard.html', 'create-course.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !user) {
        window.location.href = '../index.html';
    }
}

// تشغيل التحقق من المصادقة عند تحميل الصفحة
checkAuth();