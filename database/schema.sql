-- ============================================
-- تعليمي - منصة التعلم التفاعلي
-- قاعدة بيانات Supabase - هيكل كامل ومتكامل
-- الإصدار: 1.0.0
-- التاريخ: 2026-02-12
-- ============================================

-- ============================================
-- 1. ENABLE EXTENSIONS - تفعيل الإضافات
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================
-- 2. CUSTOM TYPES - أنواع البيانات المخصصة
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'assistant');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE access_type AS ENUM ('public', 'private', 'invite_only', 'paid');
CREATE TYPE interaction_type AS ENUM ('question', 'quiz', 'explanation', 'poll', 'note', 'resource', 'assignment');
CREATE TYPE certificate_type AS ENUM ('none', 'auto', 'manual', 'premium');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'ended', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'achievement');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ============================================
-- 3. USERS TABLE - جدول المستخدمين (الأساسي)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'teacher',
    bio TEXT,
    headline TEXT,
    website TEXT,
    location TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full text search
    full_text_search tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('arabic', coalesce(full_name, '')), 'A') ||
        setweight(to_tsvector('arabic', coalesce(email, '')), 'B') ||
        setweight(to_tsvector('arabic', coalesce(bio, '')), 'C')
    ) STORED
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_full_text_search ON users USING GIN(full_text_search);

-- ============================================
-- 4. COURSES TABLE - جدول الدورات
-- ============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    category TEXT,
    subcategory TEXT,
    tags TEXT[],
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
    
    -- YouTube video
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER DEFAULT 0, -- in seconds
    
    -- Course settings
    status course_status DEFAULT 'draft',
    access_type access_type DEFAULT 'public',
    access_code TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    discounted_price DECIMAL(10,2),
    currency TEXT DEFAULT 'SAR',
    
    -- Features
    allow_comments BOOLEAN DEFAULT true,
    allow_rating BOOLEAN DEFAULT true,
    allow_discussions BOOLEAN DEFAULT true,
    completion_certificate certificate_type DEFAULT 'none',
    certificate_template TEXT,
    
    -- Statistics (updated by triggers)
    total_students INTEGER DEFAULT 0,
    total_interactions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full text search
    full_text_search tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('arabic', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('arabic', coalesce(array_to_string(tags, ' '), '')), 'C')
    ) STORED
);

-- Create indexes for courses
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_courses_published_at ON courses(published_at DESC);
CREATE INDEX idx_courses_full_text_search ON courses USING GIN(full_text_search);

-- ============================================
-- 5. INTERACTIONS TABLE - جدول التفاعلات
-- ============================================
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type interaction_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB, -- Flexible content structure
    
    -- Timing
    time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
    
    -- Question/Quiz specific
    question_text TEXT,
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 1,
    time_limit INTEGER, -- in seconds, for quizzes
    
    -- Explanation/Resource specific
    resources JSONB[],
    links JSONB[],
    attachments JSONB[],
    
    -- Poll specific
    poll_question TEXT,
    poll_options JSONB[],
    allow_multiple BOOLEAN DEFAULT false,
    
    -- Settings
    is_mandatory BOOLEAN DEFAULT true,
    show_feedback BOOLEAN DEFAULT true,
    feedback_text TEXT,
    
    -- Statistics
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    average_time_spent INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for interactions
CREATE INDEX idx_interactions_course_id ON interactions(course_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_time ON interactions(time_seconds);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);

-- ============================================
-- 6. ENROLLMENTS TABLE - جدول التسجيلات
-- ============================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progress
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_interactions UUID[] DEFAULT '{}',
    current_time INTEGER DEFAULT 0,
    total_watched_time INTEGER DEFAULT 0,
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Certificate
    certificate_url TEXT,
    certificate_issued_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment (for paid courses)
    payment_status payment_status,
    payment_amount DECIMAL(10,2),
    payment_date TIMESTAMP WITH TIME ZONE,
    transaction_id TEXT,
    
    -- Rating
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(course_id, student_id)
);

-- Create indexes for enrollments
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_completed ON enrollments(is_completed);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);

-- ============================================
-- 7. STUDENT_RESPONSES TABLE - جدول إجابات الطلاب
-- ============================================
CREATE TABLE student_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    
    -- Response data
    answer JSONB,
    is_correct BOOLEAN,
    score INTEGER DEFAULT 0,
    time_spent INTEGER, -- in seconds
    attempts INTEGER DEFAULT 1,
    
    -- Feedback
    feedback_seen BOOLEAN DEFAULT false,
    
    -- Timestamps
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for student_responses
CREATE INDEX idx_responses_interaction_id ON student_responses(interaction_id);
CREATE INDEX idx_responses_student_id ON student_responses(student_id);
CREATE INDEX idx_responses_enrollment_id ON student_responses(enrollment_id);
CREATE INDEX idx_responses_responded_at ON student_responses(responded_at DESC);

-- ============================================
-- 8. CLASSROOM_SESSIONS TABLE - جدول جلسات الفصول التفاعلية
-- ============================================
CREATE TABLE classroom_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session info
    session_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Settings
    status session_status DEFAULT 'active',
    max_participants INTEGER DEFAULT 100,
    allow_chat BOOLEAN DEFAULT true,
    allow_whiteboard BOOLEAN DEFAULT true,
    allow_screen_sharing BOOLEAN DEFAULT true,
    allow_hand_raise BOOLEAN DEFAULT true,
    record_session BOOLEAN DEFAULT false,
    recording_url TEXT,
    
    -- Statistics
    total_participants INTEGER DEFAULT 0,
    peak_participants INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    
    -- Timestamps
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for classroom_sessions
CREATE INDEX idx_classroom_sessions_code ON classroom_sessions(session_code);
CREATE INDEX idx_classroom_sessions_teacher ON classroom_sessions(teacher_id);
CREATE INDEX idx_classroom_sessions_status ON classroom_sessions(status);
CREATE INDEX idx_classroom_sessions_created_at ON classroom_sessions(created_at DESC);

-- ============================================
-- 9. SESSION_PARTICIPANTS TABLE - جدول المشاركين في الجلسات
-- ============================================
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participant status
    role TEXT DEFAULT 'student' CHECK (role IN ('host', 'co-host', 'student', 'observer')),
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    hand_raised BOOLEAN DEFAULT false,
    hand_raised_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    is_video_on BOOLEAN DEFAULT false,
    is_screen_sharing BOOLEAN DEFAULT false,
    
    -- Participation stats
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    
    -- Unique constraint
    UNIQUE(session_id, student_id)
);

-- Create indexes for session_participants
CREATE INDEX idx_participants_session ON session_participants(session_id);
CREATE INDEX idx_participants_student ON session_participants(student_id);
CREATE INDEX idx_participants_hand_raised ON session_participants(hand_raised) WHERE hand_raised = true;

-- ============================================
-- 10. CHAT_MESSAGES TABLE - جدول رسائل الدردشة
-- ============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message content
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'announcement')),
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_size INTEGER,
    
    -- Metadata
    is_edited BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_announcement BOOLEAN DEFAULT false,
    mentions UUID[],
    reactions JSONB DEFAULT '{}',
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for chat_messages
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at DESC);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

-- ============================================
-- 11. WHITEBOARD_SNAPSHOTS TABLE - جدول لقطات السبورة
-- ============================================
CREATE TABLE whiteboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Whiteboard data
    data JSONB NOT NULL, -- Canvas data in JSON format
    thumbnail_url TEXT,
    width INTEGER DEFAULT 1920,
    height INTEGER DEFAULT 1080,
    page_number INTEGER DEFAULT 1,
    
    -- Metadata
    name TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for whiteboard_snapshots
CREATE INDEX idx_whiteboard_session ON whiteboard_snapshots(session_id);
CREATE INDEX idx_whiteboard_user ON whiteboard_snapshots(user_id);
CREATE INDEX idx_whiteboard_saved_at ON whiteboard_snapshots(saved_at DESC);

-- ============================================
-- 12. NOTIFICATIONS TABLE - جدول الإشعارات
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    type notification_type DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT,
    action_url TEXT,
    action_text TEXT,
    
    -- Metadata
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 13. CERTIFICATES TABLE - جدول الشهادات
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

-- Create indexes for certificates
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);

-- ============================================
-- 14. COURSE_RATINGS TABLE - جدول تقييمات الدورات
-- ============================================
CREATE TABLE course_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    
    -- Rating data
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title TEXT,
    review_content TEXT,
    pros TEXT[],
    cons TEXT[],
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(course_id, user_id)
);

-- Create indexes for course_ratings
CREATE INDEX idx_ratings_course ON course_ratings(course_id);
CREATE INDEX idx_ratings_user ON course_ratings(user_id);
CREATE INDEX idx_ratings_rating ON course_ratings(rating);
CREATE INDEX idx_ratings_created_at ON course_ratings(created_at DESC);

-- ============================================
-- 15. ACTIVITY_LOGS TABLE - جدول سجل النشاطات
-- ============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity data
    action TEXT NOT NULL,
    entity_type TEXT, -- 'course', 'interaction', 'classroom', etc.
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity_logs
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);

-- ============================================
-- 16. ROW LEVEL SECURITY POLICIES - سياسات الأمان
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES - سياسات المستخدمين
-- ============================================
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
ON users FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- ============================================
-- COURSES POLICIES - سياسات الدورات
-- ============================================
CREATE POLICY "Teachers can CRUD their own courses" 
ON courses FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Students can view published courses" 
ON courses FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all courses" 
ON courses FOR ALL 
USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- ============================================
-- INTERACTIONS POLICIES - سياسات التفاعلات
-- ============================================
CREATE POLICY "Teachers can manage their course interactions" 
ON interactions FOR ALL 
USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = interactions.course_id 
    AND courses.user_id = auth.uid()
));

CREATE POLICY "Students can view interactions of enrolled courses" 
ON interactions FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = interactions.course_id 
    AND enrollments.student_id = auth.uid()
));

-- ============================================
-- ENROLLMENTS POLICIES - سياسات التسجيلات
-- ============================================
CREATE POLICY "Students can enroll in courses" 
ON enrollments FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own enrollments" 
ON enrollments FOR SELECT 
USING (auth.uid() = student_id OR 
       EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Students can update their own progress" 
ON enrollments FOR UPDATE 
USING (auth.uid() = student_id);

-- ============================================
-- RESPONSES POLICIES - سياسات الإجابات
-- ============================================
CREATE POLICY "Students can create their own responses" 
ON student_responses FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own responses" 
ON student_responses FOR SELECT 
USING (auth.uid() = student_id OR 
       EXISTS (SELECT 1 FROM interactions 
               JOIN courses ON courses.id = interactions.course_id 
               WHERE interactions.id = student_responses.interaction_id 
               AND courses.user_id = auth.uid()));

-- ============================================
-- CLASSROOM POLICIES - سياسات الفصول التفاعلية
-- ============================================
CREATE POLICY "Teachers can manage their own sessions" 
ON classroom_sessions FOR ALL 
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view active sessions" 
ON classroom_sessions FOR SELECT 
USING (status = 'active');

CREATE POLICY "Participants can view session they joined" 
ON session_participants FOR SELECT 
USING (auth.uid() = student_id OR 
       EXISTS (SELECT 1 FROM classroom_sessions WHERE classroom_sessions.id = session_participants.session_id AND classroom_sessions.teacher_id = auth.uid()));

-- ============================================
-- CHAT POLICIES - سياسات الدردشة
-- ============================================
CREATE POLICY "Users can send messages to sessions they joined" 
ON chat_messages FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM session_participants 
    WHERE session_participants.session_id = chat_messages.session_id 
    AND session_participants.student_id = auth.uid()
));

CREATE POLICY "Users can view messages from sessions they joined" 
ON chat_messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM session_participants 
    WHERE session_participants.session_id = chat_messages.session_id 
    AND session_participants.student_id = auth.uid()
));

-- ============================================
-- NOTIFICATIONS POLICIES - سياسات الإشعارات
-- ============================================
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- ============================================
-- 17. FUNCTIONS AND TRIGGERS - الدوال والمشغلات
-- ============================================

-- Function: Update course statistics
CREATE OR REPLACE FUNCTION update_course_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total students
    UPDATE courses SET 
        total_students = (
            SELECT COUNT(*) FROM enrollments 
            WHERE course_id = NEW.course_id
        ),
        completion_rate = (
            SELECT COALESCE(
                (COUNT(*) FILTER (WHERE is_completed = true))::DECIMAL / 
                NULLIF(COUNT(*), 0) * 100, 0
            ) FROM enrollments 
            WHERE course_id = NEW.course_id
        ),
        updated_at = NOW()
    WHERE id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for enrollment changes
CREATE TRIGGER trigger_update_course_stats
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_statistics();

-- Function: Generate certificate number
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

-- Trigger for certificates
CREATE TRIGGER trigger_generate_certificate_number
    BEFORE INSERT ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION generate_certificate_number();

-- Function: Update course rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses SET 
        average_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM course_ratings
            WHERE course_id = NEW.course_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM course_ratings
            WHERE course_id = NEW.course_id
        ),
        updated_at = NOW()
    WHERE id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for course ratings
CREATE TRIGGER trigger_update_course_rating
    AFTER INSERT OR UPDATE OR DELETE ON course_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

-- ============================================
-- 18. VIEWS FOR ANALYTICS - عروض التحليلات
-- ============================================

-- View: Course analytics
CREATE VIEW course_analytics AS
SELECT 
    c.id,
    c.title,
    c.user_id,
    u.full_name AS teacher_name,
    c.total_students,
    c.total_interactions,
    c.total_views,
    c.average_rating,
    c.total_reviews,
    c.completion_rate,
    c.status,
    c.created_at,
    c.published_at,
    COUNT(DISTINCT i.id) AS interaction_count,
    COUNT(DISTINCT cr.id) AS review_count,
    COUNT(DISTINCT e.id) AS enrollment_count
FROM courses c
LEFT JOIN users u ON u.id = c.user_id
LEFT JOIN interactions i ON i.course_id = c.id
LEFT JOIN course_ratings cr ON cr.course_id = c.id
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id, u.full_name;

-- View: Student progress analytics
CREATE VIEW student_progress_analytics AS
SELECT 
    e.student_id,
    u.full_name AS student_name,
    e.course_id,
    c.title AS course_title,
    e.progress,
    e.is_completed,
    e.enrolled_at,
    e.completed_at,
    e.last_accessed_at,
    EXTRACT(DAY FROM NOW() - e.last_accessed_at) AS days_since_last_access
FROM enrollments e
JOIN users u ON u.id = e.student_id
JOIN courses c ON c.id = e.course_id;

-- ============================================
-- 19. SEED DATA - بيانات افتراضية (اختياري)
-- ============================================

-- Insert sample admin user
INSERT INTO users (id, email, full_name, role, email_verified)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@ta3lemi.com',
    'مدير النظام',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 20. COMMENTS - تعليقات توثيقية
-- ============================================
COMMENT ON TABLE users IS 'جدول المستخدمين - يحتوي على جميع بيانات المستخدمين';
COMMENT ON TABLE courses IS 'جدول الدورات - يحتوي على جميع الدروس التفاعلية';
COMMENT ON TABLE interactions IS 'جدول التفاعلات - الأسئلة والاختبارات والشروحات';
COMMENT ON TABLE enrollments IS 'جدول التسجيلات - تسجيلات الطلاب في الدورات';
COMMENT ON TABLE student_responses IS 'جدول إجابات الطلاب - إجابات الطلاب على التفاعلات';
COMMENT ON TABLE classroom_sessions IS 'جدول جلسات الفصول التفاعلية';
COMMENT ON TABLE chat_messages IS 'جدول رسائل الدردشة';
COMMENT ON TABLE whiteboard_snapshots IS 'جدول لقطات السبورة التفاعلية';
COMMENT ON TABLE certificates IS 'جدول الشهادات - شهادات إكمال الدورات';

-- ============================================
-- تم الانتهاء من إنشاء قاعدة البيانات
-- Database schema completed successfully
-- ============================================
