-- ============================================
-- تعليمي - تحديث قاعدة البيانات الإصدار 2
-- الإصدار: 1.1.0
-- التاريخ: 2026-02-13
-- ============================================

-- ============================================
-- 1. إضافة أنواع بيانات جديدة
-- ============================================
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'achievement');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'trial');

-- ============================================
-- 2. جدول الإشعارات
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT,
    action_url TEXT,
    action_text TEXT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 3. جدول الشهادات
-- ============================================
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Certificate data
    certificate_number TEXT UNIQUE NOT NULL,
    template_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    
    -- URLs
    pdf_url TEXT,
    image_url TEXT,
    verification_url TEXT,
    qr_code TEXT,
    
    -- Verification
    verification_code TEXT UNIQUE,
    verified_count INTEGER DEFAULT 0,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,
    
    -- Metadata
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);

-- ============================================
-- 4. جدول الاشتراكات
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan subscription_plan DEFAULT 'free',
    status subscription_status DEFAULT 'active',
    
    -- Billing
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'SAR',
    interval TEXT DEFAULT 'month',
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    payment_method TEXT,
    payment_provider TEXT,
    provider_subscription_id TEXT,
    
    -- Features
    max_courses INTEGER,
    max_students_per_course INTEGER,
    max_interactions_per_course INTEGER,
    max_classroom_participants INTEGER,
    allow_whiteboard BOOLEAN DEFAULT true,
    allow_certificates BOOLEAN DEFAULT false,
    allow_analytics BOOLEAN DEFAULT false,
    allow_api_access BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date) WHERE status = 'active';

-- ============================================
-- 5. جدول المعاملات المالية
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Transaction details
    transaction_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'SAR',
    status payment_status DEFAULT 'pending',
    payment_method TEXT,
    payment_provider TEXT,
    
    -- Receipt
    receipt_url TEXT,
    invoice_url TEXT,
    
    -- Metadata
    description TEXT,
    metadata JSONB,
    
    -- Dates
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- 6. جدول الوسوم (Tags)
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. جدول ربط الدورات بالوسوم
-- ============================================
CREATE TABLE course_tags (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (course_id, tag_id)
);

-- ============================================
-- 8. جدول الإشارات المرجعية
-- ============================================
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- ============================================
-- 9. جدول التقارير المحفوظة
-- ============================================
CREATE TABLE saved_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    filters JSONB,
    schedule TEXT, -- daily, weekly, monthly
    last_run_at TIMESTAMP WITH TIME ZONE,
    recipients TEXT[],
    format TEXT DEFAULT 'pdf',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. جدول سجل محاولات تسجيل الدخول
-- ============================================
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);

-- ============================================
-- 11. إضافة أعمدة جديدة للجداول الموجودة
-- ============================================

-- إضافة عمود slug للمستخدمين
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;

-- إضافة عمود search_vector للبحث النصي
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('arabic', coalesce(full_name, '')), 'A') ||
        setweight(to_tsvector('arabic', coalesce(email, '')), 'B') ||
        setweight(to_tsvector('arabic', coalesce(bio, '')), 'C')
    ) STORED;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('arabic', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('arabic', coalesce(array_to_string(tags, ' '), '')), 'C')
    ) STORED;

-- فهارس البحث النصي
CREATE INDEX idx_users_search ON users USING GIN(search_vector);
CREATE INDEX idx_courses_search ON courses USING GIN(search_vector);

-- ============================================
-- 12. الدوال والمشغلات
-- ============================================

-- دالة تحديث آخر نشاط للمستخدم
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_activity_at = NOW()
    WHERE id = NEW.user_id OR id = NEW.student_id OR id = NEW.sender_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث آخر نشاط
CREATE TRIGGER trigger_update_last_activity_on_enrollment
    AFTER INSERT OR UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();

CREATE TRIGGER trigger_update_last_activity_on_response
    AFTER INSERT ON student_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();

CREATE TRIGGER trigger_update_last_activity_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();

-- دالة تحديث إحصائيات الدورة
CREATE OR REPLACE FUNCTION update_course_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses SET
        total_students = (
            SELECT COUNT(*) FROM enrollments WHERE course_id = NEW.course_id
        ),
        completion_rate = (
            SELECT COALESCE(
                (COUNT(*) FILTER (WHERE is_completed = true))::DECIMAL / 
                NULLIF(COUNT(*), 0) * 100, 0
            ) FROM enrollments WHERE course_id = NEW.course_id
        ),
        average_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM course_ratings WHERE course_id = NEW.course_id
        ),
        total_reviews = (
            SELECT COUNT(*) FROM course_ratings WHERE course_id = NEW.course_id
        ),
        updated_at = NOW()
    WHERE id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_stats
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_statistics();

-- دالة توليد رقم شهادة فريد
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.certificate_number := 'CERT-' || 
        TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
        UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    NEW.verification_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 12));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_certificate_number
    BEFORE INSERT ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION generate_certificate_number();

-- ============================================
-- 13. سياسات الأمان (RLS)
-- ============================================

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- سياسات الإشعارات
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- سياسات الشهادات
CREATE POLICY "Students can view their own certificates" ON certificates
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view certificates of their courses" ON certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = certificates.course_id 
            AND courses.user_id = auth.uid()
        )
    );

-- سياسات الاشتراكات
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- سياسات الإشارات المرجعية
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- سياسات التقارير المحفوظة
CREATE POLICY "Users can manage their own reports" ON saved_reports
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 14. عروض (Views) للتحليلات
-- ============================================

-- عرض إحصائيات المستخدم
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.created_at,
    u.last_login,
    u.last_activity_at,
    COUNT(DISTINCT c.id) AS total_courses,
    COUNT(DISTINCT e.id) AS total_enrollments,
    COUNT(DISTINCT cr.id) AS total_ratings,
    COALESCE(AVG(cr.rating), 0) AS average_rating
FROM users u
LEFT JOIN courses c ON c.user_id = u.id
LEFT JOIN enrollments e ON e.student_id = u.id
LEFT JOIN course_ratings cr ON cr.user_id = u.id
GROUP BY u.id;

-- عرض إحصائيات الدورة المتقدمة
CREATE VIEW course_detailed_stats AS
SELECT 
    c.id,
    c.title,
    c.user_id,
    c.total_students,
    c.total_interactions,
    c.average_rating,
    c.completion_rate,
    COUNT(DISTINCT i.id) AS interaction_count,
    COUNT(DISTINCT sr.id) AS response_count,
    COALESCE(AVG(sr.score), 0) AS average_score,
    COUNT(DISTINCT CASE WHEN e.is_completed THEN e.student_id END) AS completed_students
FROM courses c
LEFT JOIN interactions i ON i.course_id = c.id
LEFT JOIN student_responses sr ON sr.interaction_id = i.id
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id;

-- ============================================
-- 15. البيانات الافتراضية
-- ============================================

-- إضافة بعض الوسوم الأساسية
INSERT INTO tags (name, slug, category, color) VALUES
    ('برمجة', 'programming', 'technology', '#4361ee'),
    ('تصميم', 'design', 'art', '#f59e0b'),
    ('تسويق', 'marketing', 'business', '#ef4444'),
    ('لغات', 'languages', 'education', '#48bb78'),
    ('رياضيات', 'mathematics', 'science', '#8b5cf6'),
    ('علوم', 'science', 'science', '#14b8a6')
ON CONFLICT (name) DO NOTHING;

-- إضافة خطة افتراضية
INSERT INTO subscriptions (user_id, plan, status, max_courses, max_students_per_course, max_interactions_per_course)
SELECT 
    id,
    'free',
    'active',
    3,
    10,
    20
FROM users 
WHERE role = 'teacher'
ON CONFLICT DO NOTHING;

-- ============================================
-- تم التحديث بنجاح
-- ============================================