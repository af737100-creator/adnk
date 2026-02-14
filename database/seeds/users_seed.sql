-- ============================================
-- تعليمي - بيانات افتراضية للمستخدمين
-- الإصدار: 1.0.0
-- التاريخ: 2026-02-14
-- ============================================

-- تفعيل UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- تنظيف البيانات السابقة (اختياري)
-- ============================================
-- TRUNCATE users CASCADE;

-- ============================================
-- إضافة مستخدمين تجريبيين
-- ============================================

-- 1. مدير النظام
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, twitter, linkedin, github, skills, email_verified,
    is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'admin@ta3lemi.com',
    'مدير النظام',
    'admin',
    'https://ui-avatars.com/api/?name=مدير+النظام&background=4361ee&color=fff&size=128',
    'مدير منصة تعليمي، مسؤول عن تطوير وإدارة المنصة.',
    'مدير تقني',
    'شركة تعليمي',
    'الرياض، السعودية',
    '+966501234567',
    'ta3lemi_admin',
    'admin-ta3lemi',
    'admin-dev',
    ARRAY['إدارة', 'تخطيط', 'تطوير', 'قيادة'],
    true,
    true,
    NOW() - INTERVAL '180 days',
    NOW() - INTERVAL '1 day'
) ON CONFLICT (email) DO NOTHING;

-- 2. معلم أول - برمجة
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, twitter, linkedin, github, skills, email_verified,
    is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'ahmed.teacher@ta3lemi.com',
    'أحمد محمد',
    'teacher',
    'https://ui-avatars.com/api/?name=أحمد+محمد&background=4361ee&color=fff&size=128',
    'معلم برمجة بخبرة 8 سنوات في تدريس Python و JavaScript و React. مؤسس مبادرة "تعلم البرمجة بالعربية".',
    'معلم برمجة أول',
    'أكاديمية البرمجة',
    'جدة، السعودية',
    '+966502345678',
    'ahmed_python',
    'ahmed-mohammed',
    'ahmed-dev',
    ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'تدريس'],
    true,
    true,
    NOW() - INTERVAL '365 days',
    NOW() - INTERVAL '5 hours'
) ON CONFLICT (email) DO NOTHING;

-- 3. معلمة - تصميم
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, twitter, linkedin, github, skills, email_verified,
    is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'sara.design@ta3lemi.com',
    'سارة عبدالله',
    'teacher',
    'https://ui-avatars.com/api/?name=سارة+عبدالله&background=861efd&color=fff&size=128',
    'مصممة جرافيك ومطورة واجهات مستخدم. متخصصة في تصميم تجارب المستخدم وتدريس Figma و Adobe XD.',
    'مصممة ومطورة واجهات',
    'وكالة الإبداع',
    'الرياض، السعودية',
    '+966503456789',
    'sara_ux',
    'sara-abdullah',
    'sara-creative',
    ARRAY['UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'CSS', 'تصميم تفاعلي'],
    true,
    true,
    NOW() - INTERVAL '300 days',
    NOW() - INTERVAL '2 hours'
) ON CONFLICT (email) DO NOTHING;

-- 4. معلم - قواعد بيانات
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, twitter, linkedin, github, skills, email_verified,
    is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'khaled.sql@ta3lemi.com',
    'خالد العتيبي',
    'teacher',
    'https://ui-avatars.com/api/?name=خالد+العتيبي&background=10b981&color=fff&size=128',
    'مهندس قواعد بيانات وخبير في SQL. درب أكثر من 5000 طالب على تصميم وإدارة قواعد البيانات.',
    'خبير قواعد بيانات',
    'جامعة الملك سعود',
    'الرياض، السعودية',
    '+966504567890',
    'khaled_db',
    'khaled-alotaibi',
    'khaled-sql',
    ARRAY['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'تحليل بيانات'],
    true,
    true,
    NOW() - INTERVAL '200 days',
    NOW() - INTERVAL '1 day'
) ON CONFLICT (email) DO NOTHING;

-- 5. معلمة - لغات
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, twitter, linkedin, github, skills, email_verified,
    is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'fatima.english@ta3lemi.com',
    'فاطمة علي',
    'teacher',
    'https://ui-avatars.com/api/?name=فاطمة+علي&background=f59e0b&color=fff&size=128',
    'معلمة لغة إنجليزية بخبرة 10 سنوات. متخصصة في تدريس اللغة للأعمال والتحضير لاختبار IELTS.',
    'معلمة لغة إنجليزية',
    'مدارس الرياض',
    'الرياض، السعودية',
    '+966505678901',
    'fatima_english',
    'fatima-ali',
    NULL,
    ARRAY['IELTS', 'TOEFL', 'English for Business', 'ترجمة', 'تدريس'],
    true,
    true,
    NOW() - INTERVAL '150 days',
    NOW() - INTERVAL '3 hours'
) ON CONFLICT (email) DO NOTHING;

-- 6. طالب متقدم
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, skills, email_verified, is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'mohamed.student@example.com',
    'محمد عبدالرحمن',
    'student',
    'https://ui-avatars.com/api/?name=محمد+عبدالرحمن&background=64748b&color=fff&size=128',
    'طالب في السنة النهائية لتقنية المعلومات. مهتم بتعلم البرمجة وتطوير الويب.',
    'طالب تقنية معلومات',
    'جامعة الملك عبدالعزيز',
    'جدة، السعودية',
    '+966506789012',
    ARRAY['HTML', 'CSS', 'JavaScript', 'مبتدئ'],
    true,
    true,
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '6 hours'
) ON CONFLICT (email) DO NOTHING;

-- 7. طالبة نشيطة
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, skills, email_verified, is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'noura.student@example.com',
    'نورة سعد',
    'student',
    'https://ui-avatars.com/api/?name=نورة+سعد&background=64748b&color=fff&size=128',
    'طالبة تصميم جرافيك، أتعلم تطوير واجهات المستخدم لتحسين مهاراتي في التصميم.',
    'طالبة تصميم',
    'جامعة الأميرة نورة',
    'الرياض، السعودية',
    '+966507890123',
    ARRAY['Figma', 'تصميم', 'UI/UX', 'HTML/CSS مبتدئ'],
    true,
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '1 hour'
) ON CONFLICT (email) DO NOTHING;

-- 8. طالب - مبتدئ
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, email_verified, is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'fahad.learner@example.com',
    'فهد سعيد',
    'student',
    'https://ui-avatars.com/api/?name=فهد+سعيد&background=64748b&color=fff&size=128',
    'مهتم بتعلم البرمجة من الصفر.',
    true,
    true,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (email) DO NOTHING;

-- 9. معلم مساعد
INSERT INTO users (
    id, email, full_name, role, avatar_url, bio, job_title, organization,
    location, phone, skills, email_verified, is_active, created_at, last_login
) VALUES (
    uuid_generate_v4(),
    'abdullah.assist@ta3lemi.com',
    'عبدالله إبراهيم',
    'assistant',
    'https://ui-avatars.com/api/?name=عبدالله+إبراهيم&background=8b5cf6&color=fff&size=128',
    'معلم مساعد في أكاديمية البرمجة. أساعد الطلاب في حل المشكلات وفهم المفاهيم.',
    'معلم مساعد',
    'أكاديمية البرمجة',
    'الدمام، السعودية',
    '+966508901234',
    ARRAY['Python', 'JavaScript', 'مساعدة', 'تدريس'],
    true,
    true,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '4 hours'
) ON CONFLICT (email) DO NOTHING;

-- 10. مستخدم غير نشط
INSERT INTO users (
    id, email, full_name, role, avatar_url, email_verified, is_active, created_at
) VALUES (
    uuid_generate_v4(),
    'inactive.user@example.com',
    'مستخدم غير نشط',
    'student',
    'https://ui-avatars.com/api/?name=مستخدم+غير+نشط&background=94a3b8&color=fff&size=128',
    false,
    false,
    NOW() - INTERVAL '200 days'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- إضافة إعدادات للمستخدمين
-- ============================================

-- إعدادات لمدير النظام
INSERT INTO user_settings (user_id, language, timezone, dark_mode, default_page, notification_frequency)
SELECT id, 'ar', 'Asia/Riyadh', true, 'dashboard', 'instant'
FROM users WHERE email = 'admin@ta3lemi.com'
ON CONFLICT (user_id) DO NOTHING;

-- إعدادات لأحمد المعلم
INSERT INTO user_settings (user_id, language, timezone, autoplay, default_page, email_new_student, email_course_complete, app_new_message, app_hand_raise)
SELECT id, 'ar', 'Asia/Riyadh', true, 'courses', true, true, true, true
FROM users WHERE email = 'ahmed.teacher@ta3lemi.com'
ON CONFLICT (user_id) DO NOTHING;

-- إعدادات لسارة
INSERT INTO user_settings (user_id, language, timezone, dark_mode, default_page, email_new_rating, app_reminders)
SELECT id, 'ar', 'Asia/Riyadh', true, 'dashboard', true, true
FROM users WHERE email = 'sara.design@ta3lemi.com'
ON CONFLICT (user_id) DO NOTHING;

-- إعدادات لمحمد الطالب
INSERT INTO user_settings (user_id, language, timezone, autoplay, default_page, notification_frequency)
SELECT id, 'ar', 'Asia/Riyadh', true, 'courses', 'daily'
FROM users WHERE email = 'mohamed.student@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- إضافة بعض الإنجازات للمستخدمين
-- ============================================

-- إنجازات لأحمد المعلم
INSERT INTO achievements (code, name, description, icon, category, points) VALUES
('FIRST_COURSE', 'أول دورة', 'نشر أول دورة تفاعلية', '🎓', 'teacher', 10),
('TEN_COURSES', 'معلم متمرس', 'نشر 10 دورات تفاعلية', '🏆', 'teacher', 50),
('HUNDRED_STUDENTS', 'مؤثر', 'وصل عدد طلابك إلى 100', '👥', 'teacher', 30),
('FIVE_STARS', 'معلم متميز', 'حصلت على 10 تقييمات 5 نجوم', '⭐', 'teacher', 40)
ON CONFLICT (code) DO NOTHING;

-- منح الإنجازات
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u.id, a.id, NOW() - INTERVAL '30 days'
FROM users u, achievements a
WHERE u.email = 'ahmed.teacher@ta3lemi.com' AND a.code = 'FIRST_COURSE'
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u.id, a.id, NOW() - INTERVAL '15 days'
FROM users u, achievements a
WHERE u.email = 'ahmed.teacher@ta3lemi.com' AND a.code = 'HUNDRED_STUDENTS'
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u.id, a.id, NOW() - INTERVAL '5 days'
FROM users u, achievements a
WHERE u.email = 'ahmed.teacher@ta3lemi.com' AND a.code = 'FIVE_STARS'
ON CONFLICT DO NOTHING;

-- ============================================
-- إضافة سجل نشاطات
-- ============================================

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_data, created_at)
SELECT 
    id,
    'login',
    'user',
    id,
    jsonb_build_object('ip', '192.168.1.1', 'browser', 'Chrome'),
    NOW() - INTERVAL '1 day'
FROM users WHERE email = 'ahmed.teacher@ta3lemi.com';

INSERT INTO activity_logs (user_id, action, entity_type, new_data, created_at)
SELECT 
    id,
    'course_created',
    'course',
    jsonb_build_object('title', 'دورة JavaScript'),
    NOW() - INTERVAL '10 days'
FROM users WHERE email = 'ahmed.teacher@ta3lemi.com';

INSERT INTO activity_logs (user_id, action, entity_type, new_data, created_at)
SELECT 
    id,
    'course_published',
    'course',
    jsonb_build_object('title', 'دورة JavaScript'),
    NOW() - INTERVAL '8 days'
FROM users WHERE email = 'ahmed.teacher@ta3lemi.com';

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_data, created_at)
SELECT 
    u.id,
    'enroll',
    'course',
    c.id,
    jsonb_build_object('course_title', c.title),
    NOW() - INTERVAL '3 days'
FROM users u, courses c
WHERE u.email = 'mohamed.student@example.com' AND c.title = 'مقدمة في البرمجة باستخدام Python'
LIMIT 1;

-- ============================================
-- إضافة بعض الإشعارات
-- ============================================

INSERT INTO notifications (user_id, type, title, message, created_at)
SELECT 
    id,
    'info',
    'مرحباً بك في تعليمي',
    'نرحب بك في منصة تعليمي. ابدأ رحلتك التعليمية الآن!',
    NOW() - INTERVAL '180 days'
FROM users WHERE email = 'admin@ta3lemi.com';

INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
SELECT 
    u.id,
    'success',
    'تم نشر دورتك بنجاح',
    'دورة "مقدمة في البرمجة" أصبحت متاحة للطلاب الآن.',
    '/pages/courses/1',
    NOW() - INTERVAL '58 days'
FROM users u WHERE u.email = 'ahmed.teacher@ta3lemi.com';

INSERT INTO notifications (user_id, type, title, message, created_at)
SELECT 
    u.id,
    'achievement',
    'إنجاز جديد!',
    'لقد حصلت على إنجاز "أول دورة"',
    NOW() - INTERVAL '30 days'
FROM users u WHERE u.email = 'ahmed.teacher@ta3lemi.com';

INSERT INTO notifications (user_id, type, title, message, created_at)
SELECT 
    u.id,
    'warning',
    'طالب جديد انضم لدورتك',
    'انضم محمد عبدالرحمن إلى دورة "مقدمة في البرمجة"',
    NOW() - INTERVAL '3 days'
FROM users u WHERE u.email = 'ahmed.teacher@ta3lemi.com';

-- ============================================
-- إضافة سجل دخول
-- ============================================

INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, os, location, logged_in_at)
SELECT 
    id,
    '192.168.1.100'::inet,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'desktop',
    'Chrome',
    'Windows 10',
    'Riyadh, Saudi Arabia',
    NOW() - INTERVAL '1 hour'
FROM users WHERE email = 'ahmed.teacher@ta3lemi.com';

INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, os, logged_in_at)
SELECT 
    id,
    '192.168.1.101'::inet,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    'mobile',
    'Safari',
    'iOS',
    NOW() - INTERVAL '1 day'
FROM users WHERE email = 'mohamed.student@example.com';

-- ============================================
-- إحصائيات
-- ============================================
SELECT 
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE role = 'admin') AS admins,
    COUNT(*) FILTER (WHERE role = 'teacher') AS teachers,
    COUNT(*) FILTER (WHERE role = 'student') AS students,
    COUNT(*) FILTER (WHERE is_active = true) AS active_users,
    COUNT(*) FILTER (WHERE email_verified = true) AS verified_users
FROM users;

-- ============================================
-- تم إضافة بيانات المستخدمين التجريبية بنجاح
-- ============================================
SELECT '✅ تم إضافة بيانات المستخدمين التجريبية بنجاح' AS result;