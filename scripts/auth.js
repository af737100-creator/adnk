/**
 * ============================================
 * AUTH.JS - نظام المصادقة المتكامل (تكملة)
 * تعليمي - منصة التعلم التفاعلي
 * الإصدار: 1.0.0
 * ============================================
 */

// ... (النصف الأول من الملف موجود في الرد السابق، نكمل من هنا)

    /**
     * إنشاء نافذة المصادقة
     */
    createAuthModal() {
        if (document.getElementById('auth-modal')) {
            return;
        }
        
        const modalHTML = `
            <div id="auth-modal" class="auth-modal">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <div class="auth-logo">
                            <i class="fas fa-graduation-cap"></i>
                            <h2>تعليمي</h2>
                        </div>
                        <button class="close-modal" onclick="auth.hideAuthModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="auth-tabs">
                        <button id="login-tab" class="auth-tab active" onclick="auth.switchTab('login')">
                            <i class="fas fa-sign-in-alt"></i>
                            تسجيل الدخول
                        </button>
                        <button id="signup-tab" class="auth-tab" onclick="auth.switchTab('signup')">
                            <i class="fas fa-user-plus"></i>
                            إنشاء حساب
                        </button>
                    </div>
                    
                    <!-- Login Form -->
                    <form id="login-form" class="auth-form active" onsubmit="event.preventDefault(); auth.handleLogin(event)">
                        <div class="form-group">
                            <label for="login-email">
                                <i class="fas fa-envelope"></i>
                                البريد الإلكتروني
                            </label>
                            <input type="email" id="login-email" placeholder="أدخل بريدك الإلكتروني" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="login-password">
                                <i class="fas fa-lock"></i>
                                كلمة المرور
                            </label>
                            <div class="password-input">
                                <input type="password" id="login-password" placeholder="أدخل كلمة المرور" required>
                                <button type="button" class="toggle-password" onclick="auth.togglePassword('login-password')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-container">
                                <input type="checkbox" id="remember-me">
                                <span class="checkmark"></span>
                                تذكرني
                            </label>
                            <button type="button" class="forgot-password" onclick="auth.handleForgotPassword()">
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-block">
                            <i class="fas fa-sign-in-alt"></i>
                            تسجيل الدخول
                        </button>
                    </form>
                    
                    <!-- Signup Form -->
                    <form id="signup-form" class="auth-form" onsubmit="event.preventDefault(); auth.handleSignup(event)">
                        <div class="form-group">
                            <label for="signup-name">
                                <i class="fas fa-user"></i>
                                الاسم الكامل
                            </label>
                            <input type="text" id="signup-name" placeholder="أدخل اسمك الكامل" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="signup-email">
                                <i class="fas fa-envelope"></i>
                                البريد الإلكتروني
                            </label>
                            <input type="email" id="signup-email" placeholder="أدخل بريدك الإلكتروني" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="signup-password">
                                <i class="fas fa-lock"></i>
                                كلمة المرور
                            </label>
                            <div class="password-input">
                                <input type="password" id="signup-password" placeholder="أدخل كلمة المرور" required>
                                <button type="button" class="toggle-password" onclick="auth.togglePassword('signup-password')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small class="password-hint">كلمة المرور يجب أن تكون 6 أحرف على الأقل</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="signup-confirm">
                                <i class="fas fa-lock"></i>
                                تأكيد كلمة المرور
                            </label>
                            <div class="password-input">
                                <input type="password" id="signup-confirm" placeholder="أعد إدخال كلمة المرور" required>
                                <button type="button" class="toggle-password" onclick="auth.togglePassword('signup-confirm')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="signup-role">
                                <i class="fas fa-user-tag"></i>
                                نوع الحساب
                            </label>
                            <select id="signup-role" required>
                                <option value="teacher">معلم</option>
                                <option value="student">طالب</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-container">
                                <input type="checkbox" id="terms-agree" required>
                                <span class="checkmark"></span>
                                أوافق على <a href="#" target="_blank">شروط الاستخدام</a> و <a href="#" target="_blank">سياسة الخصوصية</a>
                            </label>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-block">
                            <i class="fas fa-user-plus"></i>
                            إنشاء حساب
                        </button>
                    </form>
                    
                    <div class="auth-divider">
                        <span>أو</span>
                    </div>
                    
                    <div class="social-login">
                        <button class="btn-social google" onclick="auth.handleSocialLogin('google')">
                            <i class="fab fa-google"></i>
                            Google
                        </button>
                        <button class="btn-social github" onclick="auth.handleSocialLogin('github')">
                            <i class="fab fa-github"></i>
                            GitHub
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addAuthStyles();
    }

    /**
     * إضافة تنسيقات نافذة المصادقة
     */
    addAuthStyles() {
        const styles = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                animation: fadeIn 0.3s ease;
                direction: rtl;
            }
            
            .auth-modal-content {
                background: white;
                border-radius: 24px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            
            .auth-modal-header {
                padding: 30px 30px 20px;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .auth-logo {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .auth-logo i {
                font-size: 2rem;
                color: #667eea;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .auth-logo h2 {
                margin: 0;
                font-size: 1.5rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #a0aec0;
                cursor: pointer;
                padding: 10px;
                border-radius: 50%;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-modal:hover {
                background: #f7fafc;
                color: #f56565;
                transform: rotate(90deg);
            }
            
            .auth-tabs {
                display: flex;
                padding: 20px 30px;
                gap: 15px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .auth-tab {
                flex: 1;
                padding: 12px 20px;
                background: none;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                color: #4a5568;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .auth-tab i {
                font-size: 1.1rem;
            }
            
            .auth-tab.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            }
            
            .auth-form {
                display: none;
                padding: 30px;
            }
            
            .auth-form.active {
                display: block;
                animation: fadeIn 0.5s ease;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #2d3748;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .form-group label i {
                color: #667eea;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 14px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
                font-family: inherit;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                outline: none;
            }
            
            .password-input {
                position: relative;
            }
            
            .toggle-password {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #a0aec0;
                cursor: pointer;
                padding: 5px;
                transition: color 0.3s ease;
            }
            
            .toggle-password:hover {
                color: #667eea;
            }
            
            .password-hint {
                display: block;
                margin-top: 8px;
                color: #718096;
                font-size: 0.85rem;
            }
            
            .form-options {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }
            
            .checkbox-container {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                user-select: none;
            }
            
            .checkbox-container input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
            }
            
            .checkmark {
                position: relative;
                display: inline-block;
                width: 20px;
                height: 20px;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                transition: all 0.3s ease;
            }
            
            .checkbox-container:hover .checkmark {
                border-color: #667eea;
            }
            
            .checkbox-container input:checked ~ .checkmark {
                background: #667eea;
                border-color: #667eea;
            }
            
            .checkmark:after {
                content: "";
                position: absolute;
                display: none;
                left: 6px;
                top: 2px;
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            
            .checkbox-container input:checked ~ .checkmark:after {
                display: block;
            }
            
            .forgot-password {
                background: none;
                border: none;
                color: #667eea;
                cursor: pointer;
                font-size: 0.95rem;
                padding: 8px 12px;
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .forgot-password:hover {
                background: rgba(102, 126, 234, 0.1);
            }
            
            .btn-block {
                width: 100%;
                padding: 16px !important;
                font-size: 1.1rem !important;
                margin-top: 10px;
            }
            
            .auth-divider {
                position: relative;
                text-align: center;
                padding: 20px 30px;
            }
            
            .auth-divider::before,
            .auth-divider::after {
                content: '';
                position: absolute;
                top: 50%;
                width: calc(50% - 50px);
                height: 1px;
                background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            }
            
            .auth-divider::before {
                right: 30px;
            }
            
            .auth-divider::after {
                left: 30px;
            }
            
            .auth-divider span {
                background: white;
                padding: 0 15px;
                color: #718096;
                font-size: 0.95rem;
            }
            
            .social-login {
                padding: 0 30px 30px;
                display: flex;
                gap: 15px;
            }
            
            .btn-social {
                flex: 1;
                padding: 14px;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                background: white;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                color: #4a5568;
            }
            
            .btn-social i {
                font-size: 1.2rem;
            }
            
            .btn-social.google:hover {
                background: #ea4335;
                color: white;
                border-color: #ea4335;
            }
            
            .btn-social.github:hover {
                background: #333;
                color: white;
                border-color: #333;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    transform: translateY(50px);
                    opacity: 0;
                }
                to { 
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(50px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(50px);
                    opacity: 0;
                }
            }
            
            @media (max-width: 640px) {
                .auth-modal-content {
                    width: 95%;
                    max-height: 95vh;
                }
                
                .social-login {
                    flex-direction: column;
                }
                
                .auth-tabs {
                    flex-direction: column;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * معالجة تسجيل الدخول
     */
    async handleLogin(event) {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        const submitBtn = event.target.querySelector('button[type="submit"]');
        
        if (!email || !password) {
            this.showNotification('❌ الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
        submitBtn.disabled = true;
        
        const result = await this.signIn(email, password);
        
        if (result.success) {
            this.hideAuthModal();
            window.location.href = '/pages/dashboard.html';
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    /**
     * معالجة إنشاء حساب
     */
    async handleSignup(event) {
        const name = document.getElementById('signup-name')?.value;
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;
        const confirm = document.getElementById('signup-confirm')?.value;
        const role = document.getElementById('signup-role')?.value;
        const terms = document.getElementById('terms-agree')?.checked;
        const submitBtn = event.target.querySelector('button[type="submit"]');
        
        if (!name || !email || !password || !confirm) {
            this.showNotification('❌ الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        if (password !== confirm) {
            this.showNotification('❌ كلمة المرور غير متطابقة', 'error');
            return;
        }
        
        if (!terms) {
            this.showNotification('❌ الرجاء الموافقة على شروط الاستخدام', 'error');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
        submitBtn.disabled = true;
        
        const result = await this.signUp(email, password, name, role);
        
        if (result.success) {
            document.getElementById('signup-form').reset();
            this.switchTab('login');
            this.showNotification('✅ تم إنشاء الحساب بنجاح! يرجى تفعيل بريدك الإلكتروني', 'success');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    /**
     * معالجة نسيت كلمة المرور
     */
    async handleForgotPassword() {
        const email = prompt('الرجاء إدخال بريدك الإلكتروني لإعادة تعيين كلمة المرور:');
        
        if (email) {
            await this.resetPassword(email);
        }
    }

    /**
     * معالجة تسجيل الدخول عبر وسائل التواصل الاجتماعي
     */
    async handleSocialLogin(provider) {
        try {
            const { data, error } = await supabase.client.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin + '/pages/dashboard.html'
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            console.error(`${provider} login error:`, error);
            this.showNotification(`❌ فشل تسجيل الدخول عبر ${provider}`, 'error');
        }
    }

    /**
     * إظهار/إخفاء كلمة المرور
     */
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /**
     * طلب التحقق من المصادقة للصفحات المحمية
     */
    async requireAuth(redirectUrl = '/index.html') {
        const isAuth = this.isAuthenticated();
        
        if (!isAuth) {
            this.showNotification('❌ الرجاء تسجيل الدخول أولاً', 'warning');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
            return false;
        }
        
        return true;
    }

    /**
     * الحصول على ملف المستخدم من قاعدة البيانات
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Get user profile error:', error);
            return { success: false, error: error.message };
        }
    }
}

// تهيئة AuthManager
const auth = new AuthManager();

// تصدير للاستخدام العام
window.auth = auth;

// إنشاء نافذة المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    auth.createAuthModal();
});

export default auth;