/**
 * API: Users Endpoint
 * تعليمي - منصة التعلم التفاعلي
 */

let users = [
    {
        id: 'user1',
        email: 'teacher@ta3lemi.com',
        full_name: 'أحمد محمد',
        role: 'teacher',
        avatar_url: null,
        bio: 'معلم برمجة بخبرة 5 سنوات',
        created_at: '2026-01-01T10:00:00Z',
        updated_at: '2026-01-01T10:00:00Z'
    },
    {
        id: 'user2',
        email: 'student@example.com',
        full_name: 'محمد عبدالله',
        role: 'student',
        avatar_url: null,
        bio: 'طالب في علوم الحاسب',
        created_at: '2026-01-10T10:00:00Z',
        updated_at: '2026-01-10T10:00:00Z'
    }
];

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
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
        case 'PUT':
            return handlePut(req, res);
        default:
            res.status(405).json({
                success: false,
                error: 'Method Not Allowed'
            });
    }
}

function handleGet(req, res) {
    const { id, email } = req.query;
    
    if (id) {
        const user = users.find(u => u.id === id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'المستخدم غير موجود'
            });
        }
        
        // لا نرسل البريد الإلكتروني في الاستجابة العامة
        const { email, ...publicUser } = user;
        
        return res.status(200).json({
            success: true,
            data: publicUser
        });
    }
    
    if (email) {
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'المستخدم غير موجود'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    
    // جلب جميع المستخدمين (للمشرفين فقط)
    res.status(200).json({
        success: true,
        data: users.map(({ email, ...user }) => user)
    });
}

function handlePost(req, res) {
    const { email, full_name, password, role } = req.body;
    
    if (!email || !full_name || !password) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'البريد الإلكتروني والاسم وكلمة المرور مطلوبة'
        });
    }
    
    // التحقق من عدم وجود المستخدم مسبقاً
    if (users.some(u => u.email === email)) {
        return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: 'البريد الإلكتروني مستخدم بالفعل'
        });
    }
    
    const newUser = {
        id: `user${users.length + 1}`,
        email,
        full_name,
        role: role || 'student',
        avatar_url: null,
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // لا نرسل كلمة المرور في الاستجابة
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
        success: true,
        data: userWithoutPassword,
        message: 'تم إنشاء الحساب بنجاح'
    });
}

function handlePut(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'معرف المستخدم مطلوب'
        });
    }
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'المستخدم غير موجود'
        });
    }
    
    // تحديث البيانات
    const updatedUser = {
        ...users[userIndex],
        ...req.body,
        updated_at: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: 'تم تحديث الملف الشخصي بنجاح'
    });
}