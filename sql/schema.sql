-- تفعيل الإضافات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول الملفات التعريفية للمستخدمين
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الدورات
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT,
    thumbnail_url TEXT,
    duration INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التفاعلات
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('question', 'quiz', 'explanation')),
    title TEXT,
    content JSONB,
    time_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تسجيل الطلاب في الدورات
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- جدول إجابات الطلاب على التفاعلات
CREATE TABLE IF NOT EXISTS student_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES interactions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل أمان الصفوف (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can CRUD their own courses" ON courses
    FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage interactions of their courses" ON interactions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM courses WHERE courses.id = interactions.course_id AND courses.teacher_id = auth.uid()
    ));

CREATE POLICY "Students can view interactions of enrolled courses" ON interactions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM enrollments WHERE enrollments.course_id = interactions.course_id AND enrollments.student_id = auth.uid()
    ));

CREATE POLICY "Students can enroll in courses" ON enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own enrollments" ON enrollments
    FOR SELECT USING (auth.uid() = student_id OR EXISTS (
        SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.teacher_id = auth.uid()
    ));

-- دالة لإنشاء ملف تعريفي تلقائياً عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();