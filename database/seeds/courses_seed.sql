-- ============================================
-- تعليمي - بيانات افتراضية للدورات
-- الإصدار: 1.0.0
-- التاريخ: 2026-02-13
-- ============================================

-- ============================================
-- 1. إضافة مستخدم افتراضي (معلم)
-- ============================================
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    bio,
    job_title,
    organization,
    location,
    email_verified,
    created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'teacher@ta3lemi.com',
    'أحمد محمد',
    'teacher',
    'معلم برمجة بخبرة 5 سنوات في تدريس Python و JavaScript. أسعى لجعل التعلم ممتعاً وتفاعلياً للجميع.',
    'معلم برمجة',
    'مدارس الرياض',
    'الرياض، السعودية',
    true,
    NOW() - INTERVAL '6 months'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. إضافة مستخدم افتراضي (طالب)
-- ============================================
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    bio,
    email_verified,
    created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'student@example.com',
    'محمد عبدالله',
    'student',
    'طالب في علوم الحاسب، مهتم بتعلم البرمجة وتطوير الويب.',
    true,
    NOW() - INTERVAL '3 months'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. إضافة دورات افتراضية
-- ============================================

-- دورة 1: مقدمة في البرمجة
INSERT INTO courses (
    id,
    user_id,
    title,
    slug,
    description,
    short_description,
    category,
    level,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    duration,
    status,
    access_type,
    total_students,
    total_interactions,
    average_rating,
    total_reviews,
    total_views,
    completion_rate,
    published_at,
    created_at,
    updated_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'مقدمة في البرمجة',
    'introduction-to-programming',
    'هذه الدورة مقدمة شاملة لعالم البرمجة. ستتعلم المفاهيم الأساسية التي تحتاجها للبدء في أي لغة برمجة، مع التركيز على التفكير المنطقي وحل المشكلات.',
    'دورة تعريفية عن أساسيات البرمجة للمبتدئين',
    'programming',
    'beginner',
    'https://www.youtube.com/watch?v=abc123',
    'abc123',
    'https://img.youtube.com/vi/abc123/0.jpg',
    3600,
    'published',
    'public',
    45,
    12,
    4.8,
    28,
    1200,
    78.5,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '2 months'
) ON CONFLICT (slug) DO NOTHING;

-- دورة 2: تعلم JavaScript
INSERT INTO courses (
    id,
    user_id,
    title,
    slug,
    description,
    short_description,
    category,
    level,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    duration,
    status,
    access_type,
    total_students,
    total_interactions,
    average_rating,
    total_reviews,
    total_views,
    completion_rate,
    published_at,
    created_at,
    updated_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'تعلم JavaScript من الصفر',
    'learn-javascript-from-scratch',
    'دورة شاملة في JavaScript تغطي أساسيات اللغة وصولاً إلى المفاهيم المتقدمة. ستتعلم كيفية إنشاء تطبيقات ويب تفاعلية.',
    'دورة متكاملة في JavaScript للمبتدئين والمتوسطين',
    'programming',
    'intermediate',
    'https://www.youtube.com/watch?v=def456',
    'def456',
    'https://img.youtube.com/vi/def456/0.jpg',
    5400,
    'published',
    'public',
    78,
    18,
    4.9,
    42,
    2100,
    82.3,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '1 month'
) ON CONFLICT (slug) DO NOTHING;

-- دورة 3: أساسيات HTML و CSS
INSERT INTO courses (
    id,
    user_id,
    title,
    slug,
    description,
    short_description,
    category,
    level,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    duration,
    status,
    access_type,
    total_students,
    total_interactions,
    average_rating,
    total_reviews,
    total_views,
    completion_rate,
    published_at,
    created_at,
    updated_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'أساسيات HTML و CSS',
    'html-css-basics',
    'تعلم كيفية بناء صفحات الويب باستخدام HTML و CSS. الدورة تغطي كل شيء من الهيكل الأساسي إلى التصميم المتجاوب.',
    'دورة تأسيسية في تصميم وتطوير الواجهات الأمامية',
    'design',
    'beginner',
    'https://www.youtube.com/watch?v=ghi789',
    'ghi789',
    'https://img.youtube.com/vi/ghi789/0.jpg',
    4800,
    'published',
    'public',
    62,
    15,
    4.7,
    31,
    1800,
    71.8,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '45 days'
) ON CONFLICT (slug) DO NOTHING;

-- دورة 4: قواعد البيانات MySQL
INSERT INTO courses (
    id,
    user_id,
    title,
    slug,
    description,
    short_description,
    category,
    level,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    duration,
    status,
    access_type,
    total_students,
    total_interactions,
    average_rating,
    total_reviews,
    total_views,
    completion_rate,
    published_at,
    created_at,
    updated_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'قواعد البيانات MySQL',
    'mysql-database',
    'تعلم كيفية تصميم وإدارة قواعد البيانات باستخدام MySQL. ستتعلم SQL، العلاقات، الاستعلامات المتقدمة، وتحسين الأداء.',
    'دورة شاملة في MySQL للمبرمجين',
    'programming',
    'intermediate',
    'https://www.youtube.com/watch?v=jkl012',
    'jkl012',
    'https://img.youtube.com/vi/jkl012/0.jpg',
    6000,
    'published',
    'private',
    34,
    14,
    4.6,
    19,
    950,
    65.4,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '20 days'
) ON CONFLICT (slug) DO NOTHING;

-- دورة 5: تصميم تجربة المستخدم
INSERT INTO courses (
    id,
    user_id,
    title,
    slug,
    description,
    short_description,
    category,
    level,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    duration,
    status,
    access_type,
    total_students,
    total_interactions,
    average_rating,
    total_reviews,
    total_views,
    completion_rate,
    published_at,
    created_at,
    updated_at
) VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'مقدمة في تصميم تجربة المستخدم',
    'ux-design-intro',
    'تعلم أساسيات تصميم تجربة المستخدم (UX) وكيفية إنشاء منتجات رقمية سهلة الاستخدام وممتعة.',
    'دورة تأسيسية في UX Design',
    'design',
    'beginner',
    'https://www.youtube.com/watch?v=mno345',
    'mno345',
    'https://img.youtube.com/vi/mno345/0.jpg',
    4200,
    'draft',
    'public',
    0,
    0,
    0,
    0,
    0,
    0,
    NULL,
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. إضافة تفاعلات للدورات
-- ============================================

-- تفاعلات دورة البرمجة
INSERT INTO interactions (
    id,
    course_id,
    user_id,
    type,
    title,
    content,
    time_seconds,
    options,
    correct_answer,
    points,
    total_attempts,
    correct_attempts
) VALUES (
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'question',
    'ما هي لغة البرمجة؟',
    'أي من اللغات التالية هي لغة برمجة؟',
    120,
    '["Python", "HTML", "CSS", "JSON"]',
    '0',
    5,
    45,
    38
);

INSERT INTO interactions (
    id,
    course_id,
    user_id,
    type,
    title,
    content,
    time_seconds,
    options,
    correct_answer,
    points,
    total_attempts,
    correct_attempts
) VALUES (
    'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'question',
    'ما ناتج 2 + 2 في البرمجة؟',
    'اختر الإجابة الصحيحة',
    300,
    '["3", "4", "5", "22"]',
    '1',
    5,
    45,
    42
);

INSERT INTO interactions (
    id,
    course_id,
    user_id,
    type,
    title,
    content,
    time_seconds,
    resources
) VALUES (
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'explanation',
    'ما هي الخوارزمية؟',
    'الخوارزمية هي مجموعة من الخطوات المنطقية المحددة لحل مشكلة معينة. يمكن تشبيهها بوصفة طبخ: لديك مكونات (مدخلات) وخطوات (عمليات) ونتيجة (مخرجات).',
    600,
    '[{"title": "مقدمة في الخوارزميات", "url": "https://example.com/algorithms"}, {"title": "فيديو شرح الخوارزميات", "url": "https://youtu.be/abc123"}]'
);

-- تفاعلات دورة JavaScript
INSERT INTO interactions (
    id,
    course_id,
    user_id,
    type,
    title,
    content,
    time_seconds,
    options,
    correct_answer,
    points
) VALUES (
    'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'question',
    'ما هي الكلمة المفتاحية لتعريف متغير في JavaScript؟',
    'اختر الإجابة الصحيحة',
    180,
    '["var", "let", "const", "جميع ما سبق"]',
    '3',
    5
);

INSERT INTO interactions (
    id,
    course_id,
    user_id,
    type,
    title,
    content,
    time_seconds,
    options,
    correct_answer,
    points
) VALUES (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'quiz',
    'اختبار JavaScript',
    'اختبر معلوماتك في JavaScript',
    900,
    '[{"question": "ما ناتج typeof []؟", "options": ["array", "object", "undefined", "null"], "correct": 1}, {"question": "أي من التالي يستخدم للتعامل مع الـ DOM؟", "options": ["document", "window", "navigator", "console"], "correct": 0}, {"question": "ما هي دالة إخراج النص في JavaScript؟", "options": ["print()", "console.log()", "echo()", "write()"], "correct": 1}]',
    '[1,0,1]',
    10
);

-- ============================================
-- 5. إضافة تسجيلات للطلاب
-- ============================================

INSERT INTO enrollments (
    id,
    course_id,
    student_id,
    progress,
    is_completed,
    enrolled_at,
    last_accessed_at,
    completed_at
) VALUES (
    'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    85,
    false,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '1 day',
    NULL
);

INSERT INTO enrollments (
    id,
    course_id,
    student_id,
    progress,
    is_completed,
    enrolled_at,
    last_accessed_at,
    completed_at
) VALUES (
    'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    100,
    true,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
);

-- ============================================
-- 6. إضافة تقييمات للدورات
-- ============================================

INSERT INTO course_ratings (
    id,
    course_id,
    user_id,
    enrollment_id,
    rating,
    review_title,
    review_content,
    pros,
    cons,
    created_at
) VALUES (
    'r1r1r1r1-r1r1-r1r1-r1r1-r1r1r1r1r1r1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
    5,
    'دورة ممتازة للمبتدئين',
    'الدورة شرحها واضح ومناسب للمبتدئين تماماً. التفاعلات كانت مفيدة جداً.',
    '["شرح مبسط", "أمثلة عملية", "تفاعلات مفيدة"]',
    '["أتمنى إضافة المزيد من التمارين"]',
    NOW() - INTERVAL '1 week'
);

INSERT INTO course_ratings (
    id,
    course_id,
    user_id,
    enrollment_id,
    rating,
    review_title,
    review_content,
    pros,
    cons,
    created_at
) VALUES (
    'r2r2r2r2-r2r2-r2r2-r2r2-r2r2r2r2r2r2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
    5,
    'أفضل دورة JavaScript',
    'الدورة شاملة ومتكاملة، تعلمت منها الكثير. المشاريع العملية كانت رائعة.',
    '["محتوى شامل", "مشاريع عملية", "أسلوب ممتع"]',
    '[]',
    NOW() - INTERVAL '2 days'
);

-- ============================================
-- 7. إضافة إجابات طلاب
-- ============================================

INSERT INTO student_responses (
    id,
    interaction_id,
    student_id,
    enrollment_id,
    answer,
    is_correct,
    score,
    time_spent,
    responded_at
) VALUES (
    's1s1s1s1-s1s1-s1s1-s1s1-s1s1s1s1s1s1',
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    '22222222-2222-2222-2222-222222222222',
    'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
    '0',
    true,
    5,
    12,
    NOW() - INTERVAL '2 weeks'
);

INSERT INTO student_responses (
    id,
    interaction_id,
    student_id,
    enrollment_id,
    answer,
    is_correct,
    score,
    time_spent,
    responded_at
) VALUES (
    's2s2s2s2-s2s2-s2s2-s2s2-s2s2s2s2s2s2',
    'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
    '
