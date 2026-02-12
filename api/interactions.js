/**
 * API: Interactions Endpoint
 * تعليمي - منصة التعلم التفاعلي
 */

let interactions = [
    {
        id: '1',
        course_id: '1',
        user_id: 'user1',
        type: 'question',
        title: 'اختبار فهم',
        content: 'ما هي لغة البرمجة التي ندرسها؟',
        time_seconds: 120,
        options: ['Python', 'Java', 'C++', 'JavaScript'],
        correct_answer: 0,
        points: 5,
        total_attempts: 45,
        correct_attempts: 38,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z'
    },
    {
        id: '2',
        course_id: '1',
        user_id: 'user1',
        type: 'explanation',
        title: 'معلومة إضافية',
        content: 'Python هي لغة برمجة عالية المستوى، سهلة التعلم وتستخدم في مجالات متعددة.',
        time_seconds: 300,
        resources: [
            {
                title: 'وثائق Python الرسمية',
                url: 'https://python.org'
            }
        ],
        created_at: '2026-01-15T10:05:00Z',
        updated_at: '2026-01-15T10:05:00Z'
    }
];

export default async function handler(req, res) {
    // إعداد CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // التحقق من المصادقة
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
        return;
    }
    
    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        case 'DELETE':
            return handleDelete(req, res);
        default:
            res.status(405).json({
                success: false,
                error: 'Method Not Allowed'
            });
    }
}

function handleGet(req, res) {
    const { courseId } = req.query;
    
    if (!courseId) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'معرف الدورة مطلوب'
        });
    }
    
    const courseInteractions = interactions.filter(i => i.course_id === courseId);
    
    res.status(200).json({
        success: true,
        data: courseInteractions
    });
}

function handlePost(req, res) {
    const { courseId } = req.query;
    const { type, title, content, time_seconds, options, correct_answer, points, resources } = req.body;
    
    if (!courseId || !type || !title || time_seconds === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'البيانات المطلوبة غير مكتملة'
        });
    }
    
    const newInteraction = {
        id: String(interactions.length + 1),
        course_id: courseId,
        user_id: 'user1',
        type,
        title,
        content: content || '',
        time_seconds,
        options: options || [],
        correct_answer: correct_answer || null,
        points: points || 1,
        resources: resources || [],
        total_attempts: 0,
        correct_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    interactions.push(newInteraction);
    
    res.status(201).json({
        success: true,
        data: newInteraction,
        message: 'تم إضافة التفاعل بنجاح'
    });
}

function handleDelete(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'معرف التفاعل مطلوب'
        });
    }
    
    const index = interactions.findIndex(i => i.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'التفاعل غير موجود'
        });
    }
    
    interactions.splice(index, 1);
    
    res.status(200).json({
        success: true,
        message: 'تم حذف التفاعل بنجاح'
    });
}