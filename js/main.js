// تحديد المسار الأساسي حسب البيئة
const BASE_PATH = (() => {
    const host = window.location.hostname;
    if (host.includes('github.io')) {
        // إذا كان المشروع في مجلد فرعي، حدد اسم المجلد (مثلاً '/adx')
        const path = window.location.pathname.split('/')[1];
        return path ? `/${path}` : '';
    }
    return '';
})();

console.log('🌍 BASE_PATH:', BASE_PATH);

// الصفحات المتاحة
const PAGES = {
    HOME: 'home',
    DASHBOARD: 'dashboard',
    CREATE_COURSE: 'create-course',
    SETTINGS: 'settings'
};

// دالة لتحميل صفحة معينة (SPA)
async function loadPage(page) {
    const app = document.getElementById('app');
    if (!app) return;

    try {
        let content = '';
        switch (page) {
            case PAGES.HOME:
                content = await renderHome();
                break;
            case PAGES.DASHBOARD:
                // تحقق من المصادقة قبل عرض لوحة التحكم
                if (!auth.isAuthenticated()) {
                    // يمكن إظهار نافذة تسجيل دخول أو توجيه
                    content = '<div class="container"><p>الرجاء تسجيل الدخول أولاً.</p><button onclick="showLoginModal()">تسجيل الدخول</button></div>';
                    break;
                }
                content = await renderDashboard();
                break;
            case PAGES.CREATE_COURSE:
                if (!auth.isAuthenticated()) {
                    content = '<div class="container"><p>الرجاء تسجيل الدخول أولاً.</p><button onclick="showLoginModal()">تسجيل الدخول</button></div>';
                    break;
                }
                content = await renderCreateCourse();
                break;
            case PAGES.SETTINGS:
                if (!auth.isAuthenticated()) {
                    content = '<div class="container"><p>الرجاء تسجيل الدخول أولاً.</p><button onclick="showLoginModal()">تسجيل الدخول</button></div>';
                    break;
                }
                content = await renderSettings();
                break;
            default:
                content = await renderHome();
        }
        app.innerHTML = content;
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading page:', error);
        app.innerHTML = '<div class="container"><p>حدث خطأ أثناء تحميل الصفحة.</p></div>';
    }
}

// دوال عرض الصفحات (يمكن توسيعها)
async function renderHome() {
    return `
        <header>
            <nav class="navbar">
                <div class="container">
                    <a href="#" onclick="loadPage('${PAGES.HOME}'); return false;" class="logo">تعليمي</a>
                    <button class="hamburger" id="hamburgerBtn">
                        <span></span><span></span><span></span>
                    </button>
                    <div class="nav-links" id="navLinks">
                        <button class="btn-login" onclick="showLoginModal(); return false;">تسجيل الدخول</button>
                        <button class="btn-signup" onclick="showSignupModal(); return false;">إنشاء حساب</button>
                    </div>
                </div>
            </nav>
        </header>
        <section class="hero">
            <div class="container">
                <h1>حوّل مقاطع اليوتيوب التعليمية إلى تجربة تعلم تفاعلية</h1>
                <p>أضف أسئلة، اختبارات، وشروحات تفاعلية على أي فيديو تعليمي بدون إعادة التسجيل.</p>
                <button class="btn" onclick="showSignupModal(); return false;">ابدأ مجاناً</button>
            </div>
        </section>
        <div class="container">
            <h2 class="section-title">مميزات منصتنا الفريدة</h2>
            <div class="features-grid">
                <div class="feature-card"><i class="fas fa-question-circle feature-icon"></i><h3>أسئلة تفاعلية</h3><p>أضف أسئلة في أي نقطة مع تصحيح فوري.</p></div>
                <div class="feature-card"><i class="fas fa-clipboard-check feature-icon"></i><h3>اختبارات قصيرة</h3><p>اختبارات متعددة الخيارات مع تحليلات.</p></div>
                <div class="feature-card"><i class="fas fa-lightbulb feature-icon"></i><h3>شروحات إضافية</h3><p>موارد وروابط تعليمية عند نقاط محددة.</p></div>
                <div class="feature-card"><i class="fas fa-chart-line feature-icon"></i><h3>تحليلات متقدمة</h3><p>تتبع تقدم الطلاب وإحصائيات دقيقة.</p></div>
                <div class="feature-card"><i class="fas fa-users feature-icon"></i><h3>تعليم تعاوني</h3><p>غرف دراسية افتراضية وسبورة تفاعلية.</p></div>
                <div class="feature-card"><i class="fas fa-mobile-alt feature-icon"></i><h3>متوافق مع جميع الأجهزة</h3><p>تصميم متجاوب للهواتف والأجهزة اللوحية.</p></div>
            </div>
            <h2 class="section-title">كيف تعمل المنصة؟</h2>
            <div class="steps">
                <div class="step"><div class="step-number">1</div><h3>أدخل رابط الفيديو</h3><p>انسخ رابط أي فيديو يوتيوب.</p></div>
                <div class="step"><div class="step-number">2</div><h3>أضف التفاعلات</h3><p>ضع أسئلة وشروحات في النقاط المناسبة.</p></div>
                <div class="step"><div class="step-number">3</div><h3>شارك الدرس</h3><p>احصل على رابط فريد للمشاركة.</p></div>
                <div class="step"><div class="step-number">4</div><h3>تابع التقدم</h3><p>راقب أداء طلابك عبر التقارير.</p></div>
            </div>
            <h2 class="section-title">خطط الأسعار</h2>
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>مجاني</h3>
                    <div class="price">$0 <small>/شهر</small></div>
                    <ul class="pricing-features">
                        <li><i class="fas fa-check"></i> 3 دروس تفاعلية</li>
                        <li><i class="fas fa-check"></i> 10 طلاب لكل درس</li>
                        <li><i class="fas fa-check"></i> تفاعلات أساسية</li>
                        <li><i class="fas fa-times"></i> تحليلات متقدمة</li>
                        <li><i class="fas fa-times"></i> غرف تفاعلية</li>
                    </ul>
                    <button class="btn btn-outline" onclick="showSignupModal(); return false;">ابدأ مجاناً</button>
                </div>
                <div class="pricing-card popular">
                    <div class="popular-badge">الأكثر شهرة</div>
                    <h3>احترافي</h3>
                    <div class="price">$29 <small>/شهر</small></div>
                    <ul class="pricing-features">
                        <li><i class="fas fa-check"></i> دروس غير محدودة</li>
                        <li><i class="fas fa-check"></i> طلاب غير محدودين</li>
                        <li><i class="fas fa-check"></i> جميع التفاعلات</li>
                        <li><i class="fas fa-check"></i> تحليلات متقدمة</li>
                        <li><i class="fas fa-check"></i> غرف تفاعلية</li>
                    </ul>
                    <button class="btn" onclick="showSignupModal(); return false;">اختر الخطة</button>
                </div>
                <div class="pricing-card">
                    <h3>مؤسسات</h3>
                    <div class="price">$99 <small>/شهر</small></div>
                    <ul class="pricing-features">
                        <li><i class="fas fa-check"></i> جميع ميزات الخطة الاحترافية</li>
                        <li><i class="fas fa-check"></i> لوحة تحكم للمؤسسة</li>
                        <li><i class="fas fa-check"></i> إدارة حسابات متعددة</li>
                        <li><i class="fas fa-check"></i> تكامل مع LMS</li>
                        <li><i class="fas fa-check"></i> تدريب ودعم مخصص</li>
                    </ul>
                    <button class="btn btn-outline" onclick="alert('اتصل بنا'); return false;">اتصل بنا</button>
                </div>
            </div>
        </div>
    `;
}

async function renderDashboard() {
    // يمكن جلب البيانات من Supabase
    return `
        <div class="dashboard-layout container">
            <aside class="sidebar">
                <h3>تعليمي</h3>
                <button class="active" onclick="loadPage('${PAGES.DASHBOARD}'); return false;"><i class="fas fa-tachometer-alt"></i> لوحة التحكم</button>
                <button onclick="loadPage('${PAGES.CREATE_COURSE}'); return false;"><i class="fas fa-plus-circle"></i> إنشاء درس جديد</button>
                <button onclick="loadPage('${PAGES.SETTINGS}'); return false;"><i class="fas fa-cog"></i> الإعدادات</button>
                <button onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
            </aside>
            <main class="main-panel">
                <h1>مرحباً بك في لوحة التحكم</h1>
                <p>هذه الصفحة قيد التطوير.</p>
            </main>
        </div>
    `;
}

async function renderCreateCourse() {
    return `
        <div class="dashboard-layout container">
            <aside class="sidebar">
                <h3>تعليمي</h3>
                <button onclick="loadPage('${PAGES.DASHBOARD}'); return false;"><i class="fas fa-tachometer-alt"></i> لوحة التحكم</button>
                <button class="active" onclick="loadPage('${PAGES.CREATE_COURSE}'); return false;"><i class="fas fa-plus-circle"></i> إنشاء درس جديد</button>
                <button onclick="loadPage('${PAGES.SETTINGS}'); return false;"><i class="fas fa-cog"></i> الإعدادات</button>
                <button onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
            </aside>
            <main class="main-panel">
                <h1>إنشاء درس جديد</h1>
                <p>نموذج إنشاء درس سيتم إضافته لاحقاً.</p>
            </main>
        </div>
    `;
}

async function renderSettings() {
    return `
        <div class="dashboard-layout container">
            <aside class="sidebar">
                <h3>تعليمي</h3>
                <button onclick="loadPage('${PAGES.DASHBOARD}'); return false;"><i class="fas fa-tachometer-alt"></i> لوحة التحكم</button>
                <button onclick="loadPage('${PAGES.CREATE_COURSE}'); return false;"><i class="fas fa-plus-circle"></i> إنشاء درس جديد</button>
                <button class="active" onclick="loadPage('${PAGES.SETTINGS}'); return false;"><i class="fas fa-cog"></i> الإعدادات</button>
                <button onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
            </aside>
            <main class="main-panel">
                <h1>الإعدادات</h1>
                <p>إعدادات الحساب ستظهر هنا.</p>
            </main>
        </div>
    `;
}

// دوال إضافية
function showLoginModal() {
    const email = prompt('البريد الإلكتروني:');
    const password = prompt('كلمة المرور:');
    if (email && password) {
        auth.signIn(email, password).then(result => {
            if (result.success) {
                alert('تم تسجيل الدخول بنجاح');
                loadPage(PAGES.DASHBOARD);
            } else {
                alert('خطأ: ' + result.error);
            }
        });
    }
}

function showSignupModal() {
    const name = prompt('الاسم الكامل:');
    const email = prompt('البريد الإلكتروني:');
    const password = prompt('كلمة المرور:');
    if (name && email && password) {
        auth.signUp(email, password, name).then(result => {
            if (result.success) {
                alert('تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.');
            } else {
                alert('خطأ: ' + result.error);
            }
        });
    }
}

function logout() {
    auth.signOut().then(() => {
        loadPage(PAGES.HOME);
    });
}

// تفعيل القائمة للجوال
function attachHamburgerEvent() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.onclick = function(e) {
            e.preventDefault();
            navLinks.classList.toggle('show');
        };
    }
}

// تهيئة الصفحة عند التحميل
window.addEventListener('load', async () => {
    // تحديد الصفحة بناءً على URL (يمكن استخدام window.location.pathname)
    const path = window.location.pathname.replace(BASE_PATH, '').split('/').pop();
    let page = PAGES.HOME;
    if (path === 'dashboard') page = PAGES.DASHBOARD;
    else if (path === 'create-course') page = PAGES.CREATE_COURSE;
    else if (path === 'settings') page = PAGES.SETTINGS;
    
    await loadPage(page);
    attachHamburgerEvent();
});

// دالة التنقل الخارجية (للاستخدام من HTML)
window.loadPage = loadPage;
window.showLoginModal = showLoginModal;
window.showSignupModal = showSignupModal;
window.logout = logout;

console.log('✅ Main JS loaded');