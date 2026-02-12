/**
 * API: Classroom Sessions Endpoint
 * تعليمي - منصة التعلم التفاعلي
 */

let sessions = [
    {
        id: '1',
        session_code: 'ABC123',
        teacher_id: 'user1',
        course_id: '1',
        title: 'مراجعة البرمجة',
        description: 'جلسة مراجعة للاختبار النهائي',
        status: 'active',
        max_participants: 50,
        total_participants: 12,
        allow_chat: true,
        allow_whiteboard: true,
        allow_screen_sharing: true,
        allow_hand_raise: true,
        created_at: '2026-02-13T14:00:00Z',
        actual_start: '2026-02-13T15:00:00Z',
        scheduled_end: '2026-02-13T16:00:00Z'
    }
];

let participants = [
    {
        id: '1',
        session_id: '1',
        student_id: 'user2',
        student_name: 'محمد عبدالله',
        joined_at: '2026-02-13T15:02:00Z',
        hand_raised: false
    }
];

let messages = [
    {
        id: '1',
        session_id: '1',
        sender_id: 'user2',
        sender_name: 'محمد عبدالله',
        message: 'مرحباً بالجميع',
        sent_at: '2026-02-13T15:03:00Z'
    }
];

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    
    const path = req.url.split('?')[0];
    
    if (path.includes('/sessions')) {
        return handleSessions(req, res);
    } else if (path.includes('/join')) {
        return handleJoin(req, res);
    } else if (path.includes('/messages')) {
        return handleMessages(req, res);
    } else if (path.includes('/participants')) {
        return handleParticipants(req, res);
    }
    
    res.status(404).json({
        success: false,
        error: 'Not Found'
    });
}

/**
 * إدارة الجلسات
 */
function handleSessions(req, res) {
    switch (req.method) {
        case 'GET':
            return getSessions(req, res);
        case 'POST':
            return createSession(req, res);
        case 'PUT':
            return updateSession(req, res);
        case 'DELETE':
            return deleteSession(req, res);
        default:
            res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
}

function getSessions(req, res) {
    const { id, code, active } = req.query;
    
    if (id) {
        const session = sessions.find(s => s.id === id);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }
        return res.status(200).json({ success: true, data: session });
    }
    
    if (code) {
        const session = sessions.find(s => s.session_code === code);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }
        return res.status(200).json({ success: true, data: session });
    }
    
    let filteredSessions = [...sessions];
    
    if (active === 'true') {
        filteredSessions = filteredSessions.filter(s => s.status === 'active');
    }
    
    res.status(200).json({
        success: true,
        data: filteredSessions
    });
}

function createSession(req, res) {
    const { title, description, course_id, scheduled_duration, max_participants, settings } = req.body;
    
    if (!title) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'عنوان الجلسة مطلوب'
        });
    }
    
    // إنشاء كود فريد
    let sessionCode;
    do {
        sessionCode = generateSessionCode();
    } while (sessions.some(s => s.session_code === sessionCode));
    
    const now = new Date();
    const endTime = new Date(now.getTime() + (scheduled_duration || 60) * 60000);
    
    const newSession = {
        id: String(sessions.length + 1),
        session_code: sessionCode,
        teacher_id: 'user1',
        course_id: course_id || null,
        title,
        description: description || '',
        status: 'active',
        max_participants: max_participants || 100,
        total_participants: 0,
        total_messages: 0,
        ...settings,
        created_at: now.toISOString(),
        actual_start: now.toISOString(),
        scheduled_end: endTime.toISOString()
    };
    
    sessions.push(newSession);
    
    res.status(201).json({
        success: true,
        data: newSession,
        message: 'تم إنشاء الجلسة بنجاح'
    });
}

function updateSession(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ success: false, error: 'Session ID required' });
    }
    
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    const updatedSession = {
        ...sessions[index],
        ...req.body,
        updated_at: new Date().toISOString()
    };
    
    if (req.body.status === 'ended') {
        updatedSession.actual_end = new Date().toISOString();
    }
    
    sessions[index] = updatedSession;
    
    res.status(200).json({
        success: true,
        data: updatedSession,
        message: 'تم تحديث الجلسة'
    });
}

function deleteSession(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ success: false, error: 'Session ID required' });
    }
    
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    sessions.splice(index, 1);
    participants = participants.filter(p => p.session_id !== id);
    messages = messages.filter(m => m.session_id !== id);
    
    res.status(200).json({
        success: true,
        message: 'تم حذف الجلسة'
    });
}

/**
 * الانضمام إلى جلسة
 */
function handleJoin(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    const { code, user_id, user_name } = req.body;
    
    if (!code || !user_id || !user_name) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'كود الجلسة ومعرف المستخدم والاسم مطلوبون'
        });
    }
    
    const session = sessions.find(s => s.session_code === code && s.status === 'active');
    
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'الجلسة غير موجودة أو غير نشطة'
        });
    }
    
    // التحقق من عدم الانضمام المكرر
    if (participants.some(p => p.session_id === session.id && p.student_id === user_id)) {
        return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: 'المستخدم موجود بالفعل في الجلسة'
        });
    }
    
    // التحقق من عدد المشاركين
    const currentParticipants = participants.filter(p => p.session_id === session.id).length;
    if (currentParticipants >= session.max_participants) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'الجلسة ممتلئة'
        });
    }
    
    const participant = {
        id: String(participants.length + 1),
        session_id: session.id,
        student_id: user_id,
        student_name: user_name,
        joined_at: new Date().toISOString(),
        hand_raised: false
    };
    
    participants.push(participant);
    
    // تحديث عدد المشاركين في الجلسة
    const sessionIndex = sessions.findIndex(s => s.id === session.id);
    sessions[sessionIndex].total_participants = currentParticipants + 1;
    
    res.status(200).json({
        success: true,
        data: {
            session,
            participant
        },
        message: 'تم الانضمام إلى الجلسة'
    });
}

/**
 * إدارة الرسائل
 */
function handleMessages(req, res) {
    switch (req.method) {
        case 'GET':
            return getMessages(req, res);
        case 'POST':
            return sendMessage(req, res);
        default:
            res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
}

function getMessages(req, res) {
    const { sessionId, limit = 50 } = req.query;
    
    if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Session ID required' });
    }
    
    const sessionMessages = messages
        .filter(m => m.session_id === sessionId)
        .slice(-limit)
        .reverse();
    
    res.status(200).json({
        success: true,
        data: sessionMessages
    });
}

function sendMessage(req, res) {
    const { session_id, sender_id, sender_name, message } = req.body;
    
    if (!session_id || !sender_id || !sender_name || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const newMessage = {
        id: String(messages.length + 1),
        session_id,
        sender_id,
        sender_name,
        message,
        sent_at: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    // تحديث عداد الرسائل في الجلسة
    const sessionIndex = sessions.findIndex(s => s.id === session_id);
    if (sessionIndex !== -1) {
        sessions[sessionIndex].total_messages = (sessions[sessionIndex].total_messages || 0) + 1;
    }
    
    res.status(201).json({
        success: true,
        data: newMessage,
        message: 'تم إرسال الرسالة'
    });
}

/**
 * إدارة المشاركين
 */
function handleParticipants(req, res) {
    switch (req.method) {
        case 'GET':
            return getParticipants(req, res);
        case 'PUT':
            return updateParticipant(req, res);
        default:
            res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
}

function getParticipants(req, res) {
    const { sessionId } = req.query;
    
    if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Session ID required' });
    }
    
    const sessionParticipants = participants.filter(p => p.session_id === sessionId);
    
    res.status(200).json({
        success: true,
        data: sessionParticipants
    });
}

function updateParticipant(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ success: false, error: 'Participant ID required' });
    }
    
    const index = participants.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    
    const updatedParticipant = {
        ...participants[index],
        ...req.body
    };
    
    participants[index] = updatedParticipant;
    
    res.status(200).json({
        success: true,
        data: updatedParticipant
    });
}

/**
 * توليد كود جلسة فريد
 */
function generateSessionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}