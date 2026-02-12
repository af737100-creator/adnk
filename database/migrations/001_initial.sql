-- ============================================
-- تعليمي - التهيئة الأولية لقاعدة البيانات
-- الإصدار: 1.0.0
-- التاريخ: 2026-02-13
-- ============================================

-- تفعيل الإضافات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- إنشاء أنواع البيانات المخصصة
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'assistant');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE access_type AS ENUM ('public', 'private', 'invite_only');
CREATE TYPE interaction_type AS ENUM ('question', 'quiz', 'explanation', 'poll', 'note');
CREATE TYPE certificate_type AS ENUM ('none', 'auto', 'manual');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'ended');

-- ============================================
-- جدول المستخدمين
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'teacher',
    bio TEXT,
    job_title TEXT,
    organization TEXT,
    location TEXT,
    phone TEXT,
    twitter TEXT,
    linkedin TEXT,
    github TEXT,
    youtube TEXT,
    skills TEXT[],
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول الدورات
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
    duration INTEGER DEFAULT 0,
    
    -- Course settings
    status course_status DEFAULT 'draft',
    access_type access_type DEFAULT 'public',
    access_code TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'SAR',
    allow_comments BOOLEAN DEFAULT true,
    allow_rating BOOLEAN DEFAULT true,
    completion_certificate certificate_type DEFAULT 'none',
    
    -- Statistics
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول التفاعلات
-- ============================================
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type interaction_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    description TEXT,
    time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
    
    -- Question/Quiz specific
    question_text TEXT,
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 1,
    time_limit INTEGER,
    
    -- Explanation/Resource specific
    resources JSONB[],
    links JSONB[],
    
    -- Poll specific
    poll_question TEXT,
    poll_options JSONB[],
    
    -- Settings
    is_mandatory BOOLEAN DEFAULT true,
    show_feedback BOOLEAN DEFAULT true,
    feedback_text TEXT,
    
    -- Statistics
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    average_time_spent INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول التسجيلات
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
    
    -- Rating
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, student_id)
);

-- ============================================
-- جدول إجابات الطلاب
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
    time_spent INTEGER,
    attempts INTEGER DEFAULT 1,
    
    -- Feedback
    feedback_seen BOOLEAN DEFAULT false,
    
    -- Timestamps
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول جلسات الفصول التفاعلية
-- ============================================
CREATE TABLE classroom_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
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
    actual_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actual_end TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول المشاركين في الجلسات
-- ============================================
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participant status
    student_name TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK (role IN ('host', 'co-host', 'student')),
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    hand_raised BOOLEAN DEFAULT false,
    hand_raised_at TIMESTAMP WITH TIME ZONE,
    
    -- Participation stats
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    
    UNIQUE(session_id, student_id)
);

-- ============================================
-- جدول رسائل الدردشة
-- ============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message content
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachment_url TEXT,
    attachment_name TEXT,
    
    -- Metadata
    is_edited BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_announcement BOOLEAN DEFAULT false,
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- جدول لقطات السبورة
-- ============================================
CREATE TABLE whiteboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES classroom_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Whiteboard data
    data TEXT NOT NULL, -- Canvas data as base64
    thumbnail_url TEXT,
    width INTEGER DEFAULT 1200,
    height INTEGER DEFAULT 800,
    page_number INTEGER DEFAULT 1,
    
    -- Metadata
    name TEXT,
    description TEXT,
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول تقييمات الدورات
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
    is_verified_purchase BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, user_id)
);

-- ============================================
-- جدول إعدادات المستخدم
-- ============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preferences
    language TEXT DEFAULT 'ar',
    timezone TEXT DEFAULT 'Asia/Riyadh',
    date_format TEXT DEFAULT 'ar',
    time_format TEXT DEFAULT '24',
    autoplay BOOLEAN DEFAULT false,
    dark_mode BOOLEAN DEFAULT false,
    default_page TEXT DEFAULT 'dashboard',
    
    -- Notification settings
    email_new_student BOOLEAN DEFAULT true,
    email_course_complete BOOLEAN DEFAULT true,
    email_new_question BOOLEAN DEFAULT true,
    email_new_rating BOOLEAN DEFAULT true,
    app_new_message BOOLEAN DEFAULT true,
    app_hand_raise BOOLEAN DEFAULT true,
    app_reminders BOOLEAN DEFAULT true,
    app_updates BOOLEAN DEFAULT false,
    notification_frequency TEXT DEFAULT 'hourly',
    
    -- Privacy settings
    public_profile BOOLEAN DEFAULT true,
    show_email BOOLEAN DEFAULT false,
    search_visibility BOOLEAN DEFAULT true,
    public_courses BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- جدول سجل النشاطات
-- ============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- إنشاء الفهارس لتحسين الأداء
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_interactions_course_id ON interactions(course_id);
CREATE INDEX idx_interactions_time ON interactions(time_seconds);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_classroom_sessions_code ON classroom_sessions(session_code);
CREATE INDEX idx_classroom_sessions_status ON classroom_sessions(status);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at DESC);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- تم التهيئة بنجاح
-- ============================================
